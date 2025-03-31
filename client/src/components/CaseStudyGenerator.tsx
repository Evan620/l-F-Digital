import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Share2, FolderPlus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { type CaseStudy } from '@shared/schema';

export default function CaseStudyGenerator() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  
  const handleGenerateCaseStudy = async () => {
    if (!query.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a question or describe an industry challenge to generate a case study.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai/generate-case-study', { query });
      
      // Check if the status is 500 or another error code
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error occurred");
      }
      
      const data = await response.json();
      
      if (data.caseStudy) {
        setCaseStudy(data.caseStudy);
      } else {
        throw new Error("Invalid case study response");
      }
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: error instanceof Error ? error.message : "We couldn't generate a case study using AI. Please try again later or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Example queries for the buttons
  const exampleQueries = [
    "How did you optimize e-commerce conversion rates?",
    "ROI from automating healthcare workflows?",
    "Scaling problems for mid-size manufacturers?"
  ];
  
  return (
    <section id="case-studies" className="py-20 bg-neutral-950 relative">
      {/* Background gradients */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-600 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-secondary-900/50 text-secondary-400 text-sm font-medium mb-4">
            Interactive Case Studies
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            See How We've Helped Similar Businesses
          </h2>
          <p className="text-neutral-300 text-lg">
            Ask a question or describe your industry challenge, and our AI will generate a relevant case study showing our proven results.
          </p>
        </motion.div>
        
        {/* Case Study Generator */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-neutral-900 border-neutral-800 shadow-xl">
            <CardContent className="p-8">
              <h3 className="font-display font-bold text-2xl text-white mb-6">
                Ask About Our Success Stories
              </h3>
              
              {/* Query Input */}
              <div className="mb-6 relative">
                <div className="flex items-center gap-2 absolute left-4 top-4">
                  <Check className="h-5 w-5 text-neutral-500" />
                  <span className="text-neutral-500">Try:</span>
                </div>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="How did you improve customer retention for a SaaS company?"
                  className="w-full pl-28 pr-4 py-4 bg-neutral-800 border-neutral-700 rounded-lg text-white placeholder-neutral-500"
                />
              </div>
              
              {/* Example Queries */}
              <div className="flex flex-wrap gap-2 mb-8">
                {exampleQueries.map((exampleQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="rounded-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    onClick={() => setQuery(exampleQuery)}
                  >
                    {exampleQuery}
                  </Button>
                ))}
              </div>
              
              {/* Submit Button */}
              <div className="text-center mb-8">
                <Button
                  className="px-6 py-3 h-auto bg-primary-600 hover:bg-primary-500"
                  onClick={handleGenerateCaseStudy}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Case Study'}
                </Button>
              </div>
              
              {/* Generated Case Study */}
              {caseStudy && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary-900/50 text-secondary-400 mb-2">
                        {caseStudy.industry} Industry
                      </span>
                      <h4 className="font-display font-bold text-xl text-white">
                        {caseStudy.title}
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="rounded-full bg-neutral-700 hover:bg-neutral-600 h-8 w-8 p-0">
                        <Share2 className="h-4 w-4 text-white" />
                      </Button>
                      <Button size="icon" variant="ghost" className="rounded-full bg-neutral-700 hover:bg-neutral-600 h-8 w-8 p-0">
                        <FolderPlus className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <p className="text-neutral-300 text-sm">
                      <span className="font-semibold text-white">Client:</span> {caseStudy.industry} company facing significant challenges
                    </p>
                    
                    <p className="text-neutral-300 text-sm">
                      <span className="font-semibold text-white">Challenge:</span> {caseStudy.challenge}
                    </p>
                    
                    <p className="text-neutral-300 text-sm">
                      <span className="font-semibold text-white">Our Solution:</span> {caseStudy.solution}
                    </p>
                    
                    <p className="text-neutral-300 text-sm">
                      <span className="font-semibold text-white">Results:</span> {caseStudy.results}
                    </p>
                  </div>
                  
                  {/* Metrics Visualization */}
                  {caseStudy.metrics && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {Object.entries(caseStudy.metrics).map(([key, value], index) => (
                        <div key={index} className="p-3 rounded-lg bg-neutral-700/50 border border-neutral-600">
                          <div className="text-secondary-400 font-bold text-xl">{value}</div>
                          <div className="text-neutral-400 text-xs">
                            {key.replace(/([A-Z])/g, ' $1')
                             .replace(/^./, str => str.toUpperCase())
                             .replace(/([a-z])([A-Z])/g, '$1 $2')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Call to Action */}
                  <div className="flex justify-between items-center">
                    <Button variant="link" className="text-primary-400 hover:text-primary-300 p-0">
                      See more details
                    </Button>
                    <Button className="px-4 py-2 h-auto bg-secondary-600 hover:bg-secondary-500 text-white text-sm">
                      Clone This Success
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
