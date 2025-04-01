
import { Route, Router } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { AIProvider } from '@/context/AIContext';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import CaseStudies from '@/pages/CaseStudies';
import Contact from '@/pages/Contact';
import AITools from '@/pages/AITools';
import NotFound from '@/pages/not-found';

export default function App() {
  return (
    <AIProvider>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/case-studies" component={CaseStudies} />
        <Route path="/contact" component={Contact} />
        <Route path="/ai-tools" component={AITools} />
        <Route path="/:rest*" component={NotFound} />
      </Router>
      <Toaster />
    </AIProvider>
  );
}
