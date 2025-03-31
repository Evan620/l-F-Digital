import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Zap, PieChart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { type Service } from '@shared/schema';

export default function ServicePreviewGrid() {
  // Fetch featured services
  const { data: allServices = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });
  
  // Only show the first 3 services on the home page
  const featuredServices = allServices.slice(0, 3);
  
  return (
    <section className="py-10 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary-900/50 text-primary-400 text-sm font-medium mb-4">
            Featured Solutions
          </span>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-4">
            Transform Your Business with AI
          </h2>
          <p className="text-neutral-300">
            Our most popular services that deliver immediate impact and measurable ROI.
          </p>
        </motion.div>
        
        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading placeholders
            Array(3).fill(0).map((_, i) => (
              <motion.div
                key={`loading-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl bg-neutral-800/20 border border-neutral-700 h-64 animate-pulse"
              />
            ))
          ) : (
            // Show featured services
            featuredServices.map((service: Service, index: number) => (
              <FeaturedServiceCard 
                key={`service-${service.id}`}
                service={service}
                index={index}
              />
            ))
          )}
        </div>
        
        {/* View All Button */}
        <motion.div 
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/services">
            <Button 
              variant="outline" 
              className="px-6 py-3 h-auto border-neutral-700 hover:border-neutral-600"
            >
              Explore All Solutions
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Featured Service Card Component - Simplified for Home page
function FeaturedServiceCard({ service, index }: { service: Service, index: number }) {
  // Get service icon
  const getServiceIcon = (iconKey: string | null | undefined) => {
    switch(iconKey) {
      case 'lightning-bolt':
        return <Zap className="h-12 w-12 text-white/20" />;
      case 'chart-pie':
        return <PieChart className="h-12 w-12 text-white/20" />;
      case 'users':
        return <Users className="h-12 w-12 text-white/20" />;
      default:
        return <Zap className="h-12 w-12 text-white/20" />;
    }
  };
  
  // Get category color class
  const getCategoryColorClass = (category: string) => {
    switch(category.toLowerCase()) {
      case 'automation':
        return 'bg-gradient-to-br from-primary-900 to-primary-700';
      case 'analytics':
        return 'bg-gradient-to-br from-secondary-900 to-secondary-700';
      case 'customer experience':
        return 'bg-gradient-to-br from-purple-900 to-purple-700';
      default:
        return 'bg-gradient-to-br from-primary-900 to-primary-700';
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
      <div className={`p-4 ${getCategoryColorClass(service.category)} flex items-center justify-between`}>
        <span className="text-xs font-medium text-white/80">{service.category}</span>
        {getServiceIcon(service.iconKey)}
      </div>
      
      <CardContent className="p-5">
        <h3 className="font-display font-bold text-lg text-white mb-2">{service.name}</h3>
        <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{service.description}</p>
        
        {service.averageROI && (
          <div className="text-sm text-secondary-400 font-medium mb-3">
            Avg. ROI: {service.averageROI}
          </div>
        )}
        
        <Link href="/services">
          <Button 
            variant="ghost" 
            className="text-primary-400 hover:text-primary-300 p-0 h-auto"
          >
            Learn more
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </motion.div>
  );
}