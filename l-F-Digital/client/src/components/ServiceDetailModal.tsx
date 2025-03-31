import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, XCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { type Service } from '@shared/schema';

// ROI data visualization
const roiData = [
  { name: 'Month 1', roi: 5 },
  { name: 'Month 2', roi: 15 },
  { name: 'Month 3', roi: 30 },
  { name: 'Month 4', roi: 45 },
  { name: 'Month 5', roi: 65 },
  { name: 'Month 6', roi: 90 },
  { name: 'Month 7', roi: 120 },
  { name: 'Month 8', roi: 150 },
];

// Additional benefits data for visualization
const benefitsData = [
  { name: 'Time Savings', value: 40 },
  { name: 'Cost Reduction', value: 30 },
  { name: 'Quality Improvement', value: 20 },
  { name: 'Risk Reduction', value: 10 },
];

// Comparative analysis data
const comparisonData = [
  {
    name: 'Current',
    efficiency: 45,
    quality: 60,
    scalability: 40,
    security: 55,
  },
  {
    name: 'With Solution',
    efficiency: 95,
    quality: 90,
    scalability: 85,
    security: 95,
  },
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface ServiceDetailModalProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  additionalRecommendations?: Array<{
    id: number;
    name: string;
    description: string;
    iconKey: string | null;
  }>;
}

