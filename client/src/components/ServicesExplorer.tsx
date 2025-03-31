import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronRight, Zap, PieChart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { type Service } from '@shared/schema';

interface ServicesExplorerProps {
  fullView?: boolean;
}

export default function ServicesExplorer({ fullView = true }: ServicesExplorerProps) {
  const { toast } = useToast();
  const [businessChallenge, setBusinessChallenge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch all services
  const { data: allServices = [], isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });
  
  // State for AI-recommended services
  const [recommendedServices, setRecommendedServices] = useState<(Service & { explanation?: string })[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const handleFindSolutions = async () => {
    if (!businessChallenge.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your business challenge to find AI-powered solutions.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai/service-recommendation', {
        businessChallenge,
      });
      
      // Check if the status is 500 or another error code
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error occurred");
      }
      
      const data = await response.json();
      
      if (data.serviceSuggestions && data.serviceSuggestions.length > 0) {
        setRecommendedServices(data.serviceSuggestions);
        setShowRecommendations(true);
      } else {
        // If AI failed, show error and don't show hardcoded recommendations
        throw new Error("AI service didn't return any recommendations");
      }
    } catch (error) {
      toast({
        title: "AI Service Failed",
        description: error instanceof Error ? error.message : "We couldn't generate service recommendations using AI. Please try again later or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to get the right icon for a service
  const getServiceIcon = (iconKey: string | undefined | null) => {
    switch(iconKey) {
      case 'lightning-bolt':
        return <Zap className="h-20 w-20 text-white/20" />;
      case 'chart-pie':
        return <PieChart className="h-20 w-20 text-white/20" />;
      case 'users':
        return <Users className="h-20 w-20 text-white/20" />;
      default:
        return <Zap className="h-20 w-20 text-white/20" />;
    }
  };
  
  return (
    <section id="services" className="py-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary-900/50 text-primary-400 text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            AI-Driven Solutions for Your Business
          </h2>
          <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
            Describe your business challenge, and our AI will recommend the perfect solution tailored to your needs.
          </p>
        </motion.div>
        
        {/* AI Input Area */}
        <motion.div 
          className="max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700 flex items-center">
            <div className="flex-1">
              <Input 
                type="text"
                value={businessChallenge}
                onChange={(e) => setBusinessChallenge(e.target.value)}
                placeholder="Describe your business challenge (e.g., 'My team wastes time on manual reporting')"
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-neutral-400"
              />
            </div>
            <Button
              className="ml-2 bg-primary-600 hover:bg-primary-500"
              onClick={handleFindSolutions}
              disabled={isSubmitting}
            >
              <ChevronRight className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Finding...' : 'Find Solutions'}
            </Button>
          </div>
        </motion.div>
        
        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {isLoadingServices ? (
              // Loading placeholders
              Array(3).fill(0).map((_, i) => (
                <motion.div
                  key={`loading-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-neutral-800/20 border border-neutral-700 h-96 animate-pulse"
                />
              ))
            ) : showRecommendations ? (
              // Show AI recommendations
              recommendedServices.map((service, index) => (
                <ServiceCard 
                  key={`recommendation-${service.id}-${index}`}
                  service={service}
                  index={index}
                  isRecommendation={true}
                />
              ))
            ) : (
              // Show regular services - show all if fullView is true, otherwise just 3
              (fullView ? allServices : allServices.slice(0, 3)).map((service: Service, index: number) => (
                <ServiceCard 
                  key={`service-${service.id}`}
                  service={service}
                  index={index}
                  isRecommendation={false}
                />
              ))
            )}
          </AnimatePresence>
        </div>
        
        {/* View All Button */}
        <motion.div 
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            variant="outline" 
            className="px-6 py-3 h-auto border-neutral-700 hover:border-neutral-600"
          >
            Explore All Solutions
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// Service Card Component
function ServiceCard({ 
  service, 
  index, 
  isRecommendation 
}: { 
  service: Service & { explanation?: string }, 
  index: number,
  isRecommendation: boolean 
}) {
  // Get category color class
  const getCategoryColorClass = (category: string) => {
    switch(category.toLowerCase()) {
      case 'automation':
        return 'from-primary-900 to-primary-700';
      case 'analytics':
        return 'from-secondary-900 to-secondary-700';
      case 'customer experience':
        return 'from-purple-900 to-purple-700';
      default:
        return 'from-primary-900 to-primary-700';
    }
  };
  
  // Get icon for category indicator
  const getCategoryIndicatorColor = (category: string) => {
    switch(category.toLowerCase()) {
      case 'automation':
        return 'bg-secondary-400';
      case 'analytics':
        return 'bg-primary-400';
      case 'customer experience':
        return 'bg-purple-400';
      default:
        return 'bg-secondary-400';
    }
  };
  
  // Get service icon
  const getServiceIcon = (iconKey: string | undefined | null) => {
    switch(iconKey) {
      case 'lightning-bolt':
        return <Zap className="h-20 w-20 text-white/20" />;
      case 'chart-pie':
        return <PieChart className="h-20 w-20 text-white/20" />;
      case 'users':
        return <Users className="h-20 w-20 text-white/20" />;
      default:
        return <Zap className="h-20 w-20 text-white/20" />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-xl bg-neutral-800/40 border border-neutral-700 overflow-hidden group hover:border-primary-500 transition-all duration-300 shadow-lg shadow-neutral-900/30"
    >
      <div className={`h-40 bg-gradient-to-br ${getCategoryColorClass(service.category)} relative overflow-hidden`}>
        {/* Service illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          {getServiceIcon(service.iconKey)}
        </div>
        {/* Category indicator */}
        <div className="absolute top-4 left-4 p-2 bg-black/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getCategoryIndicatorColor(service.category)}`}></div>
            <span className="text-xs font-medium text-white">{service.category}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-display font-bold text-xl text-white mb-2">{service.name}</h3>
        <p className="text-neutral-400 mb-4">{service.description}</p>
        
        {/* Show explanation if it's an AI recommendation */}
        {isRecommendation && service.explanation && (
          <div className="mb-4 p-3 bg-primary-900/20 border border-primary-800/30 rounded-lg">
            <p className="text-sm text-primary-300">{service.explanation}</p>
          </div>
        )}
        
        <ul className="space-y-2 mb-6">
          {service.features?.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-secondary-500 flex-shrink-0" />
              <span className="text-sm text-neutral-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="flex items-center justify-between">
          {service.averageROI && (
            <span className="text-sm text-neutral-500">
              Avg. ROI: <span className="text-secondary-400 font-medium">{service.averageROI}</span>
            </span>
          )}
          <Button 
            variant="link" 
            className="text-primary-400 hover:text-primary-300 p-0 h-auto"
          >
            Learn more
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </motion.div>
  );
}
