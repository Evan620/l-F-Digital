import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ZoomIn, ZoomOut, X, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { type CaseStudy } from '@shared/schema';

interface SocialProofGalaxyProps {
  caseStudies: CaseStudy[];
}

interface StarPoint {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  industry: string;
  caseStudy: CaseStudy;
  selected: boolean;
}

export default function SocialProofGalaxy({ caseStudies }: SocialProofGalaxyProps) {
  const [stars, setStars] = useState<StarPoint[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [comparingCaseStudies, setComparingCaseStudies] = useState<CaseStudy[]>([]);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const galaxyRef = useRef<HTMLDivElement>(null);
  
  // Generate the star map from case studies
  useEffect(() => {
    if (caseStudies.length === 0) return;
    
    const newStars: StarPoint[] = caseStudies.map((study, index) => {
      // Create industry-based clusters
      const industryOffset = getIndustryOffset(study.industry);
      
      // Calculate position with some randomness but clustered by industry
      const x = 40 + industryOffset.x + (Math.random() * 15 - 7.5);
      const y = 40 + industryOffset.y + (Math.random() * 15 - 7.5);
      
      // Size based on company size or importance
      const size = getStarSize(study);
      
      // Color based on industry
      const color = getIndustryColor(study.industry);
      
      return {
        id: index,
        x: x,
        y: y,
        size: size,
        color: color,
        industry: study.industry,
        caseStudy: study,
        selected: false
      };
    });
    
    setStars(newStars);
  }, [caseStudies]);
  
  // Handle star selection
  const handleStarClick = (starId: number) => {
    // Find the clicked star
    const star = stars.find(s => s.id === starId);
    if (!star) return;
    
    // If already 5 stars are selected and this one isn't selected, show a message
    if (selectedStars.length >= 5 && !selectedStars.includes(starId)) {
      // For now, just replace the oldest selection
      const newSelected = [...selectedStars.slice(1), starId];
      setSelectedStars(newSelected);
      
      // Update stars selected state
      setStars(stars.map(s => ({
        ...s,
        selected: newSelected.includes(s.id)
      })));
      
      // Check for easter egg (5 stars pattern)
      if (newSelected.length === 5) {
        checkForEasterEgg(newSelected);
      }
      
      return;
    }
    
    // Toggle selection
    let newSelected: number[];
    if (selectedStars.includes(starId)) {
      newSelected = selectedStars.filter(id => id !== starId);
    } else {
      newSelected = [...selectedStars, starId];
      
      // If exactly one star selected, show its details
      if (newSelected.length === 1) {
        setSelectedCaseStudy(star.caseStudy);
        setShowDialog(true);
      }
      
      // If multiple stars, prepare for comparison
      if (newSelected.length > 1) {
        const selectedStudies = stars
          .filter(s => newSelected.includes(s.id))
          .map(s => s.caseStudy);
        setComparingCaseStudies(selectedStudies);
      } else {
        setComparingCaseStudies([]);
      }
      
      // Check for easter egg (5 stars pattern)
      if (newSelected.length === 5) {
        checkForEasterEgg(newSelected);
      }
    }
    
    setSelectedStars(newSelected);
    
    // Update stars selected state
    setStars(stars.map(s => ({
      ...s,
      selected: newSelected.includes(s.id)
    })));
  };
  
  // Check if the 5 selected stars form a special pattern for the easter egg
  const checkForEasterEgg = (selectedIds: number[]) => {
    // This is a simplified check - in a real app, you'd check for specific patterns
    // For this demo, we'll just trigger the easter egg if any 5 stars are selected
    if (selectedIds.length === 5) {
      setShowEasterEgg(true);
    }
  };
  
  // Get position offset based on industry for clustering
  const getIndustryOffset = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'e-commerce':
      case 'retail':
        return { x: 10, y: 10 };
      case 'finance':
        return { x: 30, y: 20 };
      case 'healthcare':
        return { x: 20, y: 40 };
      case 'technology':
        return { x: 40, y: 30 };
      default:
        return { x: 25, y: 25 };
    }
  };
  
  // Determine star size based on case study properties
  const getStarSize = (caseStudy: CaseStudy) => {
    // Base size
    let size = 2;
    
    // Increase size based on ROI if available
    if (caseStudy.metrics?.roi) {
      const roiValue = parseInt(caseStudy.metrics.roi.replace('%', ''));
      size += (roiValue / 100);
    }
    
    // Cap size
    return Math.min(size, 5);
  };
  
  // Get color based on industry
  const getIndustryColor = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'e-commerce':
      case 'retail':
        return 'rgb(244, 63, 94)'; // rose-500
      case 'finance':
        return 'rgb(16, 185, 129)'; // emerald-500
      case 'healthcare':
        return 'rgb(59, 130, 246)'; // blue-500
      case 'technology':
        return 'rgb(168, 85, 247)'; // purple-500
      default:
        return 'rgb(249, 115, 22)'; // orange-500
    }
  };
  
  // Handle zoom in/out
  const zoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.2, 2));
  };
  
  const zoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.2, 0.5));
  };
  
  // Clear all selections
  const clearSelections = () => {
    setSelectedStars([]);
    setStars(stars.map(s => ({ ...s, selected: false })));
    setComparingCaseStudies([]);
    setShowEasterEgg(false);
  };
  
  return (
    <div className="relative w-full bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden" 
      style={{ height: '500px' }}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button variant="outline" size="icon" className="rounded-full bg-neutral-800/70 backdrop-blur-sm" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full bg-neutral-800/70 backdrop-blur-sm" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        {selectedStars.length > 0 && (
          <Button variant="outline" size="icon" className="rounded-full bg-neutral-800/70 backdrop-blur-sm" onClick={clearSelections}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Industry legend */}
      <div className="absolute top-4 left-4 z-20 p-3 rounded-lg bg-neutral-800/70 backdrop-blur-sm">
        <h4 className="text-xs font-medium text-neutral-300 mb-2">Industry Clusters</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[rgb(244,63,94)] mr-2"></div>
            <span className="text-xs text-neutral-300">Retail / E-commerce</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[rgb(16,185,129)] mr-2"></div>
            <span className="text-xs text-neutral-300">Finance</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[rgb(59,130,246)] mr-2"></div>
            <span className="text-xs text-neutral-300">Healthcare</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[rgb(168,85,247)] mr-2"></div>
            <span className="text-xs text-neutral-300">Technology</span>
          </div>
        </div>
      </div>
      
      {/* Selection info */}
      {selectedStars.length > 0 && (
        <div className="absolute bottom-4 left-4 z-20 p-3 rounded-lg bg-neutral-800/70 backdrop-blur-sm max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-neutral-300">Selected Case Studies</h4>
            <span className="text-xs font-bold text-secondary-400">{selectedStars.length}/5</span>
          </div>
          {selectedStars.length >= 2 && (
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-full mt-2 text-xs"
              onClick={() => setShowDialog(true)}
            >
              Compare Selected
              <Users className="ml-2 h-3 w-3" />
            </Button>
          )}
          {selectedStars.length === 5 && (
            <div className="mt-2 text-center">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-secondary-300"
              >
                Connect all 5 stars to reveal a secret!
              </motion.div>
            </div>
          )}
        </div>
      )}
      
      {/* The star galaxy */}
      <div 
        ref={galaxyRef}
        className="absolute inset-0 bg-neutral-950 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at center, #0f172a, #020617)'
        }}
      >
        {/* Background grid */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(100, 116, 139, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.05) 1px, transparent 1px)',
            backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center'
          }}
        ></div>
        
        {/* Star connections */}
        {selectedStars.length >= 2 && (
          <svg 
            className="absolute inset-0 z-10 pointer-events-none"
            width="100%" 
            height="100%"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
          >
            <g>
              {selectedStars.map((starId, idx) => {
                if (idx === selectedStars.length - 1) return null;
                
                const currentStar = stars.find(s => s.id === starId);
                const nextStar = stars.find(s => s.id === selectedStars[idx + 1]);
                
                if (!currentStar || !nextStar) return null;
                
                return (
                  <motion.line 
                    key={`connection-${idx}`}
                    x1={`${currentStar.x}%`}
                    y1={`${currentStar.y}%`}
                    x2={`${nextStar.x}%`}
                    y2={`${nextStar.y}%`}
                    stroke="rgba(124, 58, 237, 0.5)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.7 }}
                    transition={{ duration: 1 }}
                  />
                );
              })}
            </g>
          </svg>
        )}
        
        {/* Stars */}
        <div 
          className="relative w-full h-full"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
        >
          {stars.map(star => (
            <motion.div
              key={`star-${star.id}`}
              className="absolute z-10 rounded-full cursor-pointer"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size * 8}px`,
                height: `${star.size * 8}px`,
                backgroundColor: star.selected ? 'white' : star.color,
                boxShadow: star.selected 
                  ? `0 0 20px 5px ${star.color}`
                  : `0 0 10px 2px ${star.color}`,
                marginLeft: `-${star.size * 4}px`,
                marginTop: `-${star.size * 4}px`,
              }}
              whileHover={{ scale: 1.5 }}
              onClick={() => handleStarClick(star.id)}
            >
              {star.selected && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Star className="h-full w-full text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Easter egg - hidden testimonial video that appears when 5 stars are connected */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div 
            className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-neutral-900 rounded-xl border border-neutral-700 p-6 max-w-lg w-full shadow-2xl"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Hidden Testimonial</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full" 
                  onClick={() => setShowEasterEgg(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-secondary-500/20 border border-purple-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Executive Testimonial</h4>
                    <p className="text-xs text-neutral-300">CEO of a Fortune 500 Tech Company</p>
                  </div>
                </div>
                
                <blockquote className="text-neutral-200 italic">
                  "Switching to LÆF's AI solutions was the single best decision we made last year. Our development speed
                  increased by 300% while reducing costs. Their team created a custom solution that felt like magic."
                </blockquote>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setShowEasterEgg(false)}>
                  Close Secret
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dialog for case study details or comparison */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {comparingCaseStudies.length > 1 
                ? `Comparing ${comparingCaseStudies.length} Case Studies` 
                : selectedCaseStudy?.title}
            </DialogTitle>
            <DialogDescription>
              {comparingCaseStudies.length > 1 
                ? 'See how these success stories compare across key metrics' 
                : selectedCaseStudy?.challenge?.substring(0, 100) + '...'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Single case study view */}
          {comparingCaseStudies.length <= 1 && selectedCaseStudy && (
            <div className="space-y-4">
              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-neutral-300 mb-2">Challenge</h3>
                <p className="text-white">{selectedCaseStudy.challenge}</p>
              </div>
              
              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-neutral-300 mb-2">Solution</h3>
                <p className="text-white">{selectedCaseStudy.solution}</p>
              </div>
              
              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-neutral-300 mb-2">Results</h3>
                <p className="text-white">{selectedCaseStudy.results}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-400">ROI</p>
                    <p className="text-xl font-bold text-secondary-400">{selectedCaseStudy.metrics?.roi || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Timeframe</p>
                    <p className="text-xl font-bold text-white">{selectedCaseStudy.metrics?.timeframe || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Comparison view */}
          {comparingCaseStudies.length > 1 && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 text-neutral-400 text-sm">Case Study</th>
                      <th className="text-left py-2 px-3 text-neutral-400 text-sm">Industry</th>
                      <th className="text-left py-2 px-3 text-neutral-400 text-sm">ROI</th>
                      <th className="text-left py-2 px-3 text-neutral-400 text-sm">Timeframe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparingCaseStudies.map((study, idx) => (
                      <tr key={idx} className="border-t border-neutral-700">
                        <td className="py-3 px-3 text-white">{study.title}</td>
                        <td className="py-3 px-3 text-neutral-300">{study.industry}</td>
                        <td className="py-3 px-3 text-secondary-400 font-semibold">{study.metrics?.roi || 'N/A'}</td>
                        <td className="py-3 px-3 text-neutral-300">{study.metrics?.timeframe || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Insight summary */}
              <div className="bg-secondary-900/30 border border-secondary-900/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-secondary-400 mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  AI-Generated Insight
                </h3>
                <p className="text-neutral-200">
                  {comparingCaseStudies.length === 2 
                    ? `Both case studies show significant ROI gains, with an average timeframe of approximately ${
                        Math.round(
                          comparingCaseStudies.reduce((acc, study) => {
                            const timeframe = study.metrics?.timeframe || '3 months';
                            const months = parseInt(timeframe.match(/\d+/)?.[0] || '3');
                            return acc + months;
                          }, 0) / comparingCaseStudies.length
                        )
                      } months to implementation.`
                    : `These ${comparingCaseStudies.length} case studies demonstrate our consistent ability to deliver high ROI across different industries and challenge types.`
                  }
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}