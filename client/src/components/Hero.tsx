import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import GoogleCalendarBooking from '@/components/GoogleCalendarBooking';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative pt-20 lg:pt-24 overflow-hidden">
      {showGoogleCalendar && (
        <GoogleCalendarBooking 
          onClose={() => setShowGoogleCalendar(false)}
          serviceType="Business Consultation"
        />
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 py-12 lg:py-24">
          {/* Hero Text */}
          <motion.div 
            className="w-full lg:w-1/2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-sm font-medium text-primary-300 mb-4">
              AI-Powered Digital Transformation
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl">
              <div className="flex items-center">
                <span className="relative bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent tracking-wide text-white">AI-powered business solutions</span>
              </div>
            </h1>
            <p className="text-lg text-neutral-300 max-w-xl">
              Driving efficiency and innovation through intelligent automation. We turn complex business challenges into streamlined digital success stories.
            </p>

            {/* CTA Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => window.location.href = '/services'}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 shadow-lg hover:shadow-xl hover:shadow-primary-900/20 flex items-center justify-center gap-2 h-auto"
                size="lg"
              >
                Explore Solutions
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                onClick={() => setShowGoogleCalendar(true)}
                variant="outline" 
                className="px-6 py-3 border-neutral-700 hover:border-neutral-600 flex items-center justify-center gap-2 h-auto"
                size="lg"
              >
                Send a Quote
              </Button>
            </div>

            {/* Industry Recognition */}
            <div className="pt-8">
              <p className="text-sm text-neutral-400 mb-3">Trusted by industry leaders</p>
              <div className="flex flex-wrap gap-8 items-center justify-center">
                {/* Safaricom Logo */}
                <div className="h-8 text-neutral-400 hover:text-neutral-200 transition-colors">
                  <svg viewBox="0 0 200 40" className="h-full w-auto">
                    <path d="M40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0C31.0457 0 40 8.9543 40 20Z" fill="currentColor"/>
                    <text x="50" y="25" className="text-xl font-bold" fill="currentColor">Safaricom</text>
                  </svg>
                </div>

                {/* KCB Tech Logo */}
                <div className="h-8 text-neutral-400 hover:text-neutral-200 transition-colors">
                  <svg viewBox="0 0 120 40" className="h-full w-auto">
                    <rect x="0" y="10" width="30" height="20" rx="2" fill="currentColor"/>
                    <text x="35" y="25" className="text-xl font-bold" fill="currentColor">KCB Tech</text>
                  </svg>
                </div>

                {/* Twiga Foods Logo */}
                <div className="h-8 text-neutral-400 hover:text-neutral-200 transition-colors">
                  <svg viewBox="0 0 150 40" className="h-full w-auto">
                    <path d="M20 5L35 35L5 35L20 5Z" fill="currentColor"/>
                    <text x="40" y="25" className="text-xl font-bold" fill="currentColor">Twiga Foods</text>
                  </svg>
                </div>

                {/* Sendy Logo */}
                <div className="h-8 text-neutral-400 hover:text-neutral-200 transition-colors">
                  <svg viewBox="0 0 100 40" className="h-full w-auto">
                    <circle cx="20" cy="20" r="15" fill="currentColor"/>
                    <text x="40" y="25" className="text-xl font-bold" fill="currentColor">Sendy</text>
                  </svg>
                </div>

                {/* Jumia Kenya Logo */}
                <div className="h-8 text-neutral-400 hover:text-neutral-200 transition-colors">
                  <svg viewBox="0 0 150 40" className="h-full w-auto">
                    <path d="M10 30L25 10L40 30H10Z" fill="currentColor"/>
                    <text x="45" y="25" className="text-xl font-bold" fill="currentColor">Jumia</text>
                  </svg>
                </div>

                {/* MPESA Logo */}
                <div className="h-8 text-neutral-400 hover:text-neutral-200 transition-colors">
                  <svg viewBox="0 0 120 40" className="h-full w-auto">
                    <rect x="5" y="10" width="30" height="20" rx="10" fill="currentColor"/>
                    <text x="40" y="25" className="text-xl font-bold" fill="currentColor">MPESA</text>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hero Animation/Visual */}
          <motion.div 
            className="w-full lg:w-1/2 h-full flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <div className="relative w-full max-w-lg aspect-square">
              {/* Main circular visual */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-900/40 to-secondary-900/40 overflow-hidden flex items-center justify-center border border-neutral-800 shadow-lg shadow-inner shadow-neutral-950 animate-pulse-slow">
                <div className="relative w-4/5 h-4/5 rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden border border-neutral-800">
                  <div className="absolute inset-0 opacity-30">
                    {/* Animated elements */}
                    <motion.div 
                      className="absolute top-1/4 left-1/4 w-20 h-20 bg-primary-500/20 rounded-full"
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                      className="absolute top-1/2 right-1/4 w-16 h-16 bg-secondary-500/20 rounded-full"
                      animate={{ y: [0, -15, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    />
                    <motion.div 
                      className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-primary-600/20 rounded-full"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                  </div>
                  <div className="z-10 p-6 text-center">
                    <span className="font-display font-bold text-xl bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                      AI-DRIVEN
                    </span>
                    <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                    <p className="mt-2 text-neutral-400 text-sm">Interactive Solutions</p>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <motion.div 
                  className="absolute top-10 right-10 p-3 bg-neutral-800/80 backdrop-blur-md rounded-xl border border-neutral-700 shadow-lg"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary-500"></div>
                    <span className="text-xs font-medium">Automation</span>
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute bottom-16 left-0 p-3 bg-neutral-800/80 backdrop-blur-md rounded-xl border border-neutral-700 shadow-lg"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="text-xs font-medium">Machine Learning</span>
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute top-1/2 left-0 p-3 bg-neutral-800/80 backdrop-blur-md rounded-xl border border-neutral-700 shadow-lg"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-400"></div>
                    <span className="text-xs font-medium">LLM Integration</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}