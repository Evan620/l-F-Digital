import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAI } from '@/context/AIContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleChat } = useAI();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
        isScrolled ? 'bg-neutral-900/90 backdrop-blur-lg border-b border-neutral-800' : 'bg-neutral-900/70 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center">
                <span className="font-display font-bold text-white">LÆF</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-white">LÆF Digital</span>
                <span className="text-[10px] font-light italic text-neutral-300 -mt-1">Locus of Algorithmic</span>
              </div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/services" className="text-neutral-300 hover:text-white transition-colors duration-200">
              Services
            </Link>
            <Link href="/case-studies" className="text-neutral-300 hover:text-white transition-colors duration-200">
              Case Studies
            </Link>
            <Link href="/ai-tools" className="text-neutral-300 hover:text-white transition-colors duration-200">
              AI Tools
            </Link>
            <Link href="/contact" className="text-neutral-300 hover:text-white transition-colors duration-200">
              Contact
            </Link>
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
            <Link href="/services" className="block py-2 text-neutral-300 hover:text-white transition-colors duration-200">
              Services
            </Link>
            <Link href="/case-studies" className="block py-2 text-neutral-300 hover:text-white transition-colors duration-200">
              Case Studies
            </Link>
            <Link href="/ai-tools" className="block py-2 text-neutral-300 hover:text-white transition-colors duration-200">
              AI Tools
            </Link>
            <Link href="/contact" className="block py-2 text-neutral-300 hover:text-white transition-colors duration-200">
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
