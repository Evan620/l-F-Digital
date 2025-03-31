import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare, Send, Phone, Video, Calendar, AlertTriangle,
  Zap, Share2, ArrowRight, Copy, Clock, ChevronRight, Settings,
  MessageCircle, Mail, Code
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import GoogleCalendarBooking from '@/components/GoogleCalendarBooking';

export default function Contact() {
  const { toast } = useToast();
  const [interactionStep, setInteractionStep] = useState(1);
  const [contactMode, setContactMode] = useState<'chat' | 'call' | 'sos'>('chat');
  const [userMessage, setUserMessage] = useState('');
  const [businessProblem, setBusinessProblem] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [crisisMode, setCrisisMode] = useState(false);
  const [crisisCountdown, setCrisisCountdown] = useState(5);
  const [showReferralOptions, setShowReferralOptions] = useState(false);
  const [selectedCommunicationMethod, setSelectedCommunicationMethod] = useState('');
  const [calendarGrid, setCalendarGrid] = useState<number[][]>([]);
  const [bookingPoints, setBookingPoints] = useState(0);
  const [completedGridLines, setCompletedGridLines] = useState(0);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  
  // Live feed data
  const [liveFeedItems, setLiveFeedItems] = useState([
    { icon: '🟢', text: 'Fintech CEO booked audit 2m ago', id: 1 },
    { icon: '🔥', text: 'E-com brand gained $12K today using our bots', id: 2 },
    { icon: '🚀', text: 'Healthcare startup onboarding started', id: 3 },
    { icon: '💬', text: 'Tech company requested AI audit 5m ago', id: 4 },
    { icon: '⚡', text: 'Manufacturing firm saved 120 hours/week', id: 5 },
    { icon: '📊', text: 'Analytics setup complete for SaaS platform', id: 6 },
  ]);
  
  // Time slots for the gamified calendar
  const timeSlots = [
    { id: 1, day: 'Mon', time: '9:00 AM', available: true },
    { id: 2, day: 'Mon', time: '11:00 AM', available: true },
    { id: 3, day: 'Mon', time: '2:00 PM', available: false },
    { id: 4, day: 'Tue', time: '10:00 AM', available: true },
    { id: 5, day: 'Tue', time: '1:00 PM', available: true },
    { id: 6, day: 'Tue', time: '4:00 PM', available: true },
    { id: 7, day: 'Wed', time: '9:00 AM', available: false },
    { id: 8, day: 'Wed', time: '11:00 AM', available: true },
    { id: 9, day: 'Wed', time: '3:00 PM', available: true },
    { id: 10, day: 'Thu', time: '10:00 AM', available: true },
    { id: 11, day: 'Thu', time: '2:00 PM', available: false },
    { id: 12, day: 'Fri', time: '9:00 AM', available: true },
    { id: 13, day: 'Fri', time: '1:00 PM', available: true },
    { id: 14, day: 'Fri', time: '4:00 PM', available: true },
  ];
  
  // Initialize tetris-like calendar grid
  useEffect(() => {
    const grid: number[][] = [];
    for (let i = 0; i < 6; i++) {
      grid.push([0, 0, 0, 0, 0, 0, 0]);
    }
    
    // Place available slots randomly in the grid
    timeSlots.forEach(slot => {
      if (slot.available) {
        let row, col;
        do {
          row = Math.floor(Math.random() * 6);
          col = Math.floor(Math.random() * 7);
        } while (grid[row][col] !== 0);
        
        grid[row][col] = slot.id;
      }
    });
    
    setCalendarGrid(grid);
  }, []);
  
  // Handle AI Response
  useEffect(() => {
    if (isAiResponding) {
      const responses = [
        "I'd love to learn more about your business challenges. Could you tell me what specific processes you're looking to automate?",
        "Based on what you've shared, it sounds like our workflow automation solutions would be a great fit. Would you like to schedule a call with one of our experts?",
        "I can see that efficiency is a key concern for you. Our clients typically see a 40-60% reduction in manual tasks within the first month. Would you like to see some case studies?",
        "Your business problem seems unique. I think our team would need to create a custom solution. The best next step would be a brief consultation call.",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simulate typing effect
      let i = 0;
      const interval = setInterval(() => {
        setAiResponse(randomResponse.substring(0, i));
        i++;
        if (i > randomResponse.length) {
          clearInterval(interval);
          setIsAiResponding(false);
        }
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [isAiResponding]);
  
  // Crisis mode countdown
  useEffect(() => {
    if (crisisMode && crisisCountdown > 0) {
      const timer = setTimeout(() => {
        setCrisisCountdown(crisisCountdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (crisisMode && crisisCountdown === 0) {
      setContactMode('sos');
      setCrisisMode(false);
    }
  }, [crisisMode, crisisCountdown]);
  
  // Add new items to the live feed periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newItems = [
        { icon: '🟢', text: 'New client onboarded just now', id: Date.now() },
        { icon: '🔥', text: 'Client reported 85% time savings today', id: Date.now() },
        { icon: '🚀', text: 'Integration completed in record time', id: Date.now() },
        { icon: '💬', text: 'New automation request received', id: Date.now() },
        { icon: '⚡', text: 'Workflow optimization completed', id: Date.now() },
      ];
      
      const randomItem = newItems[Math.floor(Math.random() * newItems.length)];
      setLiveFeedItems(prev => [randomItem, ...prev.slice(0, 5)]);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Check for completed lines in the calendar grid (Tetris style)
  const checkCompletedLines = (row: number, col: number) => {
    const newGrid = [...calendarGrid];
    const selectedId = newGrid[row][col];
    
    // Mark the slot as selected
    if (selectedId > 0) {
      newGrid[row][col] = -selectedId; // Negative numbers represent selected slots
      setCalendarGrid(newGrid);
      setSelectedTimeSlot(Math.abs(selectedId));
      
      // Check for completed rows
      let completedLines = 0;
      for (let r = 0; r < newGrid.length; r++) {
        const isRowComplete = newGrid[r].every(cell => cell < 0);
        if (isRowComplete) {
          completedLines++;
          // Clear the row (reset to zeros)
          newGrid[r] = [0, 0, 0, 0, 0, 0, 0];
        }
      }
      
      // Check for completed columns
      for (let c = 0; c < newGrid[0].length; c++) {
        const isColComplete = newGrid.every(row => row[c] < 0);
        if (isColComplete) {
          completedLines++;
          // Clear the column
          for (let r = 0; r < newGrid.length; r++) {
            newGrid[r][c] = 0;
          }
        }
      }
      
      if (completedLines > 0) {
        setCompletedGridLines(prev => prev + completedLines);
        setBookingPoints(prev => prev + completedLines * 10);
        
        toast({
          title: `${completedLines} line${completedLines > 1 ? 's' : ''} completed!`,
          description: `You earned ${completedLines * 10} booking points.`,
        });
        
        setCalendarGrid(newGrid);
      }
    }
  };
  
  // Handle communication method selection
  const handleCommunicationMethodSelect = (method: string) => {
    setSelectedCommunicationMethod(method);
    
    toast({
      title: "Communication method selected",
      description: `You've chosen to communicate via ${method}.`,
    });
  };
  
  // Handle form submission
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false);

  const handleSubmit = () => {
    if (!contactName || !contactEmail) {
      toast({
        title: "Missing information",
        description: "Please provide your name and email address to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // If we have a selected time slot, open the Google Calendar booking component
    if (selectedTimeSlot) {
      setShowGoogleCalendar(true);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setPuzzleSolved(true);
      
      toast({
        title: "Automation initiated!",
        description: "Your request has been received. Our team will get back to you shortly.",
      });
      
      // Reset form
      setInteractionStep(1);
      setUserMessage('');
      setBusinessProblem('');
      setUrgencyLevel(1);
      setContactName('');
      setContactEmail('');
    }, 2000);
  };
  
  // Handle message sending in chat mode
  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    
    setAiResponse('');
    setIsAiResponding(true);
    
    if (interactionStep === 1) {
      setInteractionStep(2);
    }
  };
  
  // Start crisis mode
  const handleSOSMode = () => {
    setCrisisMode(true);
    setCrisisCountdown(5);
    
    toast({
      title: "SOS Mode Activated",
      description: "Our automated rescue team is being mobilized.",
    });
  };
  
  // Show referral options
  const handleShowReferral = () => {
    setShowReferralOptions(true);
    
    toast({
      title: "Referral Options",
      description: "Share your success with others and earn automation credits.",
    });
  };
  
  // Copy referral link
  const handleCopyReferral = () => {
    toast({
      title: "Referral Link Copied",
      description: "Share this link with your contacts to help them automate their business.",
    });
  };
  
  return (
    <div className="relative min-h-screen bg-neutral-900 text-neutral-100">
      {/* Google Calendar Booking Dialog */}
      {showGoogleCalendar && (
        <GoogleCalendarBooking 
          onClose={() => setShowGoogleCalendar(false)}
          serviceType="Business Process Consultation"
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
          
          {/* Animated network nodes */}
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
      
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            Your 300% ROI Journey<br />Starts With One Signal
          </h1>
          <p className="text-neutral-300 text-xl max-w-2xl mx-auto mb-12">
            No forms. No wait times. Just smart conversations.
          </p>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Orbital Animation */}
            <div className="relative h-64 mb-8 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center z-10"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1, 0.8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-4xl">👨‍💼</span>
                </motion.div>
                
                {/* Central orbit for AI agent */}
                <motion.div
                  className="absolute w-40 h-40 rounded-full border border-dashed border-primary-500/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-900/80 flex items-center justify-center"
                  >
                    <Zap className="h-5 w-5 text-primary-400" />
                  </motion.div>
                </motion.div>
                
                {/* Outer orbit for message passing */}
                <motion.div
                  className="absolute w-80 h-80 rounded-full border border-dashed border-secondary-500/30"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-secondary-900/80 flex items-center justify-center"
                  >
                    <MessageCircle className="h-5 w-5 text-secondary-400" />
                  </motion.div>
                  
                  <motion.div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-10 h-10 rounded-full bg-secondary-900/80 flex items-center justify-center"
                  >
                    <Settings className="h-5 w-5 text-secondary-400" />
                  </motion.div>
                  
                  <motion.div 
                    className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-secondary-900/80 flex items-center justify-center"
                  >
                    <Mail className="h-5 w-5 text-secondary-400" />
                  </motion.div>
                  
                  <motion.div 
                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-secondary-900/80 flex items-center justify-center"
                  >
                    <Code className="h-5 w-5 text-secondary-400" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Contact Gateway and Interaction Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-neutral-800/20 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden h-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">AI-Powered Contact Gateway</h2>
                  
                  <Tabs defaultValue="chat" className="w-[300px]" onValueChange={(value) => setContactMode(value as 'chat' | 'call' | 'sos')}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                      <TabsTrigger value="call">Schedule</TabsTrigger>
                      <TabsTrigger value="sos" className="bg-red-500/20 text-red-400">SOS</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="h-[400px] rounded-xl overflow-hidden">
                  {contactMode === 'chat' && (
                    <div className="bg-neutral-900/50 rounded-xl p-6 h-full flex flex-col">
                      <div className="flex-1 overflow-auto mb-4 space-y-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-primary-900/80 flex items-center justify-center mr-3 flex-shrink-0">
                            <Zap className="h-4 w-4 text-primary-400" />
                          </div>
                          <div className="bg-neutral-800/80 rounded-lg p-3 max-w-[80%]">
                            <p className="text-white">Should we solve your problem in 3 minutes or 3 sentences?</p>
                          </div>
                        </div>
                        
                        {userMessage && (
                          <div className="flex items-start justify-end">
                            <div className="bg-primary-900/50 rounded-lg p-3 max-w-[80%]">
                              <p className="text-white">{userMessage}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center ml-3 flex-shrink-0">
                              <span className="text-sm">You</span>
                            </div>
                          </div>
                        )}
                        
                        {aiResponse && (
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-primary-900/80 flex items-center justify-center mr-3 flex-shrink-0">
                              <Zap className="h-4 w-4 text-primary-400" />
                            </div>
                            <div className="bg-neutral-800/80 rounded-lg p-3 max-w-[80%]">
                              <p className="text-white">{aiResponse}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="relative">
                        <Input
                          placeholder="Describe your business challenge..."
                          value={userMessage}
                          onChange={(e) => setUserMessage(e.target.value)}
                          className="bg-neutral-800 border-neutral-700 pr-12"
                          disabled={isAiResponding}
                        />
                        <Button 
                          size="icon"
                          className="absolute right-1 top-1 bg-primary-700 hover:bg-primary-600 h-8 w-8"
                          onClick={handleSendMessage}
                          disabled={!userMessage.trim() || isAiResponding}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {interactionStep >= 2 && (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <Input 
                            placeholder="Your Name" 
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="bg-neutral-800 border-neutral-700"
                          />
                          <Input 
                            placeholder="Your Email" 
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="bg-neutral-800 border-neutral-700"
                          />
                          <div className="col-span-2">
                            <Button 
                              className="w-full bg-primary-600 hover:bg-primary-500 mt-2"
                              onClick={handleSubmit}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Sending...' : 'Start Automation Journey'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {contactMode === 'call' && (
                    <div className="bg-neutral-900/50 rounded-xl p-6 h-full flex flex-col">
                      <h3 className="text-xl font-bold text-white mb-4">Gamified Calendar Booking</h3>
                      <p className="text-neutral-300 mb-6">
                        Select time slots to clear lines Tetris-style. Complete 3 lines to unlock bonus consultation time!
                      </p>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-300">Booking Points: {bookingPoints}</span>
                        <span className="text-secondary-400 font-bold">Lines Completed: {completedGridLines}</span>
                      </div>
                      
                      <div className="relative flex-1 bg-neutral-800/50 rounded-lg overflow-hidden mb-4">
                        <div className="grid grid-cols-7 gap-1 p-2 h-full">
                          {calendarGrid.map((row, rowIndex) => (
                            row.map((cell, colIndex) => (
                              <motion.div
                                key={`${rowIndex}-${colIndex}`}
                                className={`rounded p-1 flex items-center justify-center cursor-pointer text-xs text-center transition-colors ${
                                  cell === 0 ? 'bg-neutral-800/20' : 
                                  cell < 0 ? 'bg-secondary-500/40 border border-secondary-400/20' : 
                                  'bg-primary-900/40 border border-primary-500/20 hover:bg-primary-800/40'
                                }`}
                                onClick={() => cell > 0 ? checkCompletedLines(rowIndex, colIndex) : null}
                                whileHover={cell > 0 ? { scale: 1.05 } : {}}
                              >
                                {cell !== 0 && (
                                  <div>
                                    {Math.abs(cell) && timeSlots.find(slot => slot.id === Math.abs(cell))?.time}
                                  </div>
                                )}
                              </motion.div>
                            ))
                          ))}
                        </div>
                        
                        {completedGridLines >= 3 && (
                          <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center">
                            <div className="text-center p-6">
                              <span className="block text-2xl font-bold text-secondary-400 mb-2">
                                Bonus Unlocked!
                              </span>
                              <p className="text-white mb-4">
                                You've earned a 15-minute bonus consultation.
                              </p>
                              <Button className="bg-secondary-600 hover:bg-secondary-500">
                                Claim Your Bonus
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {selectedTimeSlot && (
                        <div className="mb-4 p-3 bg-primary-900/20 rounded-lg border border-primary-500/20">
                          <p className="text-white">
                            You selected: {timeSlots.find(slot => slot.id === selectedTimeSlot)?.day},{' '}
                            {timeSlots.find(slot => slot.id === selectedTimeSlot)?.time}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          placeholder="Your Name" 
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="bg-neutral-800 border-neutral-700"
                        />
                        <Input 
                          placeholder="Your Email" 
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="bg-neutral-800 border-neutral-700"
                        />
                        <div className="col-span-2">
                          <Button 
                            className="w-full bg-primary-600 hover:bg-primary-500 mt-2"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedTimeSlot}
                          >
                            {isSubmitting ? 'Booking...' : 'Schedule Consultation'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {contactMode === 'sos' && (
                    <div className="bg-neutral-900/50 rounded-xl p-6 h-full flex flex-col">
                      <h3 className="text-xl font-bold text-white mb-4">SOS Automation - Crisis Mode</h3>
                      
                      {crisisMode ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="text-center">
                            <span className="text-4xl font-bold text-red-500 block mb-4">
                              {crisisCountdown}
                            </span>
                            <p className="text-white text-xl mb-6">
                              AI agents mobilizing...
                            </p>
                            <div className="w-64 h-6 bg-neutral-800 rounded-full overflow-hidden mx-auto">
                              <motion.div 
                                className="h-full bg-red-500"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(5-crisisCountdown)/5 * 100}%` }}
                              ></motion.div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 space-y-4 mb-6">
                            <p className="text-neutral-300">
                              For urgent business issues that require immediate attention. Our emergency team will respond within minutes.
                            </p>
                            
                            <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                              <h4 className="font-bold text-white mb-2">Rescue Team Specialists</h4>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                  <span className="text-neutral-300">Technical Emergency Response</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                                  <span className="text-neutral-300">Integration Crisis Support</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                                  <span className="text-neutral-300">Data Recovery Specialist</span>
                                </div>
                              </div>
                            </div>
                            
                            <Textarea 
                              placeholder="Describe the urgent business situation..."
                              value={businessProblem}
                              onChange={(e) => setBusinessProblem(e.target.value)}
                              className="bg-neutral-800 border-neutral-700 h-24"
                            />
                            
                            <div>
                              <label className="block text-neutral-300 text-sm mb-2">
                                Urgency Level: {urgencyLevel}/5
                              </label>
                              <Slider
                                value={[urgencyLevel]}
                                min={1}
                                max={5}
                                step={1}
                                onValueChange={(value) => setUrgencyLevel(value[0])}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <Input 
                              placeholder="Your Name" 
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              className="bg-neutral-800 border-neutral-700"
                            />
                            <Input 
                              placeholder="Your Email" 
                              onChange={(e) => setContactEmail(e.target.value)}
                              className="bg-neutral-800 border-neutral-700"
                            />
                          </div>
                          
                          <div className="mt-4">
                            <Button 
                              className="w-full bg-red-600 hover:bg-red-500"
                              onClick={handleSOSMode}
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Activate SOS Mode
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Social Proof Live Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-neutral-800/20 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden h-full"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Live Success Feed</h2>
              
              <div className="h-[400px] overflow-auto space-y-3 pr-2">
                <AnimatePresence initial={false}>
                  {liveFeedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-neutral-800/40 rounded-lg p-3 cursor-pointer hover:bg-neutral-700/30 transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{item.icon}</span>
                        <p className="text-neutral-300 text-sm">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Success Confirmation & Viral Referral */}
        {puzzleSolved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-neutral-900 via-primary-900/30 to-neutral-900 rounded-xl border border-primary-700/30 p-8 mb-16"
          >
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Automation Initiated</h2>
              
              <div className="mb-6">
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    className="h-full bg-primary-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                  ></motion.div>
                </div>
                <p className="text-neutral-400 text-sm">Booting neural networks...</p>
              </div>
              
              <p className="text-neutral-300 mb-8">
                Unlock secret resources by sharing your success journey with others
              </p>
              
              {showReferralOptions ? (
                <div className="bg-neutral-800/40 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Share With Your Network</h3>
                  
                  <div className="flex flex-wrap gap-3 justify-center mb-4">
                    <Button variant="outline" size="sm" className="bg-[#1877F2]/10 border-[#1877F2]/20 text-[#1877F2]">
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="bg-[#1DA1F2]/10 border-[#1DA1F2]/20 text-[#1DA1F2]">
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="bg-[#0A66C2]/10 border-[#0A66C2]/20 text-[#0A66C2]">
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm" className="bg-neutral-700/20 border-neutral-600">
                      Email
                    </Button>
                  </div>
                  
                  <div className="flex items-center">
                    <Input 
                      value="https://l-f-digital.com/ref?id=123456"
                      readOnly
                      className="bg-neutral-800 border-neutral-700 text-sm"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="ml-2"
                      onClick={handleCopyReferral}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center gap-4 mb-6">
                  <Button 
                    className="bg-primary-600 hover:bg-primary-500"
                    onClick={handleShowReferral}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Your Success
                  </Button>
                  
                  <Button variant="outline">
                    View Your Automation Plan
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Communication Protocol Footer */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-4">
              Choose Your Comms Protocol
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Select your preferred method of staying in touch
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-xl p-6 cursor-pointer transition-all ${
                selectedCommunicationMethod === 'chat' 
                  ? 'bg-primary-900/30 border border-primary-500/30' 
                  : 'bg-neutral-800/20 border border-neutral-700 hover:bg-neutral-800/40'
              }`}
              onClick={() => handleCommunicationMethodSelect('chat')}
            >
              <div className="h-16 flex items-center justify-center mb-4">
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary-900/60 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary-400" />
                  </div>
                </motion.div>
              </div>
              
              <h3 className="text-xl font-bold text-white text-center mb-2">
                🚀 Warp-speed Chat
              </h3>
              <p className="text-neutral-400 text-center text-sm">
                Get real-time responses via Slack or Telegram
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-xl p-6 cursor-pointer transition-all ${
                selectedCommunicationMethod === 'email' 
                  ? 'bg-secondary-900/30 border border-secondary-500/30' 
                  : 'bg-neutral-800/20 border border-neutral-700 hover:bg-neutral-800/40'
              }`}
              onClick={() => handleCommunicationMethodSelect('email')}
            >
              <div className="h-16 flex items-center justify-center mb-4">
                <motion.div
                  initial={{ rotateZ: 0, x: 0, y: 0 }}
                  animate={{ 
                    rotateZ: [-10, 15, -10],
                    x: [-5, 5, -5],
                    y: [0, -10, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <div className="w-12 h-12 rounded-full bg-secondary-900/60 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-secondary-400" />
                  </div>
                </motion.div>
              </div>
              
              <h3 className="text-xl font-bold text-white text-center mb-2">
                📡 Deep-space Transmission
              </h3>
              <p className="text-neutral-400 text-center text-sm">
                Receive detailed updates via email
              </p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-xl p-6 cursor-pointer transition-all ${
                selectedCommunicationMethod === 'api' 
                  ? 'bg-emerald-900/30 border border-emerald-500/30' 
                  : 'bg-neutral-800/20 border border-neutral-700 hover:bg-neutral-800/40'
              }`}
              onClick={() => handleCommunicationMethodSelect('api')}
            >
              <div className="h-16 flex items-center justify-center mb-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-900/60 flex items-center justify-center">
                    <Code className="h-6 w-6 text-emerald-400" />
                  </div>
                </motion.div>
              </div>
              
              <h3 className="text-xl font-bold text-white text-center mb-2">
                🤖 AI-to-AI Handshake
              </h3>
              <p className="text-neutral-400 text-center text-sm">
                Connect via API or webhook integration
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-200">
            Start Your Automation Journey Now
          </Button>
        </motion.div>
      </main>
    </div>
  );
}