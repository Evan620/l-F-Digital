import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Filter, CheckCircle, ArrowDown, ChevronRight, 
  Zap, PieChart, Users, Clock, Rocket, BarChart3,
  LineChart, Upload, Star, Play, Sparkles, Globe, X
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

// Import our new components
import InteractiveCaseStudyCard from '@/components/InteractiveCaseStudyCard';
import SocialProofGalaxy from '@/components/SocialProofGalaxy';
import AISuccessLab from '@/components/AISuccessLab';
import ROICalculator from '@/components/ROICalculator';

export default function CaseStudies() {
  const { toast } = useToast();
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedChallengeType, setSelectedChallengeType] = useState('all');
  const [resultsTimeframe, setResultsTimeframe] = useState(6);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [customCaseStudy, setCustomCaseStudy] = useState<CaseStudy | null>(null);
  const [showRoiCalculator, setShowRoiCalculator] = useState(false);
  const [companySize, setCompanySize] = useState(50);
  const [annualRevenue, setAnnualRevenue] = useState(1000000);
  const [estimatedRoi, setEstimatedRoi] = useState('0');
  const [userIndustry, setUserIndustry] = useState('technology');
  const [showGalaxy, setShowGalaxy] = useState(false);
  
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
    
    // Simplified challenge type matching - this would be more sophisticated in a real app
    const matchesChallengeType = selectedChallengeType === 'all';
    
    return matchesIndustry && matchesChallengeType;
  });
  
  // Get unique industries for filtering
  const industries = ['all', ...Array.from(new Set(caseStudies.map(study => study.industry.toLowerCase())))];
  
  // Handle selecting a case study for details
  const handleSelectCaseStudy = (caseStudy: CaseStudy) => {
    setSelectedCaseStudy(caseStudy);
    // Open ROI calculator with the selected case study
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

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-500 hover:to-secondary-400"
                  onClick={() => document.getElementById('case-explorer')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Case Studies
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setShowGalaxy(true)}
                >
                  View Client Galaxy
                  <Star className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Case Study Explorer - "Choose Your Adventure" */}
        <section id="case-explorer" className="mb-20">
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
          
          {/* Explorer Interface - The Futuristic Control Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-neutral-800/30 backdrop-blur-sm rounded-xl border border-neutral-700 p-6 mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Industry Filter - Rotating Planetary Icons */}
              <div>
                <label htmlFor="industry" className="block text-neutral-300 text-sm mb-2">Industry</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['technology', 'finance', 'healthcare', 'retail'].map((industry) => (
                    <Button 
                      key={industry}
                      variant={selectedIndustry === industry ? "secondary" : "outline"}
                      className="flex flex-col items-center justify-center p-3 h-auto aspect-square"
                      onClick={() => setSelectedIndustry(industry)}
                    >
                      <motion.div
                        animate={{ rotate: selectedIndustry === industry ? 360 : 0 }}
                        transition={{ duration: 2, repeat: selectedIndustry === industry ? Infinity : 0, ease: "linear" }}
                      >
                        {getIndustryIcon(industry)}
                      </motion.div>
                      <span className="mt-2 text-xs">
                        {industry.charAt(0).toUpperCase() + industry.slice(1)}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Challenge Type - Toggle Buttons */}
              <div>
                <label htmlFor="challenge-type" className="block text-neutral-300 text-sm mb-2">Challenge Type</label>
                <div className="space-y-2">
                  {[
                    { id: 'time-wasters', label: 'Time Wasters', icon: <Clock className="h-4 w-4 mr-2" /> },
                    { id: 'revenue-leaks', label: 'Revenue Leaks', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
                    { id: 'scaling-walls', label: 'Scaling Walls', icon: <Rocket className="h-4 w-4 mr-2" /> }
                  ].map(({ id, label, icon }) => (
                    <Button 
                      key={id}
                      variant={selectedChallengeType === id ? "secondary" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedChallengeType(id)}
                    >
                      {icon}
                      {label}
                      {selectedChallengeType === id && (
                        <CheckCircle className="ml-auto h-4 w-4" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Results Timeframe Slider */}
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
                  className="mb-6"
                />
                
                <div className="flex justify-between text-xs text-neutral-400 mb-4">
                  <span>Quick Fixes</span>
                  <span>Total Overhauls</span>
                </div>
                
                <Button variant="secondary" className="w-full">
                  Generate Solution Flowchart
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Case Study Cards Grid - Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {isLoadingCaseStudies ? (
              // Loading skeleton
              Array(3).fill(0).map((_, idx) => (
                <div 
                  key={idx} 
                  className="animate-pulse bg-neutral-800/50 rounded-xl h-96"
                ></div>
              ))
            ) : filteredCaseStudies.length === 0 ? (
              // No results
              <div className="col-span-full py-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                  <Filter className="h-6 w-6 text-neutral-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No matching case studies</h3>
                <p className="text-neutral-400 max-w-md mx-auto mb-4">
                  Try adjusting your filters or view all case studies
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedIndustry('all');
                    setSelectedChallengeType('all');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              // Render case study cards
              filteredCaseStudies.map((caseStudy, idx) => (
                <InteractiveCaseStudyCard 
                  key={caseStudy.id} 
                  caseStudy={caseStudy} 
                  onSelect={handleSelectCaseStudy}
                  index={idx}
                />
              ))
            )}
          </div>
          
          {/* Social Proof Galaxy Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <Button 
              size="lg" 
              variant="outline"
              className="bg-gradient-to-r from-secondary-900/50 to-primary-900/50 border-secondary-800/50"
              onClick={() => setShowGalaxy(true)}
            >
              <Star className="mr-2 h-5 w-5 text-secondary-400" />
              Explore Client Constellations
            </Button>
          </motion.div>
        </section>
        
        {/* AI Success Lab Section */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-secondary-400 text-sm font-medium mb-4">
              AI-Powered Lab
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Clone This Success
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Upload your business challenge and let our AI generate a personalized roadmap based on our past success stories
            </p>
          </motion.div>
          
          <AISuccessLab initialIndustry={userIndustry} />
        </section>
        
        {/* ROI Calculator Section */}
        {showRoiCalculator && selectedCaseStudy && (
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
                What Could YOU Save?
              </h2>
              <p className="text-neutral-300 max-w-2xl mx-auto">
                Based on the case study: <span className="text-white font-medium">{selectedCaseStudy.title}</span>
              </p>
            </motion.div>
            
            <ROICalculator caseStudy={selectedCaseStudy} />
          </section>
        )}
        
        {/* Become the Next Case Study CTA */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-xl overflow-hidden bg-gradient-to-br from-neutral-900 via-secondary-900/20 to-neutral-900 border border-neutral-800"
          >
            <div className="p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-6">
                  Let's Turn Your Chaos Into Our Next Masterpiece
                </h2>
                <p className="text-neutral-300 mb-8">
                  Every case study begins with a problem just like yours. Take the first step toward becoming our next success story.
                </p>
                
                <div className="bg-neutral-800/50 rounded-lg p-6 mb-8 border border-neutral-700 max-w-xl mx-auto">
                  <div className="flex items-center mb-4">
                    <Input 
                      placeholder="Your Company Name" 
                      className="bg-neutral-900 border-neutral-700"
                    />
                    <Select defaultValue="technology">
                      <SelectTrigger className="ml-4 w-40 bg-neutral-900 border-neutral-700">
                        <SelectValue placeholder="Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Potential Time Savings</span>
                      <span className="text-white font-bold">40-60%</span>
                    </div>
                    <Progress value={50} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Projected ROI</span>
                      <span className="text-secondary-400 font-bold">200-300%</span>
                    </div>
                    <Progress value={75} className="h-2 bg-neutral-700">
                      <div className="h-full bg-gradient-to-r from-secondary-600 to-secondary-400 rounded-full" />
                    </Progress>
                  </div>
                  
                  <Button className="w-full">
                    Begin Your Success Story
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* "Behind the Code" Time Machine */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-primary-400 text-sm font-medium mb-4">
              Behind The Code
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              The Transformation Journey
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              See how we transform chaotic spreadsheets into sleek automated systems
            </p>
          </motion.div>
          
          <div className="bg-neutral-800/30 backdrop-blur-sm rounded-xl border border-neutral-700 p-6 mb-12">
            <div className="relative">
              <div className="absolute top-0 left-0 w-full flex justify-between px-4 z-10">
                <div className="w-6 h-6 rounded-full bg-neutral-800 border-4 border-primary-500"></div>
                <div className="w-6 h-6 rounded-full bg-neutral-800 border-4 border-secondary-500"></div>
              </div>
              
              <div className="absolute top-3 left-0 w-full">
                <div className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
              </div>
              
              <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Before */}
                <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
                  <div className="p-4 bg-primary-900/30 border-b border-primary-800/50">
                    <h3 className="text-lg font-bold text-white">Before</h3>
                    <p className="text-neutral-400 text-sm">Chaotic manual processes</p>
                  </div>
                  <div className="p-4">
                    <div className="bg-neutral-700/50 rounded-md p-3 mb-3">
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-4 bg-neutral-600 rounded"></div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="h-3 bg-neutral-600/50 rounded"></div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 w-3/4 bg-neutral-700 rounded"></div>
                      <div className="h-4 w-full bg-neutral-700 rounded"></div>
                      <div className="h-4 w-5/6 bg-neutral-700 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-neutral-500">Manual updates</span>
                      <span className="text-xs text-red-500">4 hours daily</span>
                    </div>
                  </div>
                </div>
                
                {/* During */}
                <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
                  <div className="p-4 bg-secondary-900/50 border-b border-secondary-800/70">
                    <h3 className="text-lg font-bold text-white">During</h3>
                    <p className="text-neutral-400 text-sm">Our bots and AI working</p>
                  </div>
                  <div className="p-4">
                    <div className="relative h-40 bg-neutral-900 rounded-md p-3 mb-3 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.05, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-20 h-20 rounded-full bg-secondary-500/20 flex items-center justify-center"
                        >
                          <Zap className="h-10 w-10 text-secondary-400" />
                        </motion.div>
                      </div>
                      <motion.div
                        animate={{ 
                          x: [-20, 220, -20]
                        }}
                        transition={{ 
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute top-10 left-0 h-2 w-10 bg-primary-500/50 rounded-full"
                      ></motion.div>
                      <motion.div
                        animate={{ 
                          x: [220, -20, 220]
                        }}
                        transition={{ 
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute top-20 left-0 h-2 w-8 bg-secondary-500/50 rounded-full"
                      ></motion.div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-neutral-700 rounded overflow-hidden">
                        <motion.div 
                          className="h-full bg-secondary-600" 
                          animate={{ width: ['0%', '75%'] }}
                          transition={{ duration: 2 }}
                        ></motion.div>
                      </div>
                      <div className="h-4 bg-neutral-700 rounded overflow-hidden">
                        <motion.div 
                          className="h-full bg-secondary-600" 
                          animate={{ width: ['0%', '45%'] }}
                          transition={{ duration: 2, delay: 0.3 }}
                        ></motion.div>
                      </div>
                      <div className="h-4 bg-neutral-700 rounded overflow-hidden">
                        <motion.div 
                          className="h-full bg-secondary-600" 
                          animate={{ width: ['0%', '90%'] }}
                          transition={{ duration: 2, delay: 0.6 }}
                        ></motion.div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-neutral-500">Processing</span>
                      <span className="text-xs text-secondary-500">Building automation</span>
                    </div>
                  </div>
                </div>
                
                {/* After */}
                <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
                  <div className="p-4 bg-gradient-to-r from-secondary-900/50 to-primary-900/50 border-b border-secondary-800/70">
                    <h3 className="text-lg font-bold text-white">After</h3>
                    <p className="text-neutral-400 text-sm">Sleek dashboards and automation</p>
                  </div>
                  <div className="p-4">
                    <div className="bg-neutral-900 rounded-md p-3 mb-3">
                      <div className="flex justify-between mb-2">
                        <div className="flex space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-3 w-3 bg-secondary-600 rounded-sm"></div>
                          ))}
                        </div>
                        <div className="flex space-x-1">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-3 w-3 bg-primary-600 rounded-sm"></div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-14 rounded bg-gradient-to-br from-secondary-500/20 to-secondary-700/20 border border-secondary-700/30 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-secondary-500/30"></div>
                        </div>
                        <div className="h-14 rounded bg-gradient-to-br from-primary-500/20 to-primary-700/20 border border-primary-700/30 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-primary-500/30"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4 p-2 rounded bg-neutral-700/20">
                      <span className="text-xs text-white">Daily Updates</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">Automated</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-neutral-500">Time spent</span>
                      <span className="text-xs text-green-500">5 minutes daily</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Button variant="secondary" className="relative overflow-hidden">
                <span className="relative z-10">Upload Your System for a Transformation Preview</span>
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600"
                  animate={{ 
                    x: ['-100%', '100%'],
                    opacity: [0.5, 0.2, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                ></motion.span>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Social Proof Galaxy Modal */}
      <AnimatePresence>
        {showGalaxy && (
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
              className="bg-neutral-900 rounded-xl border border-neutral-700 max-w-4xl w-full overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center">
                  <Star className="mr-2 h-4 w-4 text-secondary-400" />
                  Client Constellations
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowGalaxy(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-4 flex-grow overflow-auto">
                <p className="text-neutral-400 mb-6">
                  Explore our universe of clients. Each star represents a successful project.
                  Connect stars to uncover patterns and insights.
                </p>
                
                <SocialProofGalaxy caseStudies={caseStudies} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}