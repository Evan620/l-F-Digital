import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ServicesExplorer from '@/components/ServicesExplorer';
import AIChatInterface from '@/components/AIChatInterface';

export default function Services() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
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
      
      <main className="relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-900/50 text-primary-400 text-sm font-medium mb-4">
              Our Services
            </span>
            <h1 className="font-display font-bold text-5xl lg:text-6xl text-white mb-6">
              AI-Powered Solutions for Business Growth
            </h1>
            <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
              Explore our full range of services or describe your business challenge to get personalized recommendations.
            </p>
          </div>
        </motion.div>
        
        {/* Full Services Explorer */}
        <ServicesExplorer fullView={true} />
      </main>
      
      {/* Chat interface */}
      <AIChatInterface isOpen={isChatOpen} onToggle={toggleChat} />
    </div>
  );
}