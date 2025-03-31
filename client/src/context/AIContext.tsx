import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useChatMessages } from '@/lib/openai';
import { type Message, type Conversation } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// Helper function to cast the role to a valid Message role
const asMessageRole = (role: string): 'user' | 'assistant' | 'system' => {
  if (role === 'user' || role === 'assistant' || role === 'system') {
    return role;
  }
  return 'assistant'; // Default fallback
};

interface AIContextType {
  messages: Message[];
  conversation: Conversation | null;
  isLoading: boolean;
  isChatOpen: boolean;
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
}

export const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { sendMessage: apiSendMessage, createConversation, isLoading } = useChatMessages();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Initialize conversation
  useEffect(() => {
    async function initChat() {
      try {
        const newConversation = await createConversation();
        if (newConversation) {
          setConversation(newConversation);
          setMessages(newConversation.messages || []);
        } else {
          // Create a fallback conversation if API fails
          const fallbackMessage: Message = {
            role: 'assistant' as const,
            content: 'Hello! I\'m L&F Digital Assistant. How can I help you today?',
            timestamp: Date.now()
          };
          
          const fallbackConversation: Conversation = {
            id: 0,
            userId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: [fallbackMessage]
          };
          setConversation(fallbackConversation);
          setMessages(fallbackConversation.messages);
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        
        // Create a fallback conversation if API fails
        const fallbackMessage: Message = {
          role: 'assistant' as const,
          content: 'Hello! I\'m L&F Digital Assistant. How can I help you today?',
          timestamp: Date.now()
        };
        
        const fallbackConversation: Conversation = {
          id: 0,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [fallbackMessage]
        };
        setConversation(fallbackConversation);
        setMessages(fallbackConversation.messages);
        
        toast({
          title: "Chat initialization in offline mode",
          description: "We're experiencing connectivity issues. Some features may be limited.",
          variant: "default",
        });
      }
    }
    
    if (!conversation) {
      initChat();
    }
  }, []);
  
  const sendMessage = async (content: string) => {
    if (!content.trim() || !conversation) return;
    
    // Add user message to UI immediately
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      const response = await apiSendMessage(conversation.id, content);
      
      if (response.conversation) {
        setConversation(response.conversation);
        setMessages(response.conversation.messages);
      }
    } catch (error) {
      toast({
        title: "Message failed",
        description: "We couldn't send your message. Please try again.",
        variant: "destructive",
      });
      
      // Remove the user message if API call fails
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };
  
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };
  
  return (
    <AIContext.Provider
      value={{
        messages,
        conversation,
        isLoading,
        isChatOpen,
        isTyping,
        sendMessage,
        toggleChat,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