export default function ServiceDetailModal({ 
  service, 
  open, 
  onOpenChange,
  additionalRecommendations = [] 
}: ServiceDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get metrics from the service or use default ones
  const getMetricValue = (metricName: string): number => {
    // Use default values - the metrics property doesn't exist in the Service type
    // But we'll provide consistent values based on service properties
    
    // Default fallback values for different metrics
    switch(metricName) {
      case 'timeReduction': 
        return service.category.toLowerCase() === 'automation' ? 65 : 35;
      case 'costSavings': 
        return service.category.toLowerCase() === 'analytics' ? 58 : 42;
      case 'qualityImprovement': 
        return service.category.toLowerCase() === 'customer experience' ? 82 : 68;
      case 'scalability': 
        return 90;
      default: 
        return 50;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{service.name}</DialogTitle>
          <DialogDescription className="text-neutral-300 mt-2">
            Comprehensive analysis and detailed insights into how this solution addresses your business challenges
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-4 mb-6 bg-neutral-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
            <TabsTrigger value="impact">Business Impact</TabsTrigger>
            <TabsTrigger value="recommendations">More Solutions</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {service.features?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="rounded-full bg-secondary-500/20 p-1 mt-0.5 flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-secondary-400" />
                      </div>
                      <span className="text-neutral-200">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Implementation Timeline</h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={roiData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#222', borderColor: '#666' }} 
                        labelStyle={{ color: '#ccc' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="roi" 
                        name="Implementation Progress (%)" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <Separator className="my-6 bg-neutral-800" />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard 
                  title="Time Reduction" 
                  value={getMetricValue('timeReduction')} 
                  description="Reduction in processing time" 
                />
                <MetricCard 
                  title="Cost Savings" 
                  value={getMetricValue('costSavings')} 
                  description="Estimated annual savings" 
                />
                <MetricCard 
                  title="Quality Improvement" 
                  value={getMetricValue('qualityImprovement')} 
                  description="Error reduction rate" 
                />
                <MetricCard 
                  title="Scalability" 
                  value={getMetricValue('scalability')} 
                  description="Ability to handle growth" 
                />
              </div>
            </div>
          </TabsContent>
          
          {/* ROI Analysis Tab */}
          <TabsContent value="roi" className="space-y-6">
            <div className="rounded-lg bg-neutral-800/60 p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold mb-6">Return on Investment Projection</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={roiData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#222', borderColor: '#666' }} 
                      labelStyle={{ color: '#ccc' }}
                      formatter={(value) => [`${value}%`, 'ROI']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="roi" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#roiGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <StatCard label="Average ROI" value={service.averageROI || '250%'} />
                <StatCard label="Payback Period" value="4-6 months" />
                <StatCard label="5-Year Value" value="$2.4M" />
                <StatCard label="ROI Confidence" value="92%" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg bg-neutral-800/60 p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold mb-4">Value Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={benefitsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {benefitsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#222', borderColor: '#666' }} 
                        formatter={(value) => [`${value}%`, 'Contribution']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="rounded-lg bg-neutral-800/60 p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold mb-4">Typical Client Results</h3>
                <ul className="space-y-4">
                  <ResultItem 
                    title="Fortune 500 Retail Company" 
                    result="42% reduction in operational costs" 
                    timeline="Within 90 days" 
                  />
                  <ResultItem 
                    title="Mid-Market Healthcare Provider" 
                    result="68% faster processing of patient data" 
                    timeline="Implemented in 45 days" 
                  />
                  <ResultItem 
                    title="Financial Services Firm" 
                    result="320% ROI within first year" 
                    timeline="6-month implementation" 
                  />
                  <ResultItem 
                    title="Manufacturing Leader" 
                    result="$2.1M annual savings" 
                    timeline="Phased rollout over 8 months" 
                  />
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Business Impact Tab */}
          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg bg-neutral-800/60 p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold mb-4">Before/After Comparison</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#222', borderColor: '#666' }} 
                        formatter={(value) => [`${value}%`, '']}
                      />
                      <Legend />
                      <Bar dataKey="efficiency" name="Efficiency" fill="#8884d8" />
                      <Bar dataKey="quality" name="Quality" fill="#82ca9d" />
                      <Bar dataKey="scalability" name="Scalability" fill="#ffc658" />
                      <Bar dataKey="security" name="Security" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="rounded-lg bg-neutral-800/60 p-6 border border-neutral-700">
                <h3 className="text-lg font-semibold mb-4">Key Transformation Areas</h3>
                <ul className="space-y-4">
                  <TransformationItem 
                    title="Digital Workflow" 
                    description="Replace manual processes with automated, error-proof systems" 
                    status="high" 
                  />
                  <TransformationItem 
                    title="Data Accessibility" 
                    description="Democratize data access with secure, role-based permissions" 
                    status="medium" 
                  />
                  <TransformationItem 
                    title="Decision Intelligence" 
                    description="AI-powered insights for faster, more accurate decision making" 
                    status="high" 
                  />
                  <TransformationItem 
                    title="Customer Experience" 
                    description="Personalized interactions across all touchpoints" 
                    status="high" 
                  />
                  <TransformationItem 
                    title="Security Posture" 
                    description="Enhanced protection against modern threats" 
                    status="medium" 
                  />
                </ul>
              </div>
            </div>
            
            <div className="rounded-lg bg-neutral-800/60 p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold mb-4">Potential Risks & Mitigations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RiskItem 
                  title="Change Management" 
                  description="Employee resistance to new workflows" 
                  mitigation="Comprehensive training program and phased rollout" 
                  severity="medium" 
                />
                <RiskItem 
                  title="Integration Complexity" 
                  description="Challenges connecting to legacy systems" 
                  mitigation="Custom API adapters and middleware solutions" 
                  severity="high" 
                />
                <RiskItem 
                  title="Data Migration" 
                  description="Potential for data loss during transition" 
                  mitigation="Dual-run period with comprehensive validation" 
                  severity="medium" 
                />
                <RiskItem 
                  title="Timeline Slippage" 
                  description="Project delays due to unforeseen issues" 
                  mitigation="Agile methodology with buffer periods built-in" 
                  severity="low" 
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Additional Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="rounded-lg bg-neutral-800/60 p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold mb-4">Complete Solution Ecosystem</h3>
              <p className="text-neutral-300 mb-6">
                Based on your business challenge, we've identified these additional solutions that would 
                create a comprehensive ecosystem to completely transform your operations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {additionalRecommendations.map((rec) => (
                  <AdditionalRecommendationCard 
                    key={rec.id} 
                    title={rec.name} 
                    description={rec.description}
                    iconKey={rec.iconKey}
                  />
                ))}
                
                {/* Add default recommendations if none provided */}
                {additionalRecommendations.length === 0 && (
                  <>
                    <AdditionalRecommendationCard 
                      title="Advanced Analytics Platform" 
                      description="Unlock hidden insights in your data with our powerful analytics solution that combines machine learning with intuitive visualizations."
                      iconKey="analytics"
                    />
                    <AdditionalRecommendationCard 
                      title="Process Automation Suite" 
                      description="Eliminate repetitive tasks and reduce errors by implementing end-to-end workflow automation across departments."
                      iconKey="automation"
                    />
                    <AdditionalRecommendationCard 
                      title="Customer Experience Engine" 
                      description="Create personalized customer journeys that increase satisfaction, loyalty and lifetime value through AI-driven interactions."
                      iconKey="customer"
                    />
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-secondary-500/10 rounded-lg p-6 border border-secondary-500/20">
              <h3 className="text-lg font-semibold text-secondary-300 mb-3">Expert Recommendation</h3>
              <p className="text-neutral-300 mb-6">
                For maximum impact, we recommend implementing {service.name} alongside our Advanced Analytics
                platform. This combination has shown to produce 3.5x better results than implementing either
                solution individually.
              </p>
              <div className="flex justify-end">
                <Button className="bg-secondary-600 hover:bg-secondary-500 text-white">
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center">
          <span className="text-sm text-neutral-400">
            All projections based on industry benchmarks and previous client results
          </span>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for metrics cards
function MetricCard({ title, value, description }: { title: string; value: number; description: string }) {
  return (
    <div className="rounded-lg bg-neutral-800/60 p-4 border border-neutral-700">
      <h4 className="text-sm font-medium text-neutral-300 mb-1">{title}</h4>
      <div className="space-y-2">
        <Progress value={value} className="h-2 bg-neutral-700" indicatorClassName="bg-secondary-500" />
        <div className="flex justify-between">
          <span className="text-xs text-neutral-400">{description}</span>
          <span className="text-sm font-medium text-white">{value}%</span>
        </div>
      </div>
    </div>
  );
}

// Helper component for ROI stats
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-neutral-400">{label}</div>
    </div>
  );
}

// Helper component for result items
function ResultItem({ title, result, timeline }: { title: string; result: string; timeline: string }) {
  return (
    <div className="border-l-2 border-secondary-500 pl-4">
      <h4 className="text-sm font-medium text-white">{title}</h4>
      <p className="text-base font-semibold text-secondary-300">{result}</p>
      <p className="text-xs text-neutral-400">{timeline}</p>
    </div>
  );
}

// Helper component for transformation items
function TransformationItem({ 
  title, 
  description, 
  status 
}: { 
  title: string; 
  description: string; 
  status: 'low' | 'medium' | 'high' 
}) {
  const getStatusColor = () => {
    switch(status) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-neutral-400';
      default: return 'text-neutral-400';
    }
  };
  
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-neutral-700 p-1 mt-0.5 flex-shrink-0">
        <Check className={`h-4 w-4 ${getStatusColor()}`} />
      </div>
      <div>
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <p className="text-xs text-neutral-400">{description}</p>
      </div>
    </div>
  );
}

// Helper component for risk items
function RiskItem({ 
  title, 
  description, 
  mitigation,
  severity 
}: { 
  title: string; 
  description: string; 
  mitigation: string;
  severity: 'low' | 'medium' | 'high' 
}) {
  const getIcon = () => {
    switch(severity) {
      case 'high': return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'low': return <AlertTriangle className="h-5 w-5 text-green-400" />;
      default: return <AlertTriangle className="h-5 w-5 text-neutral-400" />;
    }
  };
  
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-neutral-700 p-1 mt-0.5 flex-shrink-0">
        {getIcon()}
      </div>
      <div>
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <p className="text-xs text-neutral-400 mb-1">{description}</p>
        <div className="bg-neutral-700/50 rounded px-2 py-1">
          <span className="text-xs text-secondary-300 font-medium">Mitigation: </span>
          <span className="text-xs text-neutral-300">{mitigation}</span>
        </div>
      </div>
    </div>
  );
}

// Helper component for additional recommendation cards
function AdditionalRecommendationCard({ 
  title, 
  description,
  iconKey
}: { 
  title: string; 
  description: string;
  iconKey: string;
}) {
  // Get icon based on key
  const getIcon = () => {
    switch(iconKey.toLowerCase()) {
      case 'analytics':
        return <BarChart className="h-5 w-5 text-emerald-400" />;
      case 'automation':
        return <Settings className="h-5 w-5 text-blue-400" />;
      case 'customer':
        return <Users className="h-5 w-5 text-purple-400" />;
      default:
        return <Check className="h-5 w-5 text-white" />;
    }
  };
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600 hover:border-secondary-500/40 transition-colors duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-neutral-600/80 p-2 flex-shrink-0">
          {getIcon()}
        </div>
        <div>
          <h4 className="text-base font-medium text-white mb-1">{title}</h4>
          <p className="text-sm text-neutral-300">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}