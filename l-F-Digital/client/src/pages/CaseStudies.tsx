import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Filter, CheckCircle2, ArrowDown, ChevronRight, 
  Zap, PieChart, Users, Clock, Rocket, BarChart,
  LineChart, Upload, Star, Play, Sparkles, Globe
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { type CaseStudy } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CaseStudies() {
  const { toast } = useToast();
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedChallengeType, setSelectedChallengeType] = useState('all');
  const [resultsTimeframe, setResultsTimeframe] = useState(6);
  const [activeIndex, setActiveIndex] = useState(0);
  const [businessPainPoint, setBusinessPainPoint] = useState('');
  const [generatingCustomCase, setGeneratingCustomCase] = useState(false);
  const [customCaseStudy, setCustomCaseStudy] = useState<CaseStudy | null>(null);
  const [showRoiCalculator, setShowRoiCalculator] = useState(false);
  const [companySize, setCompanySize] = useState(50);
  const [annualRevenue, setAnnualRevenue] = useState(1000000);
  const [estimatedRoi, setEstimatedRoi] = useState('0');
  const [userIndustry, setUserIndustry] = useState('technology');
  
  // Detect industry based on referrer (simplified version)
  useEffect(() => {
    // In a real app, this would be more sophisticated
    const referrer = document.referrer.toLowerCase();
    
    if (referrer.includes('retail') || referrer.includes('ecommerce')) {
      setUserIndustry('retail');
    } else if (referrer.includes('finance') || referrer.includes('bank')) {
      setUserIndustry('finance');
    } else if (referrer.includes('healthcare') || referrer.includes('medical')) {
      setUserIndustry('healthcare');
    }
  }, []);

  // Fetch case studies
  const { data: caseStudies = [], isLoading: isLoadingCaseStudies } = useQuery<CaseStudy[]>({
    queryKey: ['/api/case-studies'],
  });
  
  // Filter case studies based on selected filters
  const filteredCaseStudies = caseStudies.filter((study) => {
    const matchesIndustry = 
      selectedIndustry === 'all' || 
      study.industry.toLowerCase() === selectedIndustry.toLowerCase();
    
    // Simplified challenge type matching
    const matchesChallengeType = selectedChallengeType === 'all';
    
    return matchesIndustry && matchesChallengeType;
  });
  
  // Get unique industries for filtering
  const industries = ['all', ...Array.from(new Set(caseStudies.map(study => study.industry.toLowerCase())))];
  
  // Handle finding a personalized case study
  const handleFindPersonalizedCaseStudy = async () => {
    if (!businessPainPoint.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your business challenge to find relevant case studies.",
        variant: "destructive",
      });
      return;
    }
    
    setGeneratingCustomCase(true);
    
    try {
      // AI request to generate a customized case study
      const response = await apiRequest('POST', '/api/ai/generate-case-study', {
        query: businessPainPoint,
      });
      
      const data = await response.json();
      
      if (data.caseStudy) {
        setCustomCaseStudy(data.caseStudy);
      } else {
        toast({
          title: "Generation failed",
          description: "We couldn't generate a customized case study. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "We couldn't generate a customized case study. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingCustomCase(false);
    }
  };
  
  // Calculate ROI based on inputs
  const calculateRoi = () => {
    // Simple calculation for demo purposes
    const baseRoi = caseStudies[activeIndex]?.metrics?.roi || "150%";
    const baseRoiValue = parseInt(baseRoi.replace('%', ''));
    const companyFactor = companySize / 50; // baseline is 50 employees
    const revenueFactor = annualRevenue / 1000000; // baseline is $1M
    
    const calculatedRoi = Math.round(baseRoiValue * (companyFactor * 0.3 + revenueFactor * 0.7));
    setEstimatedRoi(`${calculatedRoi}%`);
  };
  
  // Handle ROI calculator submission
  const handleCalculateRoi = () => {
    calculateRoi();
    setShowRoiCalculator(true);
  };
  
  // Get an industry icon
  const getIndustryIcon = (industry: string) => {
    switch(industry.toLowerCase()) {
      case 'e-commerce':
      case 'retail':
        return <LineChart className="h-12 w-12 text-secondary-500" />;
      case 'finance':
        return <PieChart className="h-12 w-12 text-emerald-500" />;
      case 'healthcare':
        return <Users className="h-12 w-12 text-blue-500" />;
      case 'technology':
        return <Zap className="h-12 w-12 text-primary-500" />;
      default:
        return <Globe className="h-12 w-12 text-primary-500" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-900 text-neutral-100">
      {/* Background elements with animated nodes - similar to Services page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div 
            className="absolute top-20 left-10 w-48 h-48 bg-secondary-600/20 rounded-full filter blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-20 right-10 w-60 h-60 bg-primary-600/20 rounded-full filter blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          ></motion.div>
          
          {/* Animated network nodes in background */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M100,100 C150,150 200,50 250,150 C300,250 350,150 400,200 C450,250 500,150 550,100"
              stroke="rgba(100, 200, 255, 0.4)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path
              d="M150,400 C200,450 250,350 300,400 C350,450 400,350 450,400"
              stroke="rgba(100, 200, 255, 0.3)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
            />
          </svg>
        </div>
      </div>
      
      {/* Main content */}
      <Navbar />
      
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - "See Your Future Here" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-secondary-900/30 to-neutral-900 mb-16 shadow-2xl"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <motion.div 
              className="absolute top-0 right-0 w-1/2 h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="h-full w-full bg-gradient-to-br from-secondary-500/20 to-primary-500/20 backdrop-blur-sm">
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <div className="text-center">
                    <span className="block text-5xl font-bold text-secondary-400">300%</span>
                    <span className="text-white text-xl">ROI</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute top-0 left-0 w-1/2 h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="h-full w-full bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm">
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <div className="text-center">
                    <span className="block text-5xl font-bold text-neutral-500">0%</span>
                    <span className="text-neutral-400 text-xl">Starting Point</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          <div className="relative z-20 px-8 py-20 md:px-16 md:py-24">
            <motion.div 
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-500/30 text-secondary-300 text-sm font-medium mb-4 backdrop-blur-sm">
                Success Stories
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                From 0 → 300% ROI: <br />Watch It Happen.
              </h1>
              
              {/* Personalized Industry Hook */}
              {userIndustry && (
                <motion.div 
                  className="bg-neutral-800/40 backdrop-blur-sm p-4 rounded-lg border border-secondary-500/20 mb-8"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-secondary-500/20 flex items-center justify-center flex-shrink-0 mr-4">
                      <Sparkles className="w-5 h-5 text-secondary-400" />
                    </div>
                    <div>
                      <p className="text-lg text-white font-medium mb-1">Perfect For {userIndustry.charAt(0).toUpperCase() + userIndustry.slice(1)}:</p>
                      <p className="text-neutral-300">
                        {userIndustry === 'retail' && 'How we helped an e-commerce store increase conversions by 45% with smart inventory management.'}
                        {userIndustry === 'finance' && 'How we helped a financial services firm reduce reporting time from 3 days to 3 hours.'}
                        {userIndustry === 'healthcare' && 'How we helped a healthcare provider improve patient scheduling and reduce no-shows by 62%.'}
                        {userIndustry === 'technology' && 'How we helped a SaaS company cut development time by 40% using our automation services.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Case Study Explorer - "Choose Your Adventure" */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-secondary-400 text-sm font-medium mb-4">
              Case Study Explorer
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Choose Your Adventure
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Select your industry and challenge type to discover how we've solved similar problems
            </p>
          </motion.div>
          
          {/* Explorer Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-neutral-800/30 backdrop-blur-sm rounded-xl border border-neutral-700 p-6 mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Industry Filter */}
              <div>
                <label htmlFor="industry" className="block text-neutral-300 text-sm mb-2">Industry</label>
                <Select 
                  value={selectedIndustry} 
                  onValueChange={setSelectedIndustry}
                >
                  <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry === 'all' ? 'All Industries' : industry.charAt(0).toUpperCase() + industry.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Challenge Type */}
              <div>
                <label htmlFor="challenge-type" className="block text-neutral-300 text-sm mb-2">Challenge Type</label>
                <Select 
                  value={selectedChallengeType} 
                  onValueChange={setSelectedChallengeType}
                >
                  <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                    <SelectValue placeholder="Select challenge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Challenges</SelectItem>
                    <SelectItem value="time-wasters">Time Wasters</SelectItem>
                    <SelectItem value="revenue-leaks">Revenue Leaks</SelectItem>
                    <SelectItem value="scaling-walls">Scaling Walls</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Results Timeframe */}
              <div>
                <label htmlFor="results-timeframe" className="block text-neutral-300 text-sm mb-2">
                  Results Timeframe: {resultsTimeframe} months
                </label>
                <Slider
                  value={[resultsTimeframe]}
                  min={1}
                  max={12}
                  step={1}
                  onValueChange={(value) => setResultsTimeframe(value[0])}
                  className="mt-4"
                />
              </div>
            </div>
          </motion.div>
          
          {/* Case Study Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {isLoadingCaseStudies ? (
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-80 bg-neutral-800/20 animate-pulse rounded-xl"
                />
              ))
            ) : filteredCaseStudies.length > 0 ? (
              filteredCaseStudies.map((caseStudy, index) => (
                <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} index={index} />
              ))
            ) : (
              <div className="col-span-3 text-center py-16 bg-neutral-800/20 rounded-xl border border-neutral-700">
                <p className="text-neutral-400">No case studies found matching your criteria.</p>
                <Button variant="link" onClick={() => {
                  setSelectedIndustry('all');
                  setSelectedChallengeType('all');
                }}>
                  Reset filters
                </Button>
              </div>
            )}
          </div>
        </section>
        
        {/* AI-Powered "Clone This Success" Lab */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-primary-400 text-sm font-medium mb-4">
              Clone This Success
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Your Success Story Starts Here
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Tell us your biggest business challenge, and we'll show you how we've solved similar problems
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-neutral-900 via-primary-900/20 to-neutral-900 rounded-xl border border-neutral-700 p-8 mb-10"
          >
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="relative">
                  <Input
                    type="text"
                    value={businessPainPoint}
                    onChange={(e) => setBusinessPainPoint(e.target.value)}
                    placeholder="Describe your business challenge (e.g., 'Manual data entry is taking too much time')"
                    className="bg-neutral-800/50 border-neutral-700 text-white pl-12 py-6 text-lg"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Upload className="h-5 w-5 text-primary-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={handleFindPersonalizedCaseStudy}
                    disabled={generatingCustomCase}
                    className="bg-primary-500 hover:bg-primary-600 text-white w-full py-6"
                  >
                    {generatingCustomCase ? 'Generating Your Success Roadmap...' : 'Find My Success Roadmap'}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {customCaseStudy && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-neutral-800/40 rounded-xl border border-primary-500/20 p-6"
                >
                  <div className="mb-4">
                    <span className="inline-block px-2.5 py-1 bg-primary-900/40 text-primary-400 text-xs font-medium rounded mb-2">
                      Your Custom Solution
                    </span>
                    <h3 className="text-2xl font-bold text-white">{customCaseStudy.title}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-neutral-400 text-sm uppercase tracking-wider mb-2">Your Challenge</h4>
                      <p className="text-white">{customCaseStudy.challenge}</p>
                    </div>
                    <div>
                      <h4 className="text-neutral-400 text-sm uppercase tracking-wider mb-2">Our Solution</h4>
                      <p className="text-white">{customCaseStudy.solution}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-neutral-400 text-sm uppercase tracking-wider mb-2">Projected Results</h4>
                    <p className="text-white">{customCaseStudy.results}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(customCaseStudy.metrics).map(([key, value], idx) => (
                      <motion.div 
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-neutral-800/40 rounded-lg p-3 text-center"
                      >
                        <span className="block text-2xl font-bold text-primary-400">{value}</span>
                        <span className="text-xs text-neutral-400">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <Button className="bg-primary-600 hover:bg-primary-500">
                      <Play className="mr-2 h-4 w-4" />
                      Share Your Success Story
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>
        
        {/* ROI Calculator - Case Study Edition */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-secondary-400 text-sm font-medium mb-4">
              ROI Calculator
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              What Could You Save?
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Customize the variables to see how our solutions would impact your business
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-neutral-900 via-secondary-900/20 to-neutral-900 rounded-xl border border-neutral-700 p-8 mb-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Adjust Your Variables</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-neutral-300 text-sm mb-2">
                      Company Size: {companySize} employees
                    </label>
                    <Slider
                      value={[companySize]}
                      min={5}
                      max={500}
                      step={5}
                      onValueChange={(value) => setCompanySize(value[0])}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-neutral-300 text-sm mb-2">
                      Annual Revenue: ${(annualRevenue / 1000000).toFixed(1)}M
                    </label>
                    <Slider
                      value={[annualRevenue]}
                      min={100000}
                      max={10000000}
                      step={100000}
                      onValueChange={(value) => setAnnualRevenue(value[0])}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="industry" className="block text-neutral-300 text-sm mb-2">Industry</label>
                    <Select 
                      value={userIndustry} 
                      onValueChange={setUserIndustry}
                    >
                      <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="retail">Retail / E-commerce</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleCalculateRoi}
                      className="bg-secondary-500 hover:bg-secondary-600 text-white w-full"
                    >
                      Calculate My ROI
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                {showRoiCalculator ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="mb-8">
                      <motion.div
                        initial={{ height: '0%' }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 1.5 }}
                        className="w-2 bg-secondary-500 mx-auto h-40"
                      ></motion.div>
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="mt-4"
                      >
                        <span className="text-6xl font-bold text-secondary-400">
                          {estimatedRoi}
                        </span>
                        <p className="text-white text-xl mt-2">Estimated ROI</p>
                        <p className="text-neutral-400 text-sm mt-4">
                          Based on similar projects for companies in your industry
                        </p>
                        
                        <div className="mt-8">
                          <Button className="bg-white text-neutral-900 hover:bg-neutral-200">
                            Schedule a Consultation
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-neutral-400">
                    <svg 
                      className="w-16 h-16 mx-auto mb-4 text-neutral-500" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                      />
                    </svg>
                    <p>Enter your information to calculate potential ROI</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* "Become the Next Case Study" CTA */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900/40 to-secondary-900/40 p-8 md:p-12 border border-primary-700/30"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-secondary-500/10 filter blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
              ></motion.div>
              <motion.div 
                className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-primary-500/10 filter blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
                transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", delay: 1 }}
              ></motion.div>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-4">
                  Your Success Story
                </span>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
                  Let's Turn Your Chaos Into <br />Our Next Masterpiece
                </h2>
                <p className="text-neutral-300 mb-6">
                  Schedule a consultation with our team to discuss your business challenges and see how we can transform them into success stories.
                </p>
                <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-200">
                  Start Your Success Story
                </Button>
              </div>
              
              <div className="bg-neutral-800/30 backdrop-blur-sm rounded-xl border border-neutral-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Preview Your Case Study</h3>
                  <span className="text-xs bg-secondary-500/20 text-secondary-300 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">COMPANY NAME</label>
                    <div className="h-10 bg-neutral-700/30 rounded border border-neutral-700 px-3 flex items-center text-neutral-300">
                      Your Company
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">INDUSTRY</label>
                    <div className="h-10 bg-neutral-700/30 rounded border border-neutral-700 px-3 flex items-center text-neutral-300">
                      Your Industry
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">ACHIEVEMENT</label>
                    <div className="h-10 bg-neutral-700/30 rounded border border-neutral-700 px-3 flex items-center text-neutral-300">
                      <span className="text-secondary-400 font-bold mr-2">150%</span> ROI in 6 months
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" className="w-full border-neutral-600 text-neutral-300">
                      <Star className="mr-2 h-4 w-4 text-secondary-400" />
                      Reserve Your Spot
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

// Case Study Card Component
function CaseStudyCard({ caseStudy, index }: { caseStudy: CaseStudy, index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate progress values
  const metricKeys = Object.keys(caseStudy.metrics);
  const primaryMetric = metricKeys[0] || 'roi';
  const primaryValue = caseStudy.metrics[primaryMetric] || '0%';
  
  // Extract numeric value for progress
  const numericValue = parseInt(primaryValue.replace(/[^0-9]/g, ''));
  const progressValue = Math.min(100, numericValue);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-neutral-800/20 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden shadow-lg transition-all duration-300"
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ cursor: 'pointer' }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-block px-2.5 py-1 bg-secondary-900/40 text-secondary-400 text-xs font-medium rounded">
            {caseStudy.industry}
          </span>
          <div className="w-8 h-8 rounded-full bg-neutral-700/50 flex items-center justify-center">
            <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{caseStudy.title}</h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-neutral-400">
              {primaryMetric.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-sm font-medium text-secondary-400">
              {primaryValue}
            </span>
          </div>
          <Progress value={progressValue} className="h-1.5" />
        </div>
        
        <p className="text-neutral-300 text-sm line-clamp-2 mb-4">{caseStudy.challenge}</p>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Separator className="my-4 bg-neutral-700" />
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-1">Solution</h4>
                <p className="text-neutral-300 text-sm">{caseStudy.solution}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-1">Results</h4>
                <p className="text-neutral-300 text-sm">{caseStudy.results}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-6">
                {Object.entries(caseStudy.metrics).map(([key, value], idx) => (
                  <div 
                    key={key}
                    className="bg-neutral-800/40 rounded-lg p-2 text-center"
                  >
                    <span className="block text-lg font-bold text-secondary-400">{value}</span>
                    <span className="text-xs text-neutral-400">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button size="sm" className="w-full bg-secondary-500 hover:bg-secondary-600 text-white">
                  View Full Case Study
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}