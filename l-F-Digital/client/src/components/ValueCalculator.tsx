import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from '@/components/ui/slider';
import { ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { type ROIProjection } from '@shared/schema';

export default function ValueCalculator() {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [roiResults, setRoiResults] = useState<ROIProjection | null>(null);
  
  // Form state
  const [industry, setIndustry] = useState('');
  const [revenue, setRevenue] = useState('');
  const [goal, setGoal] = useState('');
  const [teamSize, setTeamSize] = useState(50);
  const [automationLevel, setAutomationLevel] = useState('Very Low');
  const [timeline, setTimeline] = useState('ASAP');
  
  const handleCalculate = async () => {
    if (!industry || !revenue || !goal) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields to generate your ROI projection.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCalculating(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai/roi-calculator', {
        industry,
        annualRevenue: revenue,
        businessGoal: goal,
        teamSize,
        automationLevel,
        implementationTimeline: timeline
      });
      
      const data = await response.json();
      setRoiResults(data);
      setShowResults(true);
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: "We couldn't generate your ROI projection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-neutral-800/70 border-neutral-700 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-4 text-center">
                  Calculate Your ROI Potential
                </h2>
                <p className="text-neutral-300 text-center mb-8">
                  See how our AI solutions can transform your business metrics
                </p>
              </motion.div>
              
              {/* Calculator Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Your Industry</label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="w-full bg-neutral-900 border-neutral-700">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700">
                        <SelectItem value="ecommerce">E-Commerce</SelectItem>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Annual Revenue</label>
                    <Select value={revenue} onValueChange={setRevenue}>
                      <SelectTrigger className="w-full bg-neutral-900 border-neutral-700">
                        <SelectValue placeholder="Select revenue range" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700">
                        <SelectItem value="under1m">Under $1M</SelectItem>
                        <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                        <SelectItem value="5m-20m">$5M - $20M</SelectItem>
                        <SelectItem value="20m-50m">$20M - $50M</SelectItem>
                        <SelectItem value="over50m">Over $50M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Business Goal</label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger className="w-full bg-neutral-900 border-neutral-700">
                        <SelectValue placeholder="Select primary goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700">
                        <SelectItem value="reduce-costs">Reduce Operational Costs</SelectItem>
                        <SelectItem value="increase-revenue">Increase Revenue</SelectItem>
                        <SelectItem value="improve-efficiency">Improve Efficiency</SelectItem>
                        <SelectItem value="scale-operations">Scale Operations</SelectItem>
                        <SelectItem value="customer-retention">Improve Customer Retention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Team Size</label>
                    <div className="relative mt-5">
                      <Slider
                        value={[teamSize]}
                        min={1}
                        max={500}
                        step={1}
                        onValueChange={(value) => setTeamSize(value[0])}
                        className="w-full h-2 bg-neutral-700"
                      />
                      <span className="absolute right-0 -top-6 text-sm text-neutral-400">
                        {teamSize} employees
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Current Automation Level</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['Very Low', 'Low', 'Medium', 'High', 'Very High'].map((level) => (
                        <Button
                          key={level}
                          type="button"
                          size="sm"
                          variant={automationLevel === level ? 'default' : 'outline'}
                          className={automationLevel === level 
                            ? 'bg-primary-600 hover:bg-primary-500' 
                            : 'bg-neutral-700 hover:bg-neutral-600 border-0'
                          }
                          onClick={() => setAutomationLevel(level)}
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Implementation Timeline</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['ASAP', '3-6 Months', '6+ Months'].map((time) => (
                        <Button
                          key={time}
                          type="button"
                          size="sm"
                          variant={timeline === time ? 'default' : 'outline'}
                          className={timeline === time 
                            ? 'bg-primary-600 hover:bg-primary-500' 
                            : 'bg-neutral-700 hover:bg-neutral-600 border-0'
                          }
                          onClick={() => setTimeline(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Generate Results Button */}
              <div className="mt-8 text-center">
                <Button 
                  className="px-6 py-3 h-auto bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 shadow-lg hover:shadow-xl shadow-primary-900/20"
                  onClick={handleCalculate}
                  disabled={isCalculating}
                >
                  {isCalculating ? 'Calculating...' : 'Generate ROI Projection'}
                  {!isCalculating && <ArrowRight className="h-5 w-5 ml-2" />}
                </Button>
              </div>
              
              {/* Results Preview */}
              {showResults && roiResults && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8 p-4 rounded-lg bg-neutral-900 border border-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Estimated ROI:</span>
                    <span className="text-xl font-bold text-primary-400">{roiResults.estimatedROI}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-neutral-300">Cost Reduction:</span>
                    <span className="text-xl font-bold text-secondary-400">{roiResults.costReduction}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-neutral-300">Implementation Timeline:</span>
                    <span className="text-xl font-bold text-primary-400">{roiResults.timelineMonths} months</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-neutral-300">Potential Savings:</span>
                    <span className="text-xl font-bold text-secondary-400">{roiResults.potentialSavings}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-800 text-center">
                    <Button variant="ghost" className="text-primary-400 hover:text-primary-300 hover:bg-transparent">
                      View Detailed Report
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
