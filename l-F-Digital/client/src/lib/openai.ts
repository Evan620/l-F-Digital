import { useState } from 'react';
import { apiRequest } from './queryClient';
import { type Service, type CaseStudy, type ROIProjection } from '@shared/schema';

// Custom hook for service recommendations
export function useServiceRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  async function getRecommendations(businessChallenge: string): Promise<(Service & { explanation?: string })[]> {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/ai/service-recommendation', {
        businessChallenge,
      });
      
      const data = await response.json();
      return data.serviceSuggestions || [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }
  
  return { getRecommendations, isLoading, error };
}

// Custom hook for case study generation
export function useCaseStudyGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  async function generateCaseStudy(query: string): Promise<CaseStudy | null> {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/ai/generate-case-study', {
        query,
      });
      
      const data = await response.json();
      return data.caseStudy || null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }
  
  return { generateCaseStudy, isLoading, error };
}

// Custom hook for ROI calculator
export function useROICalculator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  async function calculateROI(params: {
    industry: string;
    annualRevenue: string;
    businessGoal: string;
    teamSize: number;
    automationLevel: string;
    implementationTimeline: string;
  }): Promise<ROIProjection | null> {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/ai/roi-calculator', params);
      const data = await response.json();
      return data || null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }
  
  return { calculateROI, isLoading, error };
}

// Custom hook for chat messages
export function useChatMessages() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  async function sendMessage(conversationId: number, message: string) {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        message,
      });
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }
  
  async function createConversation() {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/conversations', {
        messages: [{
          role: 'assistant',
          content: "Hi there! I'm your L&F Digital AI assistant. How can I help you today? You can ask about our services, pricing, or how we can solve specific business challenges.",
          timestamp: Date.now()
        }]
      });
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }
  
  return {
    sendMessage,
    createConversation,
    isLoading,
    error
  };
}
