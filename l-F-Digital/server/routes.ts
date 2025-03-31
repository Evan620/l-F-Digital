import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBusinessInfoSchema, insertConversationSchema, type Message } from "@shared/schema";
import { openai, createChatCompletion } from "./openai";
import { generateChatCompletion, hasOpenRouterCredentials } from "./openrouter";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Business information endpoint
  app.post("/api/business-info", async (req: Request, res: Response) => {
    try {
      const parsedData = insertBusinessInfoSchema.parse(req.body);
      const businessInfo = await storage.createBusinessInfo(parsedData);
      res.status(201).json(businessInfo);
    } catch (error) {
      res.status(400).json({ message: "Invalid business info data", error });
    }
  });
  
  // Services endpoints
  app.get("/api/services", async (_req: Request, res: Response) => {
    const services = await storage.getAllServices();
    res.json(services);
  });
  
  app.get("/api/services/category/:category", async (req: Request, res: Response) => {
    const { category } = req.params;
    const services = await storage.getServicesByCategory(category);
    res.json(services);
  });
  
  // Case studies endpoints
  app.get("/api/case-studies", async (_req: Request, res: Response) => {
    const caseStudies = await storage.getAllCaseStudies();
    res.json(caseStudies);
  });
  
  app.get("/api/case-studies/industry/:industry", async (req: Request, res: Response) => {
    const { industry } = req.params;
    const caseStudies = await storage.getCaseStudiesByIndustry(industry);
    res.json(caseStudies);
  });
  
  // AI service recommendation endpoint
  app.post("/api/ai/service-recommendation", async (req: Request, res: Response) => {
    try {
      const { businessChallenge } = z.object({
        businessChallenge: z.string().min(5).max(500),
      }).parse(req.body);
      
      const services = await storage.getAllServices();

      const prompt = `
        Based on the following business challenge: "${businessChallenge}"
        
        Please recommend up to 3 of our services that would be most helpful.
        Choose from this list of our services:
        ${services.map(service => `
          - ${service.name}: ${service.description}
            Features: ${service.features.join(', ')}
            Category: ${service.category}
            Average ROI: ${service.averageROI}
            ID: ${service.id}
        `).join('\n')}
        
        Return your recommendation as JSON in this exact format:
        {
          "serviceSuggestions": [
            {
              "id": number,
              "name": string,
              "description": string,
              "features": string[],
              "averageROI": string,
              "category": string,
              "iconKey": string,
              "explanation": string
            }
          ]
        }
        
        Include an "explanation" field for each service explaining why it's a good fit for this specific challenge.
      `;
      
      try {
        // First try OpenRouter with DeepSeek if available
        let responseContent;
        // Always try to use OpenRouter first
        if (hasOpenRouterCredentials()) {
          console.log("Using OpenRouter with DeepSeek for service recommendation");
          responseContent = await generateChatCompletion([
            { role: "user", content: prompt }
          ], { jsonMode: true });
        } else {
          // Fall back to Azure OpenAI or standard OpenAI only if OpenRouter fails
          console.log("OpenRouter unavailable, falling back to OpenAI for service recommendation");
          responseContent = await createChatCompletion([
            { role: "user", content: prompt }
          ]);
        }
        
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseContent);
          
          // Check if we got an error message instead of actual service suggestions
          if (parsedResponse.message && !parsedResponse.serviceSuggestions) {
            console.log("AI service unavailable, using fallback:", parsedResponse.message);
            throw new Error("AI service unavailable");
          }
          
          res.json(parsedResponse);
        } catch (parseError) {
          console.error("Failed to parse AI response or received error:", parseError);
          throw new Error("Invalid AI response format");
        }
      } catch (error) {
        console.error("AI service error:", error instanceof Error ? error.message : String(error));
        // Fallback to return some default services
        const defaultServices = await storage.getAllServices();
        const fallbackResponse = {
          serviceSuggestions: defaultServices.slice(0, 3).map(service => ({
            ...service,
            explanation: "This service might help address your business challenge."
          })),
        };
        res.json(fallbackResponse);
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  // AI case study generation endpoint
  app.post("/api/ai/generate-case-study", async (req: Request, res: Response) => {
    try {
      const { query } = z.object({
        query: z.string().min(5).max(500),
      }).parse(req.body);
      
      const prompt = `
        Generate a realistic case study based on this query: "${query}"
        
        The case study should demonstrate how L&F Digital's AI solutions solved a specific business problem.
        
        Return your case study as JSON in this exact format:
        {
          "caseStudy": {
            "title": string,
            "industry": string,
            "challenge": string,
            "solution": string,
            "results": string,
            "metrics": {
              "key1": "value1",
              "key2": "value2",
              "key3": "value3"
            },
            "isGenerated": true
          }
        }
        
        The metrics should include 3 key performance indicators with their values.
        Make sure the case study is realistic, data-driven, and showcases impressive but believable results.
      `;
      
      try {
        // Always try to use OpenRouter first
        let responseContent;
        if (hasOpenRouterCredentials()) {
          console.log("Using OpenRouter with DeepSeek for case study generation");
          responseContent = await generateChatCompletion([
            { role: "user", content: prompt }
          ], { jsonMode: true });
        } else {
          // Fall back to Azure OpenAI or standard OpenAI only if OpenRouter fails
          console.log("OpenRouter unavailable, falling back to OpenAI for case study generation");
          responseContent = await createChatCompletion([
            { role: "user", content: prompt }
          ]);
        }
        
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseContent);
          
          // Check if we got an error message instead of an actual case study
          if (parsedResponse.message && !parsedResponse.caseStudy) {
            console.log("AI service unavailable, using fallback:", parsedResponse.message);
            throw new Error("AI service unavailable");
          }
          
          // Save the generated case study
          if (parsedResponse.caseStudy) {
            const newCaseStudy = await storage.createCaseStudy(parsedResponse.caseStudy);
            parsedResponse.caseStudy.id = newCaseStudy.id;
          }
          
          res.json(parsedResponse);
        } catch (parseError) {
          console.error("Failed to parse AI response or received error:", parseError);
          throw new Error("Invalid AI response format");
        }
      } catch (error) {
        console.error("AI service error:", error instanceof Error ? error.message : String(error));
        // Return a fallback case study
        const existingCaseStudies = await storage.getAllCaseStudies();
        const fallbackCaseStudy = existingCaseStudies.length > 0 
          ? existingCaseStudies[0] 
          : {
              id: 0,
              title: "How AI Transformed Business Operations",
              industry: "General",
              challenge: "The client faced operational inefficiencies.",
              solution: "We implemented AI-driven automation.",
              results: "Achieved significant improvements in productivity and cost savings.",
              metrics: {
                "productivityIncrease": "35%",
                "costReduction": "$500K",
                "implementationTime": "3 months"
              },
              isGenerated: true
            };
        
        res.json({ caseStudy: fallbackCaseStudy });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });
  
  // Chat conversation endpoints
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const parsedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(parsedData);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data", error });
    }
  });
  
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { message } = z.object({
        message: z.string().min(1).max(1000),
      }).parse(req.body);
      
      // Get existing conversation
      const conversation = await storage.getConversation(parseInt(id, 10));
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Add user message
      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: Date.now()
      };
      
      const messages = [...conversation.messages, userMessage];
      
      // Use OpenAI to generate a response
      const systemPrompt = `
        You are an AI assistant for L&F Digital, a company that provides AI-driven digital transformation solutions.
        Your name is L&F Digital Assistant.
        
        L&F Digital offers services like:
        - Workflow Automation
        - Predictive Analytics
        - AI Chatbots & Assistants
        - Custom AI Models
        - Integration Services
        
        Keep responses professional but conversational, helpful, and concise.
        If asked about pricing, explain that it depends on project scope and suggest a consultation.
        If you don't know something specific about L&F Digital, be honest about it.
      `;
      
      try {
        // Convert our messages format to OpenAI format
        const openAIMessages = [
          { role: "system" as const, content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ];
        
        // Always try to use OpenRouter first
        let responseContent;
        if (hasOpenRouterCredentials()) {
          console.log("Using OpenRouter with DeepSeek for chat response");
          responseContent = await generateChatCompletion(openAIMessages);
        } else {
          // Fall back to Azure OpenAI or standard OpenAI only if OpenRouter fails
          console.log("OpenRouter unavailable, falling back to OpenAI for chat response");
          responseContent = await createChatCompletion(openAIMessages, {
            response_format: undefined  // Chat doesn't need JSON format
          });
        }
        
        // Check if we got an error message from the AI service
        let errorMessage = null;
        try {
          // Try to parse as JSON to check if it's an error response
          const parsedResponse = JSON.parse(responseContent);
          if (parsedResponse.message && typeof parsedResponse.message === 'string') {
            console.log("Received error from AI service:", parsedResponse.message);
            errorMessage = parsedResponse.message;
          }
        } catch (parseError) {
          // Not JSON or not an error message, this is the normal flow
        }
        
        if (errorMessage) {
          throw new Error("AI service unavailable: " + errorMessage);
        }
        
        // Add assistant message
        const assistantMessage: Message = {
          role: "assistant",
          content: responseContent || "I'm sorry, I couldn't process that request.",
          timestamp: Date.now()
        };
        
        const updatedMessages = [...messages, assistantMessage];
        const updatedConversation = await storage.updateConversation(conversation.id, updatedMessages);
        
        res.json({ message: assistantMessage, conversation: updatedConversation });
      } catch (error) {
        console.error("AI chat service error:", error instanceof Error ? error.message : String(error));
        
        // Fallback response if AI service fails
        const fallbackMessage: Message = {
          role: "assistant",
          content: "I'm currently experiencing some technical difficulties. Please try again later or contact our team directly for immediate assistance.",
          timestamp: Date.now()
        };
        
        const updatedMessages = [...messages, fallbackMessage];
        const updatedConversation = await storage.updateConversation(conversation.id, updatedMessages);
        
        res.json({ message: fallbackMessage, conversation: updatedConversation });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid message data", error });
    }
  });
  
  // ROI calculator endpoint
  app.post("/api/ai/roi-calculator", async (req: Request, res: Response) => {
    try {
      const roiRequest = z.object({
        industry: z.string(),
        annualRevenue: z.string(),
        businessGoal: z.string(),
        teamSize: z.number(),
        automationLevel: z.string(),
        implementationTimeline: z.string()
      }).parse(req.body);
      
      // Try to use OpenAI to generate a realistic ROI projection
      const prompt = `
        Calculate a realistic ROI projection for a business with these parameters:
        - Industry: ${roiRequest.industry}
        - Annual Revenue: ${roiRequest.annualRevenue}
        - Business Goal: ${roiRequest.businessGoal}
        - Team Size: ${roiRequest.teamSize} employees
        - Current Automation Level: ${roiRequest.automationLevel}
        - Implementation Timeline: ${roiRequest.implementationTimeline}
        
        Return your projection as JSON in this exact format:
        {
          "estimatedROI": "percentage",
          "costReduction": "dollar amount per year",
          "timelineMonths": number,
          "potentialSavings": "dollar amount per year"
        }
        
        Make the projection realistic but impressive, with higher ROI for businesses with low automation and urgent implementation timelines.
      `;
      
      try {
        // Always try to use OpenRouter first
        let responseContent;
        if (hasOpenRouterCredentials()) {
          console.log("Using OpenRouter with DeepSeek for ROI calculation");
          responseContent = await generateChatCompletion([
            { role: "user", content: prompt }
          ], { jsonMode: true });
        } else {
          // Fall back to Azure OpenAI or standard OpenAI only if OpenRouter fails
          console.log("OpenRouter unavailable, falling back to OpenAI for ROI calculation");
          responseContent = await createChatCompletion([
            { role: "user", content: prompt }
          ]);
        }
        
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseContent);
          
          // Check if we got an error message instead of ROI data
          if (parsedResponse.message && !parsedResponse.estimatedROI) {
            console.log("AI service unavailable, using fallback:", parsedResponse.message);
            throw new Error("AI service unavailable");
          }
          
          res.json(parsedResponse);
          return; // Exit early if successful
        } catch (parseError) {
          console.error("Failed to parse AI response or received error:", parseError);
          throw new Error("Invalid AI response format");
        }
      } catch (error) {
        console.error("AI service error:", error instanceof Error ? error.message : String(error));
        
        // Fallback ROI calculation if AI service fails
        const baseROI = roiRequest.automationLevel === "Very Low" ? 300 : 
                      roiRequest.automationLevel === "Low" ? 250 :
                      roiRequest.automationLevel === "Medium" ? 200 :
                      roiRequest.automationLevel === "High" ? 150 : 100;
        
        // Higher ROI for urgent timelines
        const timelineMultiplier = roiRequest.implementationTimeline === "ASAP" ? 1.2 : 1;
        
        // Parse revenue range for estimation
        let revenueEstimate = 1000000; // Default to $1M
        if (roiRequest.annualRevenue.includes("1M-5M")) revenueEstimate = 3000000;
        if (roiRequest.annualRevenue.includes("5M-20M")) revenueEstimate = 10000000;
        if (roiRequest.annualRevenue.includes("20M-50M")) revenueEstimate = 35000000;
        if (roiRequest.annualRevenue.includes("over50M")) revenueEstimate = 75000000;
        
        const finalROI = Math.round(baseROI * timelineMultiplier);
        const costReduction = Math.round(revenueEstimate * finalROI / 100 * 0.05);
        
        const fallbackResponse = {
          estimatedROI: `${finalROI}%`,
          costReduction: `$${(costReduction).toLocaleString()}/year`,
          timelineMonths: roiRequest.implementationTimeline === "ASAP" ? 3 : 
                        roiRequest.implementationTimeline === "3-6 Months" ? 6 : 9,
          potentialSavings: `$${(costReduction * 3).toLocaleString()}/year`
        };
        
        res.json(fallbackResponse);
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid ROI calculation request", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}