import { useState, useEffect, useContext } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { AIContext } from '@/context/AIContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const aiContext = useContext(AIContext);
  const toggleChat = aiContext?.toggleChat || (() => console.log('AI chat not available'));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-neutral-900/90 backdrop-blur-lg border-b border-neutral-800' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center">
                <span className="font-display font-bold text-white">L&F</span>
              </div>
              <span className="font-display font-bold text-white">L&F Digital</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-neutral-300 hover:text-white transition-colors duration-200">
              Services
            </a>
            <a href="#ai-tools" className="text-neutral-300 hover:text-white transition-colors duration-200">
              AI Tools
            </a>
            <a href="#case-studies" className="text-neutral-300 hover:text-white transition-colors duration-200">
              Case Studies
            </a>
            <a href="#contact" className="text-neutral-300 hover:text-white transition-colors duration-200">
              Contact
            </a>
          </div>
          
          {/* AI Chat Button */}
          <div>
            <Button 
              onClick={toggleChat}
              className="rounded-full bg-primary-700 hover:bg-primary-600 shadow-lg shadow-primary-900/30"
            >
              Talk to AI
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              className="text-neutral-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-800 border-b border-neutral-700">
          <div className="px-4 py-3 space-y-1">
            <a href="#services" className="block py-2 text-neutral-300 hover:text-white transition-colors duration-200">
              Services
            </a>
            <a href="#ai-tools" className="block py-2 text-neutral-300 hover:text-white transition-colors duration-200">
              AI Tools
            </a>
            <a href="#case-studies" className="block py-2 text-neutral-300 hover:text-white transition-colors duration-200">
              Case Studies
            </a>
            <a href="#contact" className="block py-2 text-neutral-300 hover:text-white transition-colors duration-200">
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
