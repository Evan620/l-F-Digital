import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesExplorer from '@/components/ServicesExplorer';
import AIChatInterface from '@/components/AIChatInterface';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileText, Calculator, Bot, X } from 'lucide-react';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [_, setLocation] = useLocation();

  // Handle scroll events for animations
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  const navigateToCaseStudies = () => {
    setLocation('/case-studies');
  };
  
  const navigateToAITools = () => {
    setLocation('/ai-tools');
  };
  
  return (
    <div className="relative min-h-screen bg-neutral-900 text-neutral-100">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary-600/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-600/10 rounded-full filter blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,rgba(31,41,55,0)_70%)]"></div>
      </div>
      
      {/* Main content */}
      <Navbar />
      
      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcomePopup && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 max-w-sm bg-neutral-800/95 backdrop-blur-sm p-4 rounded-lg border border-primary-500/20 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-900/50 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Meet OrionAI</h3>
                  <p className="text-sm text-neutral-300">Your intelligent assistant for exploring our services and getting instant help.</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-400 hover:text-white -mr-2 -mt-2"
                onClick={() => setShowWelcomePopup(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        <Hero />
        <ServicesExplorer fullView={false} />
        
        {/* Interactive Tools Section (replacing individual tool components) */}
        <section className="py-20 bg-neutral-950 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="max-w-3xl mx-auto text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-secondary-900/50 text-secondary-400 text-sm font-medium mb-4">
                AI-Powered Tools
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                Interactive Business Solutions
              </h2>
              <p className="text-neutral-300 text-lg">
                Experience our AI tools designed to help you visualize how our solutions can transform your business.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Case Study Generator Card */}
              <motion.div
                className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary-900/50 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">Case Study Generator</h3>
                  <p className="text-neutral-300 mb-6">
                    Generate custom case studies based on your industry and challenges to see how our solutions have delivered results.
                  </p>
                  <Button 
                    onClick={navigateToCaseStudies}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white"
                  >
                    Generate Case Study <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
              
              {/* ROI Calculator Card */}
              <motion.div
                className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-secondary-900/50 flex items-center justify-center mb-4">
                    <Calculator className="h-6 w-6 text-secondary-400" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">ROI Calculator</h3>
                  <p className="text-neutral-300 mb-6">
                    Estimate your potential return on investment with our solutions based on your business parameters.
                  </p>
                  <Button 
                    onClick={navigateToAITools}
                    className="w-full bg-secondary-600 hover:bg-secondary-500 text-white"
                  >
                    Calculate Your ROI <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Chat interface */}
      <AIChatInterface isOpen={isChatOpen} onToggle={toggleChat} />
    </div>
  );
}
