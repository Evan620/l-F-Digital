
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AIProvider } from '@/context/AIContext';
import { useAI } from '@/context/AIContext';
import AIChatInterface from '@/components/AIChatInterface';
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import CaseStudies from "@/pages/CaseStudies";
import Contact from "@/pages/Contact";
import AITools from "@/pages/AITools";

export default function App() {
  return (
    <AIProvider>
      <AppContent />
    </AIProvider>
  );
}

function AppContent() {
  const { isChatOpen, toggleChat } = useAI();
  
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/case-studies" component={CaseStudies} />
        <Route path="/contact" component={Contact} />
        <Route path="/ai-tools" component={AITools} />
        <Route path="*" component={NotFound} />
      </Switch>
      <Toaster />
      <AIChatInterface isOpen={isChatOpen} onToggle={toggleChat} />
    </>
  );
}
