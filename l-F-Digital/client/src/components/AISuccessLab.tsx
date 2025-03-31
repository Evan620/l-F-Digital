import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, X, Loader2, AlertCircle, 
  Copy, ArrowRight, RefreshCw, CheckCircle, Clock,
  Download, Share2, Lightbulb, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { type CaseStudy } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AISuccessLabProps {
  initialIndustry?: string;
}

export default function AISuccessLab({ initialIndustry = '' }: AISuccessLabProps) {
  const { toast } = useToast();
  const [businessPainPoint, setBusinessPainPoint] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [customCaseStudy, setCustomCaseStudy] = useState<CaseStudy | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [industry, setIndustry] = useState(initialIndustry || 'technology');
  const [companySize, setCompanySize] = useState('medium');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Listen for voice input (simulated)
  const startVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    
    setIsListening(true);
    toast({
      title: "Voice recognition activated",
      description: "Please speak your business challenge",
    });
    
    // Simulate receiving voice input after 3 seconds
    timerRef.current = setTimeout(() => {
      const simulatedInput = "We're struggling with manual data entry that takes hours every day";
      setBusinessPainPoint(simulatedInput);
      setIsListening(false);
      
      toast({
        title: "Voice input received",
        description: "You can edit the text if needed",
      });
    }, 3000);
  };
  
  // Handle generating a custom case study
  const generateCustomCaseStudy = async () => {
    if (!businessPainPoint.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your business challenge first",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 400);
    
    try {
      // Make actual API request to generate case study
      const response = await apiRequest('POST', '/api/ai/generate-case-study', {
        query: businessPainPoint,
        industry: industry,
        companySize: companySize
      });
      
      const data = await response.json();
      
      // Finish progress animation
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Short delay before showing results
      setTimeout(() => {
        setCustomCaseStudy(data.caseStudy);
        setShowResultsDialog(true);
        setIsGenerating(false);
      }, 500);
      
    } catch (error) {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
      
      toast({
        title: "Generation failed",
        description: "We couldn't create a customized case study. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };
  
  // Copy the generated roadmap
  const copyRoadmap = () => {
    if (!customCaseStudy) return;
    
    const roadmapText = `
      Custom Success Roadmap for ${companySize.charAt(0).toUpperCase() + companySize.slice(1)} ${industry.charAt(0).toUpperCase() + industry.slice(1)} Business
      
      Challenge: ${customCaseStudy.challenge}
      
      Solution: ${customCaseStudy.solution}
      
      Expected Results: ${customCaseStudy.results}
      
      Timeline: ${customCaseStudy.metrics?.timeframe || '3-6 months'}
      Projected ROI: ${customCaseStudy.metrics?.roi || '150-200%'}
    `.trim();
    
    navigator.clipboard.writeText(roadmapText);
    
    toast({
      title: "Copied to clipboard",
      description: "The success roadmap has been copied to your clipboard"
    });
  };
  
  // Reset the form
  const resetForm = () => {
    setBusinessPainPoint('');
    setCustomCaseStudy(null);
    setShowResultsDialog(false);
    setShowVideoPreview(false);
    setGenerationProgress(0);
  };
  
  return (
    <div className="w-full bg-gradient-to-br from-neutral-900 to-neutral-900/95 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-secondary-900/50 flex items-center justify-center mr-3">
              <Sparkles className="h-5 w-5 text-secondary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Success Lab</h2>
              <p className="text-neutral-400 text-sm">Clone our success stories for your specific needs</p>
            </div>
          </div>
        </div>
        
        {/* Input section - only show if not displaying results */}
        <AnimatePresence mode="wait">
          {!showResultsDialog && (
            <motion.div
              key="input-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-neutral-300 mb-2">
                    Your Industry
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <Button 
                      type="button"
                      variant={industry === 'technology' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setIndustry('technology')}
                      className="justify-start"
                    >
                      <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                      Technology
                    </Button>
                    <Button 
                      type="button"
                      variant={industry === 'finance' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setIndustry('finance')}
                      className="justify-start"
                    >
                      <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>
                      Finance
                    </Button>
                    <Button 
                      type="button"
                      variant={industry === 'retail' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setIndustry('retail')}
                      className="justify-start"
                    >
                      <span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
                      Retail
                    </Button>
                    <Button 
                      type="button"
                      variant={industry === 'healthcare' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setIndustry('healthcare')}
                      className="justify-start"
                    >
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      Healthcare
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="company-size" className="block text-sm font-medium text-neutral-300 mb-2">
                    Company Size
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <Button 
                      type="button"
                      variant={companySize === 'small' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCompanySize('small')}
                    >
                      Small
                    </Button>
                    <Button 
                      type="button"
                      variant={companySize === 'medium' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCompanySize('medium')}
                    >
                      Medium
                    </Button>
                    <Button 
                      type="button"
                      variant={companySize === 'enterprise' ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCompanySize('enterprise')}
                    >
                      Enterprise
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="business-challenge" className="block text-sm font-medium text-neutral-300">
                      Describe Your Business Challenge
                    </label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={startVoiceInput}
                      className={isListening ? "text-secondary-400 animate-pulse" : "text-neutral-400"}
                    >
                      {isListening ? "Listening..." : "Voice Input"}
                      <span className="relative ml-2">
                        {isListening ? (
                          <motion.span
                            className="absolute -top-1 -right-1 flex h-3 w-3"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-500"></span>
                          </motion.span>
                        ) : null}
                      </span>
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Textarea
                      id="business-challenge"
                      value={businessPainPoint}
                      onChange={(e) => setBusinessPainPoint(e.target.value)}
                      placeholder="e.g., We spend hours on manual data entry that's error-prone and takes our team away from more important tasks..."
                      className="min-h-[120px] bg-neutral-800 border-neutral-700 placeholder:text-neutral-500"
                    />
                    <AnimatePresence>
                      {businessPainPoint && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute right-3 bottom-3"
                        >
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => setBusinessPainPoint('')}
                            className="h-8 w-8 rounded-full text-neutral-400 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2">
                {isGenerating ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-400">Generating your custom roadmap...</span>
                      <span className="text-sm font-medium text-secondary-400">{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                  </div>
                ) : (
                  <Button 
                    type="button" 
                    onClick={generateCustomCaseStudy}
                    className="space-x-2"
                    disabled={!businessPainPoint.trim()}
                  >
                    <span>Generate Your Success Story</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Example prompt suggestions */}
              <div className="pt-4 border-t border-neutral-800">
                <h3 className="text-sm font-medium text-neutral-400 mb-3">Example Challenges:</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start text-sm h-auto py-2 px-3 border-dashed border-neutral-700 hover:border-secondary-500 text-left"
                    onClick={() => setBusinessPainPoint("Our customer support team can't keep up with the volume of tickets, and we're losing customers due to slow response times.")}
                  >
                    <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 text-secondary-400" />
                    <span className="truncate">Customer support team overwhelmed with tickets, losing customers to slow responses</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start text-sm h-auto py-2 px-3 border-dashed border-neutral-700 hover:border-secondary-500 text-left"
                    onClick={() => setBusinessPainPoint("Our sales team wastes 40% of their time on data entry instead of talking to prospects, and our CRM data is always outdated.")}
                  >
                    <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 text-secondary-400" />
                    <span className="truncate">Sales spending 40% of time on data entry, CRM constantly outdated</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Results Dialog */}
          {showResultsDialog && customCaseStudy && (
            <motion.div
              key="results-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="relative overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-500 to-primary-500"></div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <span className="w-2 h-2 rounded-full bg-secondary-500 mr-2"></span>
                      Your Success Roadmap
                    </h3>
                    <Button variant="ghost" size="icon" onClick={resetForm}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Personalized intro */}
                    <div className="bg-neutral-800/70 p-4 rounded-md border border-neutral-700">
                      <h4 className="font-medium text-white mb-2 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-secondary-400" />
                        {companySize.charAt(0).toUpperCase() + companySize.slice(1)} {industry.charAt(0).toUpperCase() + industry.slice(1)} Business
                      </h4>
                      <p className="text-neutral-300 text-sm">
                        Based on your challenge: "{businessPainPoint.substring(0, 100)}..."
                      </p>
                    </div>
                    
                    {/* Challenge */}
                    <div>
                      <h4 className="text-sm font-medium text-neutral-400 mb-2">The Challenge</h4>
                      <p className="text-white">{customCaseStudy.challenge}</p>
                    </div>
                    
                    {/* Our Solution */}
                    <div>
                      <h4 className="text-sm font-medium text-neutral-400 mb-2">Your Solution</h4>
                      <div className="bg-neutral-800 rounded-md p-4 border border-neutral-700">
                        <p className="text-white">{customCaseStudy.solution}</p>
                      </div>
                    </div>
                    
                    {/* Expected Results */}
                    <div className="relative">
                      <h4 className="text-sm font-medium text-neutral-400 mb-2">Expected Results</h4>
                      <div className="bg-gradient-to-br from-secondary-900/30 to-primary-900/30 rounded-md p-4 border border-secondary-800/30">
                        <p className="text-white">{customCaseStudy.results}</p>
                        
                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-secondary-500/20 flex items-center justify-center mr-2">
                              <TrendingUp className="h-4 w-4 text-secondary-400" />
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400">Projected ROI</p>
                              <p className="text-lg font-bold text-white">{customCaseStudy.metrics?.roi || '150-200%'}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center mr-2">
                              <Clock className="h-4 w-4 text-primary-400" />
                            </div>
                            <div>
                              <p className="text-xs text-neutral-400">Implementation Time</p>
                              <p className="text-lg font-bold text-white">{customCaseStudy.metrics?.timeframe || '3-6 months'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Background decoration */}
                      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-24 h-24 bg-secondary-500/10 rounded-full filter blur-2xl pointer-events-none"></div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button 
                        onClick={copyRoadmap}
                        variant="outline"
                        className="flex-1 md:flex-none"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        <span className="whitespace-nowrap">Copy Roadmap</span>
                      </Button>
                      
                      <Button 
                        variant="secondary"
                        className="flex-1 md:flex-none"
                        onClick={() => setShowVideoPreview(true)}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        <span className="whitespace-nowrap">Share Summary</span>
                      </Button>
                      
                      <Button
                        variant="default"
                        className="flex-1 md:flex-none"
                      >
                        <span className="whitespace-nowrap">Contact Us</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={resetForm}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Another Success Story
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Video Sharing Preview Modal */}
      <AnimatePresence>
        {showVideoPreview && customCaseStudy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-neutral-900 rounded-xl border border-neutral-700 max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="font-bold text-white">30-Second Summary</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowVideoPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-6">
                <div className="aspect-video bg-neutral-800 rounded-lg mb-6 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-secondary-500/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-secondary-400" />
                      </div>
                      <p className="text-white font-medium">Video Summary Ready</p>
                      <p className="text-neutral-400 text-sm">Share your success story in 30 seconds</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="share-title" className="text-sm text-neutral-400">Title</label>
                    <Input 
                      id="share-title"
                      defaultValue={`How ${companySize.charAt(0).toUpperCase() + companySize.slice(1)} ${industry.charAt(0).toUpperCase() + industry.slice(1)} Businesses Achieved ${customCaseStudy.metrics?.roi || '150%'} ROI`}
                      className="bg-neutral-800 border-neutral-700"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="share-description" className="text-sm text-neutral-400">Description</label>
                    <Textarea 
                      id="share-description"
                      defaultValue={`See how a business like yours overcame "${businessPainPoint.substring(0, 40)}..." and achieved exceptional results with LÆF Digital's solutions.`}
                      className="bg-neutral-800 border-neutral-700 min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button variant="outline" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="secondary" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Link
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}