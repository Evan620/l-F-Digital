import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface AIChatInterfaceProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AIChatInterface({ isOpen, onToggle }: AIChatInterfaceProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation when component mounts
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        const response = await apiRequest('POST', '/api/conversations', {
          messages: [{
            role: 'assistant',
            content: "Hi there! I'm your L&F Digital AI assistant. How can I help you today? You can ask about our services, pricing, or how we can solve specific business challenges.",
            timestamp: Date.now()
          }]
        });

        const newConversation = await response.json();
        setConversation(newConversation);
      } catch (error) {
        toast({
          title: "Chat initialization failed",
          description: "We couldn't start a new chat. Please refresh the page and try again.",
          variant: "destructive",
        });
      }
    };

    if (!conversation) {
      initializeConversation();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  const handleSubmitMessage = async () => {
    if (!message.trim() || !conversation) return;

    // Add user message to UI immediately
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    setConversation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, userMessage]
      };
    });

    setMessage('');
    setIsTyping(true);

    try {
      const response = await apiRequest('POST', `/api/conversations/${conversation.id}/messages`, {
        message: message.trim()
      });

      const data = await response.json();

      if (data.conversation) {
        setConversation(data.conversation);
      }
    } catch (error) {
      toast({
        title: "Message failed",
        description: "We couldn't send your message. Please try again.",
        variant: "destructive",
      });

      // Remove the user message if API call fails
      setConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: prev.messages.slice(0, -1)
        };
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessage();
    }
  };

  // Quick suggestion buttons
  const quickSuggestions = [
    "Request a demo",
    "Pricing options",
    "Integration with my CRM"
  ];

  return (
    <>
      {/* Chat Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-4 right-4 w-[450px] bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl overflow-hidden z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <style>{`
              .chat-message:nth-child(odd) {
                background: rgba(255,255,255,0.02);
              }
              .prose :last-child { margin-bottom: 0; }
            `}</style>
            {/* Chat Header */}
            <div className="p-4 bg-neutral-800 border-b border-neutral-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <div>
                  <h3 className="font-medium text-white">L&F Digital Assistant</h3>
                  <div className="flex items-center text-xs text-neutral-400">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Online
                  </div>
                </div>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={onToggle}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {conversation?.messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  <div className="p-4 chat-message">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0">
                        {msg.role === 'assistant' ? (
                          <Bot className="w-5 h-5 text-primary-400" />
                        ) : (
                          <User className="w-5 h-5 text-secondary-400" />
                        )}
                      </div>
                      <div className="flex-1 prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-md font-bold mb-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2 text-neutral-300" {...props} />,
                            code: ({node, ...props}) => <code className="bg-neutral-800 px-1 py-0.5 rounded" {...props} />,
                            pre: ({node, ...props}) => <pre className="bg-neutral-800 p-3 rounded-lg my-2 overflow-x-auto" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary-500/50 pl-4 italic my-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-primary-400 font-bold" {...props} />,
                            a: ({node, ...props}) => <a className="text-primary-400 hover:underline" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Typing Indicator */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex-shrink-0" />
                  <div className="bg-neutral-800 py-2 px-3 rounded-tl-xl rounded-tr-xl rounded-br-xl">
                    <div className="flex space-x-1">
                      <motion.div 
                        className="w-2 h-2 bg-neutral-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-neutral-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-neutral-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* For auto-scrolling */}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-neutral-800">
              <div className="flex gap-2">
                <Input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
                />
                <Button 
                  size="icon"
                  onClick={handleSubmitMessage}
                  disabled={!message.trim() || isTyping}
                  className="p-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>

              {/* Quick Suggestions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="px-3 py-1 h-auto text-xs bg-neutral-800 hover:bg-neutral-700 border-none rounded-full text-neutral-300"
                    onClick={() => setMessage(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}