import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Filter, CheckCircle2, ArrowDown, Database, Settings, ChevronRight, 
  Zap, PieChart, Users, Clock, TrendingUp, PlusCircle, MinusCircle,
  BarChart, LineChart, Rocket, Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { type Service, type CaseStudy } from '@shared/schema';
import AIChatInterface from '@/components/AIChatInterface';
import ServiceDetailModal from '@/components/ServiceDetailModal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Services() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [businessChallenge, setBusinessChallenge] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedAIPersona, setSelectedAIPersona] = useState('expert');
  const [timelineValue, setTimelineValue] = useState(6);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  
  // AI recommendation states
  const [recommendedServices, setRecommendedServices] = useState<(Service & { explanation?: string })[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Quiz/Game state
  const [quizVisible, setQuizVisible] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({
    businessSize: '',
    challengeType: '',
    timeframe: '',
    budget: '',
    techComfort: ''
  });
  const [quizProgress, setQuizProgress] = useState(0);
  
  // Case studies state
  const { data: caseStudies = [], isLoading: isLoadingCaseStudies } = useQuery<CaseStudy[]>({
    queryKey: ['/api/case-studies'],
  });
  
  // ROI Builder state
  const [roiTimeframeMonths, setRoiTimeframeMonths] = useState(6);
  
  // Fetch all services
  const { data: allServices = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Filter services based on search query and filters
  const filteredServices = allServices.filter((service) => {
    const matchesSearch = 
      searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      service.category.toLowerCase() === selectedCategory.toLowerCase();
    
    // In a real app, we'd have budget ranges in the API
    // This is a simplified implementation
    const matchesBudget = selectedBudget === 'all';
    
    return matchesSearch && matchesCategory && matchesBudget;
  });

  // Toggle chat interface
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  // Get unique categories for filtering
  const categories = ['all', ...Array.from(new Set(allServices.map(service => service.category.toLowerCase())))];
  
  // Functions for handling card swipe in case studies
  const dragX = useMotionValue(0);
  const dragControls = useRef(null);
  
  // Update the active case study index when swiped
  const handleSwipe = (direction) => {
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === 'right') {
        setActiveIndex(activeIndex === 0 ? caseStudies.length - 1 : activeIndex - 1);
      } else {
        setActiveIndex((activeIndex + 1) % caseStudies.length);
      }
      setSwipeDirection(null);
      dragX.set(0);
    }, 300);
  };
  
  // Handle AI persona selection
  const handlePersonaSelect = (persona) => {
    setSelectedAIPersona(persona);
    toast({
      title: "AI Persona Selected",
      description: `You've chosen the ${persona} persona. Your recommendations will be tailored accordingly.`,
    });
  };
  
  // Calculate the ROI based on timeline
  const calculateRoi = (months) => {
    // Simple calculation for demo
    const baseRoi = 120; // 120% ROI at 6 months
    const multiplier = months / 6;
    return Math.round(baseRoi * multiplier);
  };
  
  // Handle quiz progress
  const nextQuizStep = (answer) => {
    // Update the answer for the current step
    setQuizAnswers({...quizAnswers, [Object.keys(quizAnswers)[quizStep]]: answer});
    
    if (quizStep < 4) {
      setQuizStep(quizStep + 1);
      setQuizProgress((quizStep + 1) * 20);
    } else {
      // Quiz complete, show result
      setQuizProgress(100);
      setTimeout(() => {
        handleFindSolutions();
        setQuizVisible(false);
        setQuizStep(0);
        setQuizProgress(0);
      }, 1000);
    }
  };
  
  // Handle service recommendation
  const handleFindSolutions = async () => {
    if (!businessChallenge.trim() && !quizAnswers.challengeType) {
      toast({
        title: "Input required",
        description: "Please describe your business challenge to find AI-powered solutions.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create a challenge description from either direct input or quiz answers
      const challenge = businessChallenge.trim() || 
        `Business size: ${quizAnswers.businessSize}. Challenge: ${quizAnswers.challengeType}. 
         Timeframe: ${quizAnswers.timeframe}. Budget: ${quizAnswers.budget}. 
         Technical comfort: ${quizAnswers.techComfort}.`;
      
      const response = await apiRequest('POST', '/api/ai/service-recommendation', {
        businessChallenge: challenge,
      });
      
      const data = await response.json();
      
      if (data.serviceSuggestions && data.serviceSuggestions.length > 0) {
        setRecommendedServices(data.serviceSuggestions);
        setShowRecommendations(true);
      } else {
        // Fallback to showing all services if AI recommendations fail
        setRecommendedServices(allServices.slice(0, 3).map((service: Service) => ({
          ...service,
          explanation: "This service might help address your business challenge."
        })));
        setShowRecommendations(true);
      }
      
      // Scroll to recommendations
      document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      toast({
        title: "Recommendation failed",
        description: "We couldn't generate service recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get the appropriate service icon
  const getServiceIcon = (iconKey: string | undefined) => {
    switch(iconKey) {
      case 'lightning-bolt':
        return <Zap className="h-12 w-12 text-primary-500" />;
      case 'chart-pie':
        return <PieChart className="h-12 w-12 text-secondary-500" />;
      case 'users':
        return <Users className="h-12 w-12 text-purple-500" />;
      default:
        return <Rocket className="h-12 w-12 text-primary-500" />;
    }
  };
  
  return (
    <div className="relative min-h-screen bg-neutral-900 text-neutral-100">
      {/* Background elements with animated nodes */}
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
          <motion.div 
            className="absolute top-1/3 right-1/4 w-40 h-40 bg-purple-600/10 rounded-full filter blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
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
        {/* Hero Section - Dynamic & Personalized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-primary-900/30 to-neutral-900 mb-16 shadow-2xl"
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full opacity-20"
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                repeatType: "reverse", 
                ease: "linear" 
              }}
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%2338bdf8\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              }}
            ></motion.div>
          </div>
          
          <div className="relative px-8 py-20 md:px-16 md:py-24">
            <motion.div 
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/30 text-primary-300 text-sm font-medium mb-4 backdrop-blur-sm">
                Transform Your Business
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                We Don't Just Automate—<br />We Reinvent How You Grow.
              </h1>
              
              {/* Personalized AI Message - Would be dynamic in a real app */}
              <motion.div 
                className="bg-neutral-800/40 backdrop-blur-sm p-4 rounded-lg border border-primary-500/20 mb-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mr-4">
                    <Zap className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-lg text-white font-medium mb-1">AI Analysis Suggests:</p>
                    <p className="text-neutral-300">Automation can save your team up to <span className="text-secondary-400 font-bold">35%</span> of their daily tasks, freeing them for strategic work.</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Quick challenge input */}
              <motion.div 
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    value={businessChallenge}
                    onChange={(e) => setBusinessChallenge(e.target.value)}
                    placeholder="What's your biggest business challenge?"
                    className="flex-1 bg-white/10 border-primary-500/30 placeholder-neutral-400 text-white"
                  />
                  <Button 
                    onClick={handleFindSolutions}
                    disabled={loading}
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    {loading ? 'Finding Solutions...' : 'Find Solutions'}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <div className="text-center mt-4">
                  <Button 
                    variant="link" 
                    onClick={() => setQuizVisible(true)}
                    className="text-primary-300 hover:text-primary-200"
                  >
                    Try our 5-question challenge to find your perfect solution
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Service Categorization - Interactive Exploration */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary-900/50 text-primary-400 text-sm font-medium mb-4">
              Our Expertise
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Explore Our Service Categories
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Discover how our specialized teams can solve your unique challenges with AI-driven solutions
            </p>
          </motion.div>
          
          {/* Hexagon grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative bg-gradient-to-br from-blue-900/30 to-blue-700/10 rounded-xl border border-blue-500/20 p-6 group cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors duration-300">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">Automation Architects</h3>
                <p className="text-neutral-300 mb-4">Building intelligent workflows that eliminate repetitive tasks</p>
                
                <div className="mt-2 pt-4 border-t border-blue-500/20 flex justify-between items-center">
                  <span className="text-sm text-blue-400">3 services</span>
                  <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative bg-gradient-to-br from-purple-900/30 to-purple-700/10 rounded-xl border border-purple-500/20 p-6 group cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors duration-300">
                  <PieChart className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">AI Alchemists</h3>
                <p className="text-neutral-300 mb-4">Transforming raw data into golden business insights</p>
                
                <div className="mt-2 pt-4 border-t border-purple-500/20 flex justify-between items-center">
                  <span className="text-sm text-purple-400">4 services</span>
                  <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="relative bg-gradient-to-br from-secondary-900/30 to-secondary-700/10 rounded-xl border border-secondary-500/20 p-6 group cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:blur-3xl group-hover:bg-secondary-500/20 transition-all duration-700"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-secondary-500/20 flex items-center justify-center mb-4 group-hover:bg-secondary-500/30 transition-colors duration-300">
                  <Rocket className="w-8 h-8 text-secondary-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-secondary-300 transition-colors duration-300">Revenue Rockets</h3>
                <p className="text-neutral-300 mb-4">Accelerating growth with AI-optimized sales funnels</p>
                
                <div className="mt-2 pt-4 border-t border-secondary-500/20 flex justify-between items-center">
                  <span className="text-sm text-secondary-400">3 services</span>
                  <ChevronRight className="w-5 h-5 text-secondary-400 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="relative bg-gradient-to-br from-emerald-900/30 to-emerald-700/10 rounded-xl border border-emerald-500/20 p-6 group cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors duration-300">
                  <Settings className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors duration-300">Tech Surgeons</h3>
                <p className="text-neutral-300 mb-4">Diagnosing and fixing digital inefficiencies with precision</p>
                
                <div className="mt-2 pt-4 border-t border-emerald-500/20 flex justify-between items-center">
                  <span className="text-sm text-emerald-400">2 services</span>
                  <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Services Showcase - Immersive Cards */}
        <section id="recommendations" className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-primary-400 text-sm font-medium mb-4">
              {showRecommendations ? 'Your Recommendations' : 'Featured Services'}
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              {showRecommendations ? 'AI-Recommended Solutions' : 'Our Most Impactful Solutions'}
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              {showRecommendations 
                ? 'Based on your business challenge, our AI has identified these solutions to help you succeed' 
                : 'Explore our most popular services that consistently deliver measurable ROI for our clients'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {isLoading ? (
              // Loading placeholders
              Array(3).fill(0).map((_, i) => (
                <motion.div
                  key={`loading-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-96 bg-neutral-800/20 animate-pulse rounded-xl"
                />
              ))
            ) : showRecommendations ? (
              // Show recommended services
              recommendedServices.map((service, index) => (
                <ImmersiveServiceCard 
                  key={`recommendation-${service.id}`}
                  service={service}
                  index={index}
                  isRecommended={true}
                  allServices={allServices}
                />
              ))
            ) : (
              // Show featured services
              filteredServices.slice(0, 3).map((service, index) => (
                <ImmersiveServiceCard 
                  key={`service-${service.id}`}
                  service={service}
                  index={index}
                  isRecommended={false}
                  allServices={allServices}
                />
              ))
            )}
          </div>
          
          {/* Services filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-neutral-800/20 rounded-xl border border-neutral-700 p-5 mb-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services..." 
                    className="w-full bg-neutral-800/40 border-neutral-700 placeholder-neutral-400"
                  />
                </div>
              </div>
              
              {/* Category filter */}
              <div>
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="bg-neutral-800/40 border-neutral-700">
                    <span className="flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Budget filter */}
              <div>
                <Select 
                  value={selectedBudget} 
                  onValueChange={setSelectedBudget}
                >
                  <SelectTrigger className="bg-neutral-800/40 border-neutral-700">
                    <span className="flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Budget" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Budget</SelectItem>
                    <SelectItem value="low">$1K-5K</SelectItem>
                    <SelectItem value="medium">$5K-15K</SelectItem>
                    <SelectItem value="high">$15K+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
          
          {/* Services grid with all services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <motion.div
                  key={`loading-grid-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-80 bg-neutral-800/20 animate-pulse rounded-xl"
                />
              ))
            ) : filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <SimpleServiceCard key={service.id} service={service} />
              ))
            ) : (
              <div className="col-span-3 text-center py-16 bg-neutral-800/20 rounded-xl border border-neutral-700">
                <p className="text-neutral-400">No services found matching your criteria.</p>
                <Button variant="link" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedBudget('all');
                }}>
                  Reset filters
                </Button>
              </div>
            )}
          </div>
        </section>
        
        {/* Social Proof - Automation in Action (Case Studies) */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-secondary-400 text-sm font-medium mb-4">
              Automation in Action
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Real Results for Real Businesses
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Swipe through our case studies to see how we've helped businesses like yours achieve transformative results
            </p>
          </motion.div>
          
          {/* Case Studies Swiper */}
          <div className="relative max-w-4xl mx-auto mb-12 h-96">
            {isLoadingCaseStudies ? (
              <div className="h-full bg-neutral-800/20 animate-pulse rounded-xl"></div>
            ) : caseStudies.length > 0 ? (
              <div className="relative h-full">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={activeIndex}
                    className="absolute inset-0"
                    initial={{ 
                      opacity: 0, 
                      x: swipeDirection === 'left' ? 300 : swipeDirection === 'right' ? -300 : 0
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ 
                      opacity: 0, 
                      x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 300;
                      if (swipe) {
                        const direction = offset.x > 0 ? 'right' : 'left';
                        handleSwipe(direction);
                      }
                    }}
                  >
                    <div className="h-full bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 rounded-xl border border-neutral-700 overflow-hidden shadow-xl">
                      <div className="h-full p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="inline-block px-2.5 py-1 bg-secondary-900/40 text-secondary-400 text-xs font-medium rounded mb-2">
                              {caseStudies[activeIndex].industry}
                            </span>
                            <h3 className="text-2xl font-bold text-white">{caseStudies[activeIndex].title}</h3>
                          </div>
                          <div className="flex gap-1">
                            {caseStudies.map((_, idx) => (
                              <motion.div 
                                key={idx} 
                                className={`w-2 h-2 rounded-full ${idx === activeIndex ? 'bg-secondary-500' : 'bg-neutral-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
                          <div className="flex flex-col">
                            <div className="mb-4">
                              <h4 className="text-neutral-400 text-sm uppercase tracking-wider mb-2">Challenge</h4>
                              <p className="text-white">{caseStudies[activeIndex].challenge}</p>
                            </div>
                            <div>
                              <h4 className="text-neutral-400 text-sm uppercase tracking-wider mb-2">Solution</h4>
                              <p className="text-white">{caseStudies[activeIndex].solution}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col">
                            <div className="mb-6">
                              <h4 className="text-neutral-400 text-sm uppercase tracking-wider mb-2">Results</h4>
                              <p className="text-white">{caseStudies[activeIndex].results}</p>
                            </div>
                            
                            <div className="mt-auto grid grid-cols-3 gap-2">
                              {Object.entries(caseStudies[activeIndex].metrics).map(([key, value], idx) => (
                                <motion.div 
                                  key={key}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="bg-neutral-800/40 rounded-lg p-3 text-center"
                                >
                                  <span className="block text-2xl font-bold text-secondary-400">{value}</span>
                                  <span className="text-xs text-neutral-400">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Swipe instruction */}
                <motion.div 
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-neutral-400 text-sm flex items-center gap-2 bg-neutral-800/40 px-3 py-1.5 rounded-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <motion.path 
                      d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      initial={{ x: 5 }}
                      animate={{ x: 0 }}
                      transition={{ repeat: Infinity, duration: 1, repeatType: "mirror" }}
                    />
                  </svg>
                  Swipe to explore more case studies
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <motion.path 
                      d="M14 5l7 7m0 0l-7 7m7-7H3" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      initial={{ x: -5 }}
                      animate={{ x: 0 }}
                      transition={{ repeat: Infinity, duration: 1, repeatType: "mirror" }}
                    />
                  </svg>
                </motion.div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-neutral-800/20 rounded-xl border border-neutral-700">
                <p className="text-neutral-400">No case studies available</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Comparison Tool - Build Your Stack */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-primary-400 text-sm font-medium mb-4">
              Build Your Stack
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Create Your Custom Solution
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Select your business challenges to see how our solutions work together to solve complex problems
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-neutral-800/20 rounded-xl border border-neutral-700 p-8 mb-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Select Your Challenges</h3>
                <div className="space-y-3">
                  <Challenge 
                    title="Manual Data Entry" 
                    description="Your team spends hours entering data into multiple systems"
                    icon={<Input className="h-4 w-4" />}
                  />
                  <Challenge 
                    title="Disjointed Workflows" 
                    description="Information gets lost between teams and departments"
                    icon={<Settings className="h-4 w-4" />}
                  />
                  <Challenge 
                    title="Customer Churn" 
                    description="Unable to identify at-risk customers before they leave"
                    icon={<Users className="h-4 w-4" />}
                  />
                  <Challenge 
                    title="Slow Reporting" 
                    description="Business insights take too long to compile and analyze"
                    icon={<BarChart className="h-4 w-4" />}
                  />
                  <Challenge 
                    title="Unpredictable Revenue" 
                    description="Sales forecasting is more guesswork than science"
                    icon={<LineChart className="h-4 w-4" />}
                  />
                </div>
                
                <div className="mt-6">
                  <Button className="bg-primary-600 hover:bg-primary-500 w-full">
                    Generate Custom Solution Stack
                  </Button>
                </div>
              </div>
              
              <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Your Solution Preview</h3>
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-neutral-400">
                    <svg 
                      className="w-12 h-12 mx-auto mb-3 text-neutral-500" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                      />
                    </svg>
                    <p>Select challenges to build your custom solution stack</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* Pricing Transparency - Without Numbers */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-secondary-400 text-sm font-medium mb-4">
              ROI Timeline
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Your Journey to Results
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              See how your investment translates to measurable outcomes over time
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 rounded-xl border border-neutral-700 p-8 mb-10"
          >
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-neutral-400">Timeline (months)</span>
                  <span className="text-white font-medium">{roiTimeframeMonths} months</span>
                </div>
                <Slider
                  value={[roiTimeframeMonths]}
                  min={1}
                  max={12}
                  step={1}
                  onValueChange={(value) => setRoiTimeframeMonths(value[0])}
                  className="mb-8"
                />
                
                <div className="relative">
                  <div className="absolute left-0 top-0 h-full w-1 bg-neutral-800 rounded-full">
                    <motion.div 
                      className="w-full bg-secondary-500 rounded-full"
                      initial={{ height: '0%' }}
                      animate={{ height: `${(roiTimeframeMonths / 12) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                  
                  <div className="ml-6 space-y-12">
                    <TimelineItem 
                      title="Phase 1: Foundation (Months 1-3)"
                      isActive={roiTimeframeMonths >= 3}
                      items={[
                        "Initial assessment and strategy development",
                        "Integration setup and data mapping",
                        "System configuration and workflow design",
                        "Team training and onboarding"
                      ]}
                      metrics={[
                        { label: "Efficiency Gain", value: "10%" },
                        { label: "Time Saved", value: "5-10 hrs/week" },
                      ]}
                    />
                    
                    <TimelineItem 
                      title="Phase 2: Optimization (Months 4-6)"
                      isActive={roiTimeframeMonths >= 6}
                      items={[
                        "Workflow refinement based on usage data",
                        "Advanced automation triggers implemented",
                        "Custom reports and dashboards created",
                        "Key performance indicators established"
                      ]}
                      metrics={[
                        { label: "Efficiency Gain", value: "35%" },
                        { label: "Cost Reduction", value: "20%" },
                        { label: "Revenue Impact", value: "15% ↑" },
                      ]}
                    />
                    
                    <TimelineItem 
                      title="Phase 3: Expansion (Months 7-9)"
                      isActive={roiTimeframeMonths >= 9}
                      items={[
                        "Expanded implementation across departments",
                        "AI-driven predictive analysis activated",
                        "Customer-facing improvements deployed",
                        "Integration with additional business systems"
                      ]}
                      metrics={[
                        { label: "Efficiency Gain", value: "65%" },
                        { label: "Cost Reduction", value: "40%" },
                        { label: "Revenue Impact", value: "25% ↑" },
                      ]}
                    />
                    
                    <TimelineItem 
                      title="Phase 4: Transformation (Months 10-12)"
                      isActive={roiTimeframeMonths >= 12}
                      items={[
                        "Full-scale implementation across organization",
                        "Advanced AI models trained on company data",
                        "Autonomous decision-making systems active",
                        "Continuous improvement framework established"
                      ]}
                      metrics={[
                        { label: "Efficiency Gain", value: "120%" },
                        { label: "Cost Reduction", value: "65%" },
                        { label: "Revenue Impact", value: "40% ↑" },
                        { label: "Total ROI", value: "300%+" },
                      ]}
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-neutral-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ExchangeItem 
                    title="You Focus On Strategy"
                    description="Dedicate your valuable time to growth initiatives and innovation"
                    icon={<LineChart className="h-5 w-5" />}
                  />
                  <ExchangeItem 
                    title="We Handle The Grind"
                    description="Let our automation tackle repetitive tasks and data processing"
                    icon={<Settings className="h-5 w-5" />}
                  />
                  <ExchangeItem 
                    title="Everyone Wins"
                    description="Your team is happier, more productive, and creating more value"
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* CTA Section - Gamified Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16 bg-gradient-to-br from-primary-900/50 via-primary-800/20 to-neutral-900/80 rounded-xl border border-primary-700/20 overflow-hidden shadow-xl"
        >
          <div className="p-10 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500/10 rounded-full filter blur-3xl"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-6">
                Can We Solve Your Problem in 5 Questions?
              </h2>
              <p className="text-neutral-300 text-lg max-w-2xl mx-auto mb-8">
                Take our 5-question challenge and unlock a free personalized automation plan worth $2,000
              </p>
              
              <Button 
                size="lg"
                onClick={() => setQuizVisible(true)}
                className="bg-white text-primary-900 hover:bg-neutral-100"
              >
                Start the Challenge
              </Button>
              
              <div className="mt-8 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">3,429</div>
                  <div className="text-neutral-400 text-sm">Hours saved today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">176</div>
                  <div className="text-neutral-400 text-sm">Solutions built this month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">42</div>
                  <div className="text-neutral-400 text-sm">Current users online</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Chat interface */}
      <AIChatInterface isOpen={isChatOpen} onToggle={toggleChat} />
      
      {/* AI Persona Selector Modal (would be separate component in real app) */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${selectedAIPersona ? 'hidden' : 'opacity-100'}`}>
        <motion.div 
          className="bg-neutral-800 rounded-xl overflow-hidden shadow-2xl max-w-3xl w-full mx-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 bg-gradient-to-r from-primary-900/50 to-neutral-800/50 border-b border-neutral-700">
            <h3 className="text-xl font-bold text-white">Choose Your AI Advisor Style</h3>
            <p className="text-neutral-400">Select how you'd like your AI recommendations to be presented</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-4 border-neutral-700 hover:border-primary-500 hover:bg-primary-900/10"
                onClick={() => handlePersonaSelect('expert')}
              >
                <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center">
                  <Settings className="h-8 w-8 text-neutral-300" />
                </div>
                <div className="text-center">
                  <h4 className="text-white font-medium mb-1">The Expert</h4>
                  <p className="text-neutral-400 text-sm">Detailed, technical insights with depth</p>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-4 border-neutral-700 hover:border-primary-500 hover:bg-primary-900/10"
                onClick={() => handlePersonaSelect('visionary')}
              >
                <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-neutral-300" />
                </div>
                <div className="text-center">
                  <h4 className="text-white font-medium mb-1">The Visionary</h4>
                  <p className="text-neutral-400 text-sm">Future-focused with big picture thinking</p>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-4 border-neutral-700 hover:border-primary-500 hover:bg-primary-900/10"
                onClick={() => handlePersonaSelect('coach')}
              >
                <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center">
                  <Users className="h-8 w-8 text-neutral-300" />
                </div>
                <div className="text-center">
                  <h4 className="text-white font-medium mb-1">The Coach</h4>
                  <p className="text-neutral-400 text-sm">Supportive guidance with practical steps</p>
                </div>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* 5-Question Challenge Modal */}
      <AnimatePresence>
        {quizVisible && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-neutral-800 rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full mx-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 bg-gradient-to-r from-primary-900/50 to-neutral-800/50 border-b border-neutral-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">The 5-Question Challenge</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setQuizVisible(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    Close
                  </Button>
                </div>
                <Progress value={quizProgress} className="mt-4" />
              </div>
              
              <div className="p-6">
                {quizStep === 0 && (
                  <QuizQuestion
                    question="What size is your business?"
                    options={[
                      { label: "Small (1-10 employees)", value: "small" },
                      { label: "Medium (11-50 employees)", value: "medium" },
                      { label: "Large (51-200 employees)", value: "large" },
                      { label: "Enterprise (200+ employees)", value: "enterprise" }
                    ]}
                    onAnswer={(value) => nextQuizStep(value)}
                  />
                )}
                
                {quizStep === 1 && (
                  <QuizQuestion
                    question="What's your biggest challenge right now?"
                    options={[
                      { label: "Manual, repetitive tasks", value: "manual tasks" },
                      { label: "Data silos between departments", value: "data silos" },
                      { label: "Customer engagement and retention", value: "customer retention" },
                      { label: "Growth and scaling operations", value: "scaling" }
                    ]}
                    onAnswer={(value) => nextQuizStep(value)}
                  />
                )}
                
                {quizStep === 2 && (
                  <QuizQuestion
                    question="When do you need results?"
                    options={[
                      { label: "ASAP (within 30 days)", value: "urgent" },
                      { label: "This quarter", value: "this quarter" },
                      { label: "Within 6 months", value: "6 months" },
                      { label: "Long-term project (6-12 months)", value: "12 months" }
                    ]}
                    onAnswer={(value) => nextQuizStep(value)}
                  />
                )}
                
                {quizStep === 3 && (
                  <QuizQuestion
                    question="What's your budget range for this initiative?"
                    options={[
                      { label: "Under $5,000", value: "small" },
                      { label: "$5,000 - $15,000", value: "medium" },
                      { label: "$15,000 - $50,000", value: "large" },
                      { label: "Over $50,000", value: "enterprise" }
                    ]}
                    onAnswer={(value) => nextQuizStep(value)}
                  />
                )}
                
                {quizStep === 4 && (
                  <QuizQuestion
                    question="How would you rate your team's technical comfort?"
                    options={[
                      { label: "Very technical (developers on staff)", value: "very technical" },
                      { label: "Comfortable with technology", value: "comfortable" },
                      { label: "Some technical knowledge", value: "some knowledge" },
                      { label: "Limited technical expertise", value: "limited" }
                    ]}
                    onAnswer={(value) => nextQuizStep(value)}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CTA at bottom */}
      <div className="bg-neutral-800/60 border-t border-neutral-700 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-2xl text-white mb-4">Ready to transform your business?</h2>
          <p className="text-neutral-300 max-w-2xl mx-auto mb-6">
            Schedule a free consultation to discuss your specific needs and how our AI solutions can deliver measurable ROI.
          </p>
          <Button size="lg" className="bg-primary-600 hover:bg-primary-500">
            Book Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}

// Enhanced 3D Service Card Component
function ImmersiveServiceCard({ 
  service, 
  index, 
  isRecommended,
  allServices
}: { 
  service: Service & { explanation?: string }, 
  index: number,
  isRecommended: boolean,
  allServices: Service[]
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [additionalRecommendations, setAdditionalRecommendations] = useState<Service[]>([]);
  
  // Card tilt effect with mouse
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  const handleMouseMove = (e) => {
    if (!isHovered) return;
    
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const rotateY = ((mouseX - width / 2) / width) * 10; // -10 to +10 degrees
    const rotateX = ((height / 2 - mouseY) / height) * 10; // -10 to +10 degrees
    
    setRotateX(rotateX);
    setRotateY(rotateY);
  };
  
  const resetTilt = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };
  
  // Get category colors
  const getCategoryColor = (category: string) => {
    switch(category.toLowerCase()) {
      case 'automation':
        return 'from-blue-900/30 to-blue-700/10 border-blue-500/30';
      case 'analytics':
        return 'from-emerald-900/30 to-emerald-700/10 border-emerald-500/30';
      case 'customer experience':
        return 'from-purple-900/30 to-purple-700/10 border-purple-500/30';
      default:
        return 'from-primary-900/30 to-primary-700/10 border-primary-500/30';
    }
  };
  
  // Get icon for category
  const getServiceIcon = (iconKey: string | undefined) => {
    switch(iconKey) {
      case 'lightning-bolt':
        return <Zap className="h-12 w-12 text-blue-400" />;
      case 'chart-pie':
        return <PieChart className="h-12 w-12 text-emerald-400" />;
      case 'users':
        return <Users className="h-12 w-12 text-purple-400" />;
      default:
        return <Rocket className="h-12 w-12 text-primary-400" />;
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`rounded-xl overflow-hidden shadow-xl group perspective transform-gpu cursor-pointer ${isRecommended ? 'ring-2 ring-secondary-500/50' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={resetTilt}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        <div className={`bg-gradient-to-br ${getCategoryColor(service.category)} h-full flex flex-col`}>
          {isRecommended && (
            <div className="bg-secondary-500/20 border-b border-secondary-500/30 py-1.5 px-4 text-center">
              <span className="text-xs font-semibold text-secondary-300">AI Recommended</span>
            </div>
          )}
          
          <div className="p-6 flex-grow flex flex-col">
            {/* Header with icon and category */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  {getServiceIcon(service.iconKey)}
                </div>
                <span className="text-sm font-medium text-neutral-300">{service.category}</span>
              </div>
              
              {/* ROI Badge */}
              {service.averageROI && (
                <div className="bg-white/10 py-1 px-2.5 rounded backdrop-blur-sm">
                  <span className="text-xs font-semibold text-white">ROI: </span>
                  <span className="text-xs font-bold text-secondary-300">{service.averageROI}</span>
                </div>
              )}
            </div>
            
            <h3 className="font-display font-bold text-xl text-white mb-3 group-hover:text-secondary-300 transition-colors duration-300">
              {service.name}
            </h3>
            
            <p className="text-neutral-300 mb-5">{service.description}</p>
            
            {/* Recommendation explanation */}
            {isRecommended && service.explanation && (
              <div className="mb-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                <p className="text-sm text-neutral-200 italic">"{service.explanation}"</p>
              </div>
            )}
            
            {/* Feature list */}
            <div className="space-y-3 mb-6 flex-grow">
              {service.features?.map((feature, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="flex items-start gap-2"
                >
                  <div className="rounded-full bg-secondary-500/20 p-0.5 mt-1 flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-secondary-400" />
                  </div>
                  <span className="text-sm text-neutral-200">{feature}</span>
                </motion.div>
              ))}
            </div>
            
            {/* CTA Button */}
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(true);
                
                // Find related services as additional recommendations
                const relatedServices = allServices
                  ?.filter(s => s.id !== service.id)
                  .filter(s => {
                    // Find services that complement this one based on category
                    if (service.category.toLowerCase() === 'automation' && s.category.toLowerCase() === 'analytics') return true;
                    if (service.category.toLowerCase() === 'analytics' && s.category.toLowerCase() === 'automation') return true;
                    if (service.category.toLowerCase() === 'customer experience' && 
                      (s.category.toLowerCase() === 'automation' || s.category.toLowerCase() === 'analytics')) return true;
                    return false;
                  })
                  .slice(0, 2);
                  
                setAdditionalRecommendations(relatedServices || []);
              }}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/5 group-hover:bg-secondary-500/20 group-hover:border-secondary-500/30 transition-colors duration-300"
            >
              Learn More
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Service Details Modal */}
      <ServiceDetailModal 
        service={service} 
        open={showDetails} 
        onOpenChange={setShowDetails}
        additionalRecommendations={additionalRecommendations}
      />
    </>
  );
}

// Regular Service Card Component
function ServiceCard({ service }: { service: Service }) {
  const getCategoryColorClass = (category: string) => {
    switch(category.toLowerCase()) {
      case 'automation':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'analytics':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'customer experience':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
    }
  };
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-xl bg-neutral-800/20 border border-neutral-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-900/20 hover:border-neutral-600"
    >
      <div className="p-6">
        <div className={`mb-4 inline-block px-2.5 py-1 rounded text-xs font-medium ${getCategoryColorClass(service.category)}`}>
          {service.category}
        </div>
        
        <h3 className="font-display font-bold text-xl text-white mb-2">{service.name}</h3>
        <p className="text-neutral-400 mb-4 line-clamp-2">{service.description}</p>
        
        <Separator className="my-4 bg-neutral-800" />
        
        <div className="space-y-2 mb-6">
          {service.features?.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-neutral-300">{feature}</span>
            </div>
          ))}
          
          {(service.features?.length || 0) > 3 && (
            <div className="text-sm text-primary-400 pl-6">
              +{(service.features?.length || 0) - 3} more features
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {service.averageROI && (
            <div>
              <span className="text-xs uppercase text-neutral-500">Avg. ROI</span>
              <p className="text-secondary-400 font-bold">{service.averageROI}</p>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary-400 border-primary-500/50 hover:bg-primary-500/10"
          >
            Learn More
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Timeline Item Component
function TimelineItem({ 
  title, 
  items, 
  metrics, 
  isActive 
}: { 
  title: string, 
  items: string[], 
  metrics: { label: string, value: string }[],
  isActive: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: isActive ? 1 : 0.5 }}
      transition={{ duration: 0.5 }}
      className={`relative ${isActive ? 'text-white' : 'text-neutral-500'}`}
    >
      <div className="absolute -left-6 top-2 w-5 h-5 rounded-full border-2 border-neutral-700 bg-neutral-800 flex items-center justify-center">
        <motion.div 
          className={`w-3 h-3 rounded-full ${isActive ? 'bg-secondary-500' : 'bg-neutral-700'}`}
          animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatType: "reverse" }}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-bold mb-3">{title}</h3>
        
        <ul className="space-y-2 mb-4">
          {items.map((item, i) => (
            <motion.li 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isActive ? 1 : 0.6, x: 0 }}
              transition={{ delay: isActive ? i * 0.1 : 0 }}
              className="flex items-start gap-2"
            >
              <CheckCircle2 className={`h-4 w-4 ${isActive ? 'text-secondary-500' : 'text-neutral-600'} flex-shrink-0 mt-1`} />
              <span className="text-sm">{item}</span>
            </motion.li>
          ))}
        </ul>
        
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {metrics.map((metric, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isActive ? 1 : 0.5, scale: 1 }}
                transition={{ delay: isActive ? 0.3 + (i * 0.1) : 0 }}
                className={`p-2 rounded-lg ${isActive ? 'bg-secondary-900/20 border border-secondary-700/20' : 'bg-neutral-800/30'}`}
              >
                <div className={`text-sm ${isActive ? 'text-secondary-400' : 'text-neutral-500'} font-bold`}>
                  {metric.value}
                </div>
                <div className="text-xs text-neutral-500">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Exchange Item Component
function ExchangeItem({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="p-4 rounded-lg bg-neutral-800/20 border border-neutral-700"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-900/40 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-white font-medium mb-1">{title}</h3>
          <p className="text-sm text-neutral-400">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Challenge Item Component
function Challenge({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  const [selected, setSelected] = useState(false);
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-lg border ${selected ? 'bg-primary-900/20 border-primary-500/40' : 'bg-neutral-800/40 border-neutral-700'} cursor-pointer`}
      onClick={() => setSelected(!selected)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-6 h-6 rounded-full ${selected ? 'bg-primary-500' : 'bg-neutral-700'} flex items-center justify-center flex-shrink-0`}>
          {selected ? <Check className="h-3 w-3 text-white" /> : icon}
        </div>
        <div>
          <h3 className="text-white font-medium mb-1">{title}</h3>
          <p className="text-sm text-neutral-400">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Quiz Question Component
function QuizQuestion({ 
  question, 
  options, 
  onAnswer 
}: { 
  question: string, 
  options: { label: string, value: string }[],
  onAnswer: (value: string) => void 
}) {
  return (
    <div>
      <h3 className="text-xl font-medium text-white mb-6">{question}</h3>
      
      <div className="space-y-3">
        {options.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 text-left rounded-lg bg-neutral-700/30 hover:bg-primary-900/20 border border-neutral-600 hover:border-primary-500/40 transition-colors"
            onClick={() => onAnswer(option.value)}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Service Card Component - simpler version for Services page
function SimpleServiceCard({ service }: { service: Service }) {
  // Get category color class - different style than Home page
  const getCategoryColorClass = (category: string) => {
    switch(category.toLowerCase()) {
      case 'automation':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'analytics':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'customer experience':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
    }
  };
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-xl bg-neutral-800/20 border border-neutral-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-900/20 hover:border-neutral-600"
    >
      <div className="p-6">
        <div className={`mb-4 inline-block px-2.5 py-1 rounded text-xs font-medium ${getCategoryColorClass(service.category)}`}>
          {service.category}
        </div>
        
        <h3 className="font-display font-bold text-xl text-white mb-2">{service.name}</h3>
        <p className="text-neutral-400 mb-4 line-clamp-2">{service.description}</p>
        
        <Separator className="my-4 bg-neutral-800" />
        
        <div className="space-y-2 mb-6">
          {service.features?.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-neutral-300">{feature}</span>
            </div>
          ))}
          
          {(service.features?.length || 0) > 3 && (
            <div className="text-sm text-primary-400 pl-6">
              +{(service.features?.length || 0) - 3} more features
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {service.averageROI && (
            <div>
              <span className="text-xs uppercase text-neutral-500">Avg. ROI</span>
              <p className="text-secondary-400 font-bold">{service.averageROI}</p>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="border-primary-500 text-primary-400 hover:bg-primary-500/10"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}