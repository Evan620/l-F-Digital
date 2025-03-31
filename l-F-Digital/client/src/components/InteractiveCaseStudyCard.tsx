import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, ChevronRight, CheckCircle2, 
  Building2, Users, DollarSign, Clock, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type CaseStudy } from '@shared/schema';

interface InteractiveCaseStudyCardProps {
  caseStudy: CaseStudy;
  onSelect: (caseStudy: CaseStudy) => void;
  index: number;
}

export default function InteractiveCaseStudyCard({ 
  caseStudy, 
  onSelect, 
  index 
}: InteractiveCaseStudyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Extract metrics for display
  const beforeMetric = caseStudy.metrics?.before || '0%';
  const afterMetric = caseStudy.metrics?.after || '100%';
  const timeframe = caseStudy.metrics?.timeframe || '3 months';
  const roi = caseStudy.metrics?.roi || '150%';
  // Handle company size if it doesn't exist in the CaseStudy type
  const companyType = (caseStudy as any).companySize || 'Mid-size';
  
  // Handle numeric metrics for progress visualization
  const getNumericValue = (metric: string) => {
    const match = metric.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };
  
  const beforeValue = getNumericValue(beforeMetric);
  const afterValue = getNumericValue(afterMetric);
  const progressValue = (afterValue / (beforeValue + afterValue)) * 100;
  
  // Get industry-specific colors
  const getIndustryColors = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'e-commerce':
      case 'retail':
        return { bg: 'from-rose-500/20 to-orange-500/20', accent: 'bg-rose-500' };
      case 'finance':
        return { bg: 'from-emerald-500/20 to-teal-500/20', accent: 'bg-emerald-500' };
      case 'healthcare':
        return { bg: 'from-blue-500/20 to-indigo-500/20', accent: 'bg-blue-500' };
      case 'technology':
        return { bg: 'from-primary-500/20 to-secondary-500/20', accent: 'bg-primary-500' };
      default:
        return { bg: 'from-secondary-500/20 to-primary-500/20', accent: 'bg-secondary-500' };
    }
  };
  
  const colors = getIndustryColors(caseStudy.industry);
  
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-br ${colors.bg} backdrop-blur-sm shadow-xl`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect(caseStudy)}
    >
      {/* Top decoration line */}
      <div className={`h-1 w-full ${colors.accent}`}></div>
      
      <div className="p-6">
        {/* Header with industry and icon */}
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-${colors.accent.split('-')[1]}-500/10`}>
            <Building2 className={`h-5 w-5 text-${colors.accent.split('-')[1]}-400`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-400">{caseStudy.industry}</h3>
            <h4 className="text-lg font-bold text-white">{companyType} Company</h4>
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-bold mb-4 text-white leading-tight">
          {caseStudy.title}
        </h2>
        
        {/* Challenge summary */}
        <p className="text-neutral-300 mb-6 text-sm">
          {caseStudy.challenge?.substring(0, 120)}...
        </p>
        
        {/* Metrics section */}
        <div className="space-y-4 mb-6">
          {/* Progress visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Before: {beforeMetric}</span>
              <span className="text-white font-semibold">After: {afterMetric}</span>
            </div>
            <div className="relative pt-1">
              <Progress value={progressValue} className="h-2" />
              
              {/* Animated progress indicator */}
              <motion.div 
                className="absolute top-0 h-3 w-3 rounded-full bg-white shadow-glow"
                initial={{ left: '0%' }}
                animate={{ left: `${progressValue}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
          </div>
          
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-secondary-400" />
              <span className="text-white font-semibold">{roi} ROI</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-secondary-400" />
              <span className="text-white">{timeframe}</span>
            </div>
          </div>
        </div>
        
        {/* Footer with CTA */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:text-secondary-400 hover:bg-white/5 group"
          >
            Experience This Case
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={`rounded-full ${colors.accent.replace('bg', 'bg-opacity-10 text')}`}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Play case study simulation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Interactive hover effects */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 w-full">
            <Button 
              variant="secondary" 
              className="w-full font-medium"
            >
              Live Simulation
              <Play className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}