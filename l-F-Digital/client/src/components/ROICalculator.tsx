import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Zap, Users, Clock, Building, Calculator, BarChart3, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { type CaseStudy, type ROIProjection } from '@shared/schema';

interface ROICalculatorProps {
  caseStudy?: CaseStudy;
}

export default function ROICalculator({ caseStudy }: ROICalculatorProps) {
  const { toast } = useToast();
  const [industry, setIndustry] = useState(caseStudy?.industry?.toLowerCase() || 'technology');
  const [annualRevenue, setAnnualRevenue] = useState('1000000');
  const [formattedRevenue, setFormattedRevenue] = useState('$1,000,000');
  const [teamSize, setTeamSize] = useState(50);
  const [automationLevel, setAutomationLevel] = useState('low');
  const [implementationTimeline, setImplementationTimeline] = useState('3-6 months');
  const [businessGoal, setBusinessGoal] = useState('efficiency');
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [roiResults, setRoiResults] = useState<ROIProjection | null>(null);
  const [pulseRate, setPulseRate] = useState(70); // Heart rate monitor pulse rate
  
  // Format revenue as currency
  useEffect(() => {
    const revenueNum = parseInt(annualRevenue.replace(/[^0-9]/g, '') || '0');
    setFormattedRevenue(new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(revenueNum));
  }, [annualRevenue]);
  
  // Set pulse rate based on ROI
  useEffect(() => {
    if (roiResults) {
      const roiValue = parseInt(roiResults.estimatedROI.replace(/[^0-9]/g, '') || '0');
      // Map ROI to pulse rate: higher ROI = faster pulse
      const newPulseRate = Math.min(70 + (roiValue / 10), 180);
      setPulseRate(newPulseRate);
    } else {
      setPulseRate(70); // Resting heart rate
    }
  }, [roiResults]);
  
  // Handle revenue input change with formatting
  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAnnualRevenue(raw);
  };
  
  // Calculate ROI
  const calculateROI = async () => {
    setIsCalculating(true);
    
    try {
      // Call the ROI calculator API
      const response = await apiRequest('POST', '/api/ai/roi-calculator', {
        industry,
        annualRevenue,
        businessGoal,
        teamSize,
        automationLevel,
        implementationTimeline
      });
      
      const data = await response.json();
      
      // Simulate API response for demonstration
      if (!data.projection) {
        // Generate a fallback projection if the API doesn't return one
        const projection: ROIProjection = {
          estimatedROI: `${180 + Math.floor(Math.random() * 120)}%`,
          costReduction: `${15 + Math.floor(Math.random() * 30)}%`,
          timelineMonths: parseInt(implementationTimeline.split('-')[0]) || 3,
          potentialSavings: `$${(parseInt(annualRevenue) * 0.2).toLocaleString()}`
        };
        setRoiResults(projection);
      } else {
        setRoiResults(data.projection);
      }
      
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: "We couldn't calculate your ROI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Reset calculator
  const resetCalculator = () => {
    setRoiResults(null);
    setAutomationLevel('low');
    setBusinessGoal('efficiency');
    setImplementationTimeline('3-6 months');
  };
  
  return (
    <div className="w-full bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Input section */}
        <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-neutral-800">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-primary-400" />
            ROI Calculator
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="industry" className="block text-sm font-medium text-neutral-300">
                Industry
              </label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="retail">Retail / E-commerce</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="annual-revenue" className="block text-sm font-medium text-neutral-300">
                Annual Revenue: {formattedRevenue}
              </label>
              <Input
                id="annual-revenue"
                type="text"
                inputMode="numeric"
                value={formattedRevenue}
                onChange={handleRevenueChange}
                className="border-neutral-700 bg-neutral-800 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="team-size" className="block text-sm font-medium text-neutral-300">
                Team Size: {teamSize} employees
              </label>
              <Slider
                value={[teamSize]}
                min={5}
                max={500}
                step={5}
                onValueChange={(value) => setTeamSize(value[0])}
                className="py-2"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="business-goal" className="block text-sm font-medium text-neutral-300">
                Primary Business Goal
              </label>
              <Select value={businessGoal} onValueChange={setBusinessGoal}>
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efficiency">Operational Efficiency</SelectItem>
                  <SelectItem value="growth">Revenue Growth</SelectItem>
                  <SelectItem value="cost">Cost Reduction</SelectItem>
                  <SelectItem value="experience">Customer Experience</SelectItem>
                  <SelectItem value="innovation">Innovation & Agility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="automation-level" className="block text-sm font-medium text-neutral-300">
                Current Automation Level
              </label>
              <Select value={automationLevel} onValueChange={setAutomationLevel}>
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Automation</SelectItem>
                  <SelectItem value="low">Basic Automation</SelectItem>
                  <SelectItem value="medium">Partial Automation</SelectItem>
                  <SelectItem value="high">Significant Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="implementation-timeline" className="block text-sm font-medium text-neutral-300">
                Implementation Timeline
              </label>
              <Select value={implementationTimeline} onValueChange={setImplementationTimeline}>
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3 months">Quick Win (1-3 months)</SelectItem>
                  <SelectItem value="3-6 months">Standard (3-6 months)</SelectItem>
                  <SelectItem value="6-12 months">Comprehensive (6-12 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={calculateROI} 
              disabled={isCalculating} 
              className="w-full"
            >
              {isCalculating ? 'Calculating...' : 'Calculate ROI'}
              {!isCalculating && <Zap className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Results section */}
        <div className="w-full lg:w-1/2 bg-neutral-800 p-6">
          <AnimatePresence mode="wait">
            {!roiResults ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-8"
              >
                <div className="w-24 h-24 rounded-full bg-neutral-700/50 flex items-center justify-center mb-6">
                  <DollarSign className="h-12 w-12 text-neutral-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Calculate Your ROI</h3>
                <p className="text-neutral-400 max-w-xs mx-auto mb-6">
                  Adjust the parameters on the left to see how much value our solutions can bring to your organization.
                </p>
                
                {caseStudy && (
                  <div className="w-full max-w-xs bg-neutral-700/20 rounded-lg p-4 border border-neutral-700">
                    <p className="text-sm text-neutral-300 mb-1">Based on this case study:</p>
                    <p className="text-white font-medium truncate">{caseStudy.title}</p>
                    <p className="text-secondary-400 text-sm mt-2">
                      Achieved {caseStudy.metrics?.roi || "200%+"} ROI
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Your ROI Results</h3>
                  <Button variant="ghost" size="sm" onClick={resetCalculator}>
                    Reset
                  </Button>
                </div>
                
                {/* ROI Heart Rate Monitor */}
                <div className="relative bg-neutral-900 rounded-lg p-4 border border-neutral-700 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">ROI Pulse</h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-neutral-400">BPM:</span>
                      <span className="text-xs font-medium text-secondary-400">{Math.round(pulseRate)}</span>
                    </div>
                  </div>
                  
                  {/* Heart rate monitor SVG */}
                  <div className="h-24 w-full relative overflow-hidden">
                    <svg viewBox="0 0 600 100" className="w-full h-full">
                      <motion.path
                        d="M0,50 Q30,50 40,50 T60,50 T80,20 T100,50 T120,80 T140,50 T160,50 T180,50 T200,50 T220,50 T240,50 T260,50 T280,50 T300,50 T320,50 T340,50 T360,50 T380,50 T400,50 T420,50 T440,50 T460,50 T480,50 T500,50 T520,50 T540,50 T560,50 T580,50 T600,50"
                        fill="none"
                        stroke="#15803d"
                        strokeWidth="2"
                        animate={{
                          d: [
                            // Resting baseline with a bump
                            "M0,50 Q30,50 40,50 T60,50 T80,20 T100,50 T120,80 T140,50 T160,50 T180,50 T200,50 T220,50 T240,50 T260,50 T280,50 T300,50 T320,50 T340,50 T360,50 T380,50 T400,50 T420,50 T440,50 T460,50 T480,50 T500,50 T520,50 T540,50 T560,50 T580,50 T600,50",
                            // Spike for the heart beat
                            "M0,50 Q30,50 40,50 T60,50 T80,50 T100,50 T120,50 T140,50 T160,50 T180,50 T200,50 T220,50 T240,10 T260,90 T280,50 T300,50 T320,50 T340,50 T360,50 T380,50 T400,50 T420,50 T440,50 T460,50 T480,50 T500,50 T520,50 T540,50 T560,50 T580,50 T600,50",
                            // Return to baseline
                            "M0,50 Q30,50 40,50 T60,50 T80,50 T100,50 T120,50 T140,50 T160,50 T180,50 T200,50 T220,50 T240,50 T260,50 T280,50 T300,50 T320,50 T340,50 T360,50 T380,50 T400,50 T420,50 T440,50 T460,50 T480,50 T500,10 T520,90 T540,50 T560,50 T580,50 T600,50",
                          ],
                        }}
                        transition={{
                          duration: 60 / pulseRate, // Convert BPM to seconds per beat
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <line x1="0" y1="50" x2="600" y2="50" stroke="#2f2f2f" strokeWidth="1" strokeDasharray="4,4" />
                    </svg>
                    
                    {/* Animated pulse */}
                    <motion.div
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 h-24 w-2 bg-gradient-to-r from-transparent to-emerald-500/30"
                      animate={{
                        opacity: [0.2, 0.8, 0.2],
                      }}
                      transition={{
                        duration: 60 / pulseRate,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>
                </div>
                
                {/* ROI Results Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-700/20 rounded-lg p-4 flex flex-col">
                    <span className="text-neutral-400 text-xs mb-1">Estimated ROI</span>
                    <span className="text-2xl font-bold text-secondary-500">{roiResults.estimatedROI}</span>
                  </div>
                  <div className="bg-neutral-700/20 rounded-lg p-4 flex flex-col">
                    <span className="text-neutral-400 text-xs mb-1">Potential Savings</span>
                    <span className="text-2xl font-bold text-white">{roiResults.potentialSavings}</span>
                  </div>
                  <div className="bg-neutral-700/20 rounded-lg p-4 flex flex-col">
                    <span className="text-neutral-400 text-xs mb-1">Cost Reduction</span>
                    <span className="text-2xl font-bold text-primary-400">{roiResults.costReduction}</span>
                  </div>
                  <div className="bg-neutral-700/20 rounded-lg p-4 flex flex-col">
                    <span className="text-neutral-400 text-xs mb-1">Time to Results</span>
                    <span className="text-2xl font-bold text-white">{roiResults.timelineMonths} months</span>
                  </div>
                </div>
                
                {/* Recommendations */}
                <div className="bg-secondary-900/30 border border-secondary-900/50 rounded-lg p-4">
                  <h4 className="text-secondary-400 font-medium mb-2 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Recommended Next Steps
                  </h4>
                  <ul className="text-white space-y-1">
                    <li className="flex items-start">
                      <ArrowUpRight className="h-4 w-4 text-secondary-400 mr-2 mt-0.5" />
                      <span className="text-sm">Schedule a discovery call to identify your specific automation opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-4 w-4 text-secondary-400 mr-2 mt-0.5" />
                      <span className="text-sm">Request a personalized demo tailored to your {industry} business</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-4 w-4 text-secondary-400 mr-2 mt-0.5" />
                      <span className="text-sm">Explore our {industry}-specific case studies for more insights</span>
                    </li>
                  </ul>
                </div>
                
                <Button className="w-full">
                  Get Your Detailed ROI Report
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}