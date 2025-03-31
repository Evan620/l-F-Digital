import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ValueCalculator from '@/components/ValueCalculator';
import ServicesExplorer from '@/components/ServicesExplorer';
import CaseStudyGenerator from '@/components/CaseStudyGenerator';
import AIChatInterface from '@/components/AIChatInterface';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

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
        <Hero />
        <ValueCalculator />
        <ServicesExplorer />
        <CaseStudyGenerator />
      </main>
      
      {/* Chat interface */}
      <AIChatInterface isOpen={isChatOpen} onToggle={toggleChat} />
    </div>
  );
}
