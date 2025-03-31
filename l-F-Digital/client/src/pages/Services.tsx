import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Filter, CheckCircle2, ArrowDown, Database, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Service } from '@shared/schema';
import AIChatInterface from '@/components/AIChatInterface';

export default function Services() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Fetch all services
  const { data: allServices = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Filter services based on search query and filters
  const filteredServices = allServices.filter((service) => {
    const matchesSearch = 
      searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      service.category.toLowerCase() === selectedCategory.toLowerCase();
    
    // In a real app, we'd have budget ranges in the API
    // This is a simplified implementation
    const matchesBudget = selectedBudget === 'all';
    
    return matchesSearch && matchesCategory && matchesBudget;
  });

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  // Get unique categories for filtering
  const categories = ['all', ...Array.from(new Set(allServices.map(service => service.category.toLowerCase())))];
  
  return (
    <div className="relative min-h-screen bg-neutral-900 text-neutral-100">
      {/* Background elements - using a lighter style than home page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-600/5 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-600/5 rounded-full filter blur-3xl"></div>
        </div>
      </div>
      
      {/* Main content */}
      <Navbar />
      
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-neutral-800 text-primary-400 text-sm font-medium mb-4">
            Service Catalog
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Our AI-Powered Digital Services
          </h1>
          <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
            Explore our complete catalog of services with advanced filtering and comparison tools to find the perfect solution for your business needs.
          </p>
        </motion.div>
        
        {/* Filters section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-neutral-800/30 rounded-xl border border-neutral-700 p-6 mb-10"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Search input */}
            <div className="flex-1">
              <div className="relative">
                <Input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services..." 
                  className="w-full bg-neutral-800/50 border-neutral-700"
                />
              </div>
            </div>
            
            {/* Category filter */}
            <div className="w-full md:w-48">
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="bg-neutral-800/50 border-neutral-700">
                  <span className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Budget filter */}
            <div className="w-full md:w-48">
              <Select 
                value={selectedBudget} 
                onValueChange={setSelectedBudget}
              >
                <SelectTrigger className="bg-neutral-800/50 border-neutral-700">
                  <span className="flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Budget" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Budget</SelectItem>
                  <SelectItem value="low">$1K-5K</SelectItem>
                  <SelectItem value="medium">$5K-15K</SelectItem>
                  <SelectItem value="high">$15K+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Compare button - for future implementation */}
            <Button variant="outline" className="border-primary-500 text-primary-400 hover:bg-primary-500/10">
              <Settings className="h-4 w-4 mr-2" />
              Compare Services
            </Button>
          </div>
        </motion.div>
        
        {/* Services display with tab options */}
        <Tabs defaultValue="grid" className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'} {selectedCategory !== 'all' ? `in ${selectedCategory}` : ''}
            </h2>
            <TabsList className="bg-neutral-800/30">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="grid" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-80 bg-neutral-800/20 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service: Service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-neutral-800/20 rounded-xl border border-neutral-700">
                <p className="text-neutral-400">No services found matching your criteria.</p>
                <Button variant="link" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedBudget('all');
                }}>
                  Reset filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="table" className="mt-0">
            <div className="bg-neutral-800/20 rounded-xl border border-neutral-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-800/50">
                      <th className="text-left p-4 font-medium text-neutral-300">Service</th>
                      <th className="text-left p-4 font-medium text-neutral-300">Category</th>
                      <th className="text-left p-4 font-medium text-neutral-300">Features</th>
                      <th className="text-left p-4 font-medium text-neutral-300">Avg. ROI</th>
                      <th className="text-left p-4 font-medium text-neutral-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((service: Service) => (
                      <tr key={service.id} className="border-t border-neutral-700/50 hover:bg-neutral-800/30">
                        <td className="p-4">
                          <div>
                            <h3 className="font-medium text-white">{service.name}</h3>
                            <p className="text-neutral-400 text-sm">{service.description}</p>
                          </div>
                        </td>
                        <td className="p-4 text-neutral-300">{service.category}</td>
                        <td className="p-4">
                          <ul className="space-y-1">
                            {service.features?.slice(0, 2).map((feature, i) => (
                              <li key={i} className="text-sm text-neutral-400 flex items-start">
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary-400 mr-1.5 mt-0.5" />
                                {feature}
                              </li>
                            ))}
                            {(service.features?.length || 0) > 2 && (
                              <li className="text-sm text-primary-400">
                                +{(service.features?.length || 0) - 2} more
                              </li>
                            )}
                          </ul>
                        </td>
                        <td className="p-4 text-secondary-400 font-medium">{service.averageROI || 'N/A'}</td>
                        <td className="p-4">
                          <Button variant="outline" size="sm" className="text-primary-400 border-primary-500 hover:bg-primary-500/10">
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Service Comparison (preview) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-br from-primary-900/30 to-secondary-900/30 border-neutral-700">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white mb-2">Compare Service Packages</h2>
                  <p className="text-neutral-300">Get a side-by-side comparison of our service packages to find the perfect fit.</p>
                </div>
                <Button className="bg-white text-primary-800 hover:bg-neutral-200 md:w-auto">
                  Open Comparison Tool
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Case Studies section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-2xl text-white mb-6">See Our Services in Action</h2>
          <Button variant="secondary" className="inline-flex items-center gap-2">
            View Case Studies
            <ArrowDown className="h-4 w-4" />
          </Button>
        </motion.div>
      </main>
      
      {/* Chat interface */}
      <AIChatInterface isOpen={isChatOpen} onToggle={toggleChat} />
      
      {/* CTA at bottom */}
      <div className="bg-neutral-800/60 border-t border-neutral-700 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-2xl text-white mb-4">Ready to transform your business?</h2>
          <p className="text-neutral-300 max-w-2xl mx-auto mb-6">
            Schedule a free consultation to discuss your specific needs and how our AI solutions can deliver measurable ROI.
          </p>
          <Button size="lg" className="bg-primary-600 hover:bg-primary-500">
            Book Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}

// Service Card Component - simpler version for Services page
function ServiceCard({ service }: { service: Service }) {
  // Get category color class - different style than Home page
  const getCategoryColorClass = (category: string) => {
    switch(category.toLowerCase()) {
      case 'automation':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'analytics':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'customer experience':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
    }
  };
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-xl bg-neutral-800/20 border border-neutral-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-900/20 hover:border-neutral-600"
    >
      <div className="p-6">
        <div className={`mb-4 inline-block px-2.5 py-1 rounded text-xs font-medium ${getCategoryColorClass(service.category)}`}>
          {service.category}
        </div>
        
        <h3 className="font-display font-bold text-xl text-white mb-2">{service.name}</h3>
        <p className="text-neutral-400 mb-4 line-clamp-2">{service.description}</p>
        
        <Separator className="my-4 bg-neutral-800" />
        
        <div className="space-y-2 mb-6">
          {service.features?.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-neutral-300">{feature}</span>
            </div>
          ))}
          
          {(service.features?.length || 0) > 3 && (
            <div className="text-sm text-primary-400 pl-6">
              +{(service.features?.length || 0) - 3} more features
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {service.averageROI && (
            <div>
              <span className="text-xs uppercase text-neutral-500">Avg. ROI</span>
              <p className="text-secondary-400 font-bold">{service.averageROI}</p>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="border-primary-500 text-primary-400 hover:bg-primary-500/10"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}