import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import {
  Bot, Zap, Brain, Code, BarChart, Sparkles,
  MessageSquare, CheckCircle, PenTool, Share, Layers
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import GoogleCalendarBooking from '@/components/GoogleCalendarBooking';

export default function AITools() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('service-advisor');
  const [businessChallenge, setBusinessChallenge] = useState('');
  const [caseStudyQuery, setCaseStudyQuery] = useState('');
  const [recommendedServices, setRecommendedServices] = useState<any[]>([]);
  const [generatedCaseStudy, setGeneratedCaseStudy] = useState<any | null>(null);
  const [roiCalculationData, setRoiCalculationData] = useState({
    industry: '',
    annualRevenue: '',
    businessGoal: '',
    teamSize: 5,
    automationLevel: 'medium',
    implementationTimeline: 'medium'
  });
  const [roiProjection, setRoiProjection] = useState<any | null>(null);
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false);
  const [serviceTypeForBooking, setServiceTypeForBooking] = useState('');
  
  // Service recommendation mutation
  const serviceRecommendationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        'POST', 
        '/api/ai/service-recommendation', 
        { businessChallenge }
      );
      return res.json();
    },
    onSuccess: (data) => {
      setRecommendedServices(data.serviceSuggestions || []);
      toast({
        title: "AI Analysis Complete",
        description: "We've analyzed your business challenge and found some recommendations.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
      console.error("Error generating service recommendations:", error);
    }
  });
  
  // Case study generation mutation
  const caseStudyGenerationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        'POST', 
        '/api/ai/generate-case-study', 
        { query: caseStudyQuery }
      );
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedCaseStudy(data.caseStudy || null);
      toast({
        title: "Case Study Generated",
        description: "We've generated a case study based on your query.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate case study. Please try again.",
        variant: "destructive",
      });
      console.error("Error generating case study:", error);
    }
  });
  
  // ROI calculator mutation
  const roiCalculatorMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        'POST', 
        '/api/ai/roi-calculator', 
        roiCalculationData
      );
      return res.json();
    },
    onSuccess: (data) => {
      setRoiProjection(data || null);
      toast({
        title: "ROI Projection Complete",
        description: "We've calculated the potential return on investment for your business.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to calculate ROI. Please try again.",
        variant: "destructive",
      });
      console.error("Error calculating ROI:", error);
    }
  });
  
  // Handle service recommendation
  const handleRecommendService = () => {
    if (!businessChallenge.trim()) {
      toast({
        title: "Empty Input",
        description: "Please describe your business challenge first.",
        variant: "destructive",
      });
      return;
    }
    
    serviceRecommendationMutation.mutate();
  };
  
  // Handle case study generation
  const handleGenerateCaseStudy = () => {
    if (!caseStudyQuery.trim()) {
      toast({
        title: "Empty Input",
        description: "Please provide a scenario or query for case study generation.",
        variant: "destructive",
      });
      return;
    }
    
    caseStudyGenerationMutation.mutate();
  };
  
  // Handle ROI calculation
  const handleCalculateROI = () => {
    if (!roiCalculationData.industry || !roiCalculationData.annualRevenue || !roiCalculationData.businessGoal) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields for ROI calculation.",
        variant: "destructive",
      });
      return;
    }
    
    roiCalculatorMutation.mutate();
  };
  
  // Handle booking a consultation
  const handleBookConsultation = (serviceType: string) => {
    setServiceTypeForBooking(serviceType);
    setShowGoogleCalendar(true);
    
    toast({
      title: "Scheduling Consultation",
      description: `Let's book a consultation for ${serviceType}`,
    });
  };
  
  return (
    <div className="relative min-h-screen bg-neutral-900 text-neutral-100">
      {/* Google Calendar Booking Dialog */}
      {showGoogleCalendar && (
        <GoogleCalendarBooking 
          onClose={() => setShowGoogleCalendar(false)}
          serviceType={serviceTypeForBooking}
        />
      )}
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div 
            className="absolute top-20 left-10 w-48 h-48 bg-primary-600/20 rounded-full filter blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-20 right-10 w-60 h-60 bg-secondary-600/20 rounded-full filter blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          ></motion.div>
        </div>
      </div>
      
      {/* Main content */}
      <Navbar />
      
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-2 bg-neutral-800/50 backdrop-blur-md rounded-full mb-6">
            <div className="flex items-center space-x-2 px-4 py-1">
              <Sparkles className="h-5 w-5 text-primary-400" />
              <span className="text-sm font-medium text-neutral-300">AI-Powered Business Tools</span>
            </div>
          </div>
          
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            Intelligent Tools for<br />Smarter Business Decisions
          </h1>
          <p className="text-neutral-300 text-xl max-w-2xl mx-auto mb-12">
            Leverage our AI systems to get personalized recommendations, generate custom case studies, and calculate your potential ROI.
          </p>
        </motion.div>
        
        {/* Tools Tabs */}
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="service-advisor" className="w-full" onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="service-advisor" className="text-sm">
                <Bot className="h-4 w-4 mr-2" />
                Service Advisor
              </TabsTrigger>
              <TabsTrigger value="case-study-generator" className="text-sm">
                <PenTool className="h-4 w-4 mr-2" />
                Case Study Generator
              </TabsTrigger>
              <TabsTrigger value="roi-calculator" className="text-sm">
                <BarChart className="h-4 w-4 mr-2" />
                ROI Calculator
              </TabsTrigger>
            </TabsList>
            
            {/* Service Advisor Tab */}
            <TabsContent value="service-advisor">
              <Card className="bg-neutral-800/30 border-neutral-700">
                <CardHeader>
                  <CardTitle>AI Service Advisor</CardTitle>
                  <CardDescription>
                    Describe your business challenge, and our AI will recommend the most suitable services for your needs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea 
                      placeholder="Describe your business challenge or problem you're trying to solve..."
                      value={businessChallenge}
                      onChange={(e) => setBusinessChallenge(e.target.value)}
                      className="min-h-[120px] bg-neutral-900 border-neutral-700"
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleRecommendService}
                        disabled={serviceRecommendationMutation.isPending || !businessChallenge.trim()}
                        className="bg-primary-600 hover:bg-primary-500"
                      >
                        {serviceRecommendationMutation.isPending ? (
                          <>
                            <Zap className="mr-2 h-4 w-4 animate-pulse" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-4 w-4" />
                            Get Recommendations
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {recommendedServices.length > 0 && (
                      <div className="mt-8">
                        <h3 className="font-bold text-lg text-white mb-4">Recommended Services</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {recommendedServices.map((service, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 hover:border-primary-500/50 transition-colors"
                            >
                              <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-full bg-primary-900/60 flex items-center justify-center mr-3">
                                  <Code className="h-5 w-5 text-primary-400" />
                                </div>
                                <h4 className="font-bold text-white">{service.name}</h4>
                              </div>
                              <p className="text-neutral-300 text-sm mb-3 line-clamp-3">
                                {service.description}
                              </p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs bg-primary-900/40 text-primary-300 px-2 py-1 rounded">
                                  {service.category}
                                </span>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-primary-400 hover:text-primary-300"
                                  >
                                    Learn More
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-primary-400 hover:text-primary-300"
                                    onClick={() => handleBookConsultation(service.name)}
                                  >
                                    Book
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Case Study Generator Tab */}
            <TabsContent value="case-study-generator">
              <Card className="bg-neutral-800/30 border-neutral-700">
                <CardHeader>
                  <CardTitle>AI Case Study Generator</CardTitle>
                  <CardDescription>
                    Generate a detailed case study based on your industry, challenges, and desired outcomes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea 
                      placeholder="Describe the scenario for a case study (e.g., 'A retail company struggling with inventory management')..."
                      value={caseStudyQuery}
                      onChange={(e) => setCaseStudyQuery(e.target.value)}
                      className="min-h-[120px] bg-neutral-900 border-neutral-700"
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleGenerateCaseStudy}
                        disabled={caseStudyGenerationMutation.isPending || !caseStudyQuery.trim()}
                        className="bg-secondary-600 hover:bg-secondary-500"
                      >
                        {caseStudyGenerationMutation.isPending ? (
                          <>
                            <Zap className="mr-2 h-4 w-4 animate-pulse" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <PenTool className="mr-2 h-4 w-4" />
                            Generate Case Study
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {generatedCaseStudy && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-8 bg-neutral-800/50 rounded-lg p-6 border border-neutral-700"
                      >
                        <h3 className="font-bold text-xl text-white mb-2">{generatedCaseStudy.title}</h3>
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-xs bg-secondary-900/40 text-secondary-300 px-2 py-1 rounded">
                            {generatedCaseStudy.industry}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="text-neutral-400 text-sm">{generatedCaseStudy.timeframe}</span>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                          <div>
                            <h4 className="font-bold text-white mb-2">Challenge</h4>
                            <p className="text-neutral-300">{generatedCaseStudy.challenge}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-white mb-2">Solution</h4>
                            <p className="text-neutral-300">{generatedCaseStudy.solution}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-white mb-2">Results</h4>
                            <p className="text-neutral-300">{generatedCaseStudy.results}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
                          <div className="flex items-center">
                            <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                            <span className="text-white font-medium">{generatedCaseStudy.roi}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-neutral-300">
                              <Share className="h-4 w-4 mr-2" />
                              Share Case Study
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-secondary-400 hover:text-secondary-300"
                              onClick={() => handleBookConsultation(generatedCaseStudy.title)}
                            >
                              Book Consultation
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* ROI Calculator Tab */}
            <TabsContent value="roi-calculator">
              <Card className="bg-neutral-800/30 border-neutral-700">
                <CardHeader>
                  <CardTitle>AI ROI Calculator</CardTitle>
                  <CardDescription>
                    Calculate the potential return on investment for implementing our solutions in your business.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Industry
                        </label>
                        <Input 
                          placeholder="E.g., Retail, Healthcare, Finance..."
                          value={roiCalculationData.industry}
                          onChange={(e) => setRoiCalculationData({...roiCalculationData, industry: e.target.value})}
                          className="bg-neutral-900 border-neutral-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Annual Revenue
                        </label>
                        <Input 
                          placeholder="E.g., $500,000"
                          value={roiCalculationData.annualRevenue}
                          onChange={(e) => setRoiCalculationData({...roiCalculationData, annualRevenue: e.target.value})}
                          className="bg-neutral-900 border-neutral-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Business Goal
                        </label>
                        <Textarea 
                          placeholder="E.g., Reduce operational costs, Increase customer retention..."
                          value={roiCalculationData.businessGoal}
                          onChange={(e) => setRoiCalculationData({...roiCalculationData, businessGoal: e.target.value})}
                          className="bg-neutral-900 border-neutral-700 h-20"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Team Size: {roiCalculationData.teamSize} people
                        </label>
                        <input 
                          type="range" 
                          min="1" 
                          max="100" 
                          value={roiCalculationData.teamSize}
                          onChange={(e) => setRoiCalculationData({...roiCalculationData, teamSize: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Current Automation Level
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['low', 'medium', 'high'].map((level) => (
                            <Button
                              key={level}
                              type="button"
                              variant={roiCalculationData.automationLevel === level ? "default" : "outline"}
                              className={roiCalculationData.automationLevel === level ? "bg-primary-600" : ""}
                              onClick={() => setRoiCalculationData({...roiCalculationData, automationLevel: level})}
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Implementation Timeline
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['short', 'medium', 'long'].map((timeline) => (
                            <Button
                              key={timeline}
                              type="button"
                              variant={roiCalculationData.implementationTimeline === timeline ? "default" : "outline"}
                              className={roiCalculationData.implementationTimeline === timeline ? "bg-primary-600" : ""}
                              onClick={() => setRoiCalculationData({...roiCalculationData, implementationTimeline: timeline})}
                            >
                              {timeline.charAt(0).toUpperCase() + timeline.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          onClick={handleCalculateROI}
                          disabled={roiCalculatorMutation.isPending}
                          className="w-full bg-primary-600 hover:bg-primary-500"
                        >
                          {roiCalculatorMutation.isPending ? (
                            <>
                              <Zap className="mr-2 h-4 w-4 animate-pulse" />
                              Calculating...
                            </>
                          ) : (
                            <>
                              <BarChart className="mr-2 h-4 w-4" />
                              Calculate ROI
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {roiProjection && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mt-8 bg-neutral-800/50 rounded-lg p-6 border border-neutral-700"
                    >
                      <h3 className="font-bold text-xl text-white mb-6">ROI Projection</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                          <h4 className="text-neutral-400 text-sm mb-1">Estimated ROI</h4>
                          <p className="text-2xl font-bold text-primary-400">{roiProjection.estimatedROI}</p>
                        </div>
                        
                        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                          <h4 className="text-neutral-400 text-sm mb-1">Cost Reduction</h4>
                          <p className="text-2xl font-bold text-green-400">{roiProjection.costReduction}</p>
                        </div>
                        
                        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                          <h4 className="text-neutral-400 text-sm mb-1">Timeline</h4>
                          <p className="text-2xl font-bold text-secondary-400">{roiProjection.timelineMonths} months</p>
                        </div>
                        
                        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                          <h4 className="text-neutral-400 text-sm mb-1">Potential Savings</h4>
                          <p className="text-2xl font-bold text-amber-400">{roiProjection.potentialSavings}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
                        <div className="flex items-center">
                          <Layers className="text-primary-500 mr-2 h-5 w-5" />
                          <span className="text-white font-medium">Based on similar businesses in your industry</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-neutral-300">
                            <Share className="h-4 w-4 mr-2" />
                            Share Projection
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-primary-400 hover:text-primary-300"
                            onClick={() => handleBookConsultation('ROI Implementation')}
                          >
                            Book Consultation
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-20 mb-20"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Business with AI?</h2>
            <p className="text-neutral-300 mb-8">
              Schedule a consultation with our experts to discover how our AI-powered solutions can accelerate your business growth.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-primary-600 hover:bg-primary-500"
                onClick={() => handleBookConsultation('General Consultation')}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                See Success Stories
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}