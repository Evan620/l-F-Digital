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
        As a senior digital transformation consultant for L&F Digital, analyze this business challenge: "${businessChallenge}"
        
        L&F Digital offers a full spectrum of technology solutions including:
        1. Custom Software Development - Building tailored applications, platforms, and digital products
        2. AI & Machine Learning Solutions - Predictive models, NLP, computer vision, recommendation systems
        3. Automation & Workflow Optimization - Process automation, workflow digitization, RPA
        4. Cloud Solutions & Infrastructure - Cloud migration, serverless architecture, DevOps
        5. Data Analytics & Business Intelligence - Data warehousing, dashboards, predictive analytics
        6. Digital Experience & Customer Journey - UX/UI design, customer portals, engagement platforms
        7. Enterprise Systems Integration - API development, system integration, middleware solutions
        8. Cybersecurity & Compliance - Security audits, implementation, incident response strategies
        
        Here are our existing services:
        ${services.map(service => `
          - ${service.name}: ${service.description}
            Features: ${service.features.join(', ')}
            Category: ${service.category}
            Average ROI: ${service.averageROI}
            ID: ${service.id}
        `).join('\n')}
        
        Instructions:
        1. Recommend 3 solutions that directly address the business challenge
        2. Be creative - if our existing services don't perfectly match the needs, suggest NEW custom solutions that would fit
        3. For new suggested services, use id: 0 and set isNew: true
        4. For each service, explain specifically how it addresses this business challenge
        5. Include estimated timeline and ROI projections customized to this scenario
        
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
              "explanation": string,
              "implementationTimeWeeks": number,
              "isNew": boolean
            }
          ]
        }
        
        For iconKey, choose from: "rocket", "zap", "bar-chart", "users", "settings", "layers", "shield", "cloud"
        Make recommendations highly relevant, specific, and tailored to the exact business challenge.
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
          // First attempt to clean response - remove markdown code blocks if present
          let cleanedContent = responseContent;
          if (responseContent.includes("```json")) {
            cleanedContent = responseContent.replace(/```json\n|\n```/g, "");
          }
          
          parsedResponse = JSON.parse(cleanedContent);
          
          // Check if we got an error message instead of actual service suggestions
          if (parsedResponse.message && !parsedResponse.serviceSuggestions) {
            console.log("AI service unavailable, using fallback:", parsedResponse.message);
            throw new Error("AI service unavailable");
          }
          
          res.json(parsedResponse);
        } catch (parseError) {
          console.error("Failed to parse AI response or received error:", parseError);
          
          // Fallback to default services from storage
          const fallbackServices = await storage.getAllServices();
          const topServices = fallbackServices.slice(0, 3);
          
          res.json({
            serviceSuggestions: topServices,
            note: "Using default suggestions due to AI service error"
          });
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
        
        L&F Digital is a full-spectrum technology solutions provider with expertise in:
        
        1. Custom Software Development (enterprise applications, mobile apps, web portals)
        2. AI & Machine Learning (NLP, computer vision, predictive models, recommendation engines)
        3. Automation & Workflow Optimization (RPA, document processing, business process reengineering)
        4. Cloud Solutions & Infrastructure (migration, serverless, DevOps, IaC)
        5. Data Analytics & Business Intelligence (data warehousing, dashboards, real-time analytics)
        6. Digital Experience & Customer Journey (UX/UI, customer portals, engagement platforms)
        7. Enterprise Systems Integration (legacy modernization, API management, middleware)
        8. Cybersecurity & Compliance (security assessment, compliance frameworks, monitoring)
        
        Based on the query, create a detailed case study showcasing how L&F Digital's technology solutions solved a specific business challenge. The solution should be comprehensive and may involve multiple service categories.
        
        Return your case study as JSON in this exact format:
        {
          "caseStudy": {
            "title": string,
            "industry": string,
            "challenge": string,
            "solution": string,
            "results": string,
            "primaryServiceCategory": string,
            "secondaryServiceCategories": string[],
            "metrics": {
              "key1": "value1",
              "key2": "value2",
              "key3": "value3"
            },
            "timeline": string,
            "teamSize": string,
            "technologiesUsed": string[],
            "isGenerated": true
          }
        }
        
        - The challenge should be specific and detail the actual business problems faced
        - The solution should describe the technical implementation with enough detail to be credible
        - Include relevant technologies and approaches used
        - The metrics should include 3 key performance indicators with impressive but believable values
        - Make the case study realistic, data-driven, and highly compelling
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
          // First attempt to clean response - remove markdown code blocks if present
          let cleanedContent = responseContent;
          if (responseContent.includes("```json")) {
            cleanedContent = responseContent.replace(/```json\n|\n```/g, "");
          }
          
          parsedResponse = JSON.parse(cleanedContent);
          
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
          
          // Fallback to default case study
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
        You are an AI assistant for L&F Digital (styled as "LÆF"), a full-spectrum digital solutions company.
        Your name is L&F Digital Assistant.
        
        L&F Digital offers a comprehensive range of technology services across these categories:
        
        1. Custom Software Development
          - Enterprise applications
          - Mobile apps (iOS, Android, cross-platform)
          - Web applications and portals
          - API development and integration
        
        2. AI & Machine Learning Solutions
          - NLP and conversational AI systems
          - Computer vision applications
          - Predictive analytics models
          - Recommendation systems
          - Large language model fine-tuning
        
        3. Automation & Workflow Optimization
          - Process automation (RPA)
          - Workflow digitization
          - Document processing
          - Business process reengineering
        
        4. Cloud Solutions & Infrastructure 
          - Cloud migration and optimization
          - Serverless architecture
          - DevOps implementation
          - Infrastructure as Code
        
        5. Data Analytics & Business Intelligence
          - Data warehouse design and implementation
          - Interactive dashboard development
          - Real-time analytics systems
          - ETL/ELT pipeline development
        
        6. Digital Experience & Customer Journey
          - UX/UI design
          - Customer portal development
          - Engagement platforms
          - User behavior analytics
        
        7. Enterprise Systems Integration
          - Legacy system modernization
          - API management
          - Middleware solutions
          - SSO and identity management
        
        8. Cybersecurity & Compliance
          - Security assessment and implementation
          - Compliance frameworks (GDPR, HIPAA, SOC2)
          - Penetration testing
          - Security monitoring and response
        
        Our approach: We don't sell pre-packaged solutions. We design custom technology solutions based on each client's unique business challenges and objectives.
        
        Keep responses professional but conversational, helpful, and concise.
        If asked about pricing, explain that it depends on project scope and suggest a consultation.
        If you don't know something specific about L&F Digital, be honest about it.
        Emphasize the full breadth of our services - we are not just an AI or automation company.
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
        As a digital transformation financial analyst, calculate a detailed ROI projection for implementing technology solutions for a business with these parameters:
        
        - Industry: ${roiRequest.industry}
        - Annual Revenue: ${roiRequest.annualRevenue}
        - Business Goal: ${roiRequest.businessGoal}
        - Team Size: ${roiRequest.teamSize} employees
        - Current Automation Level: ${roiRequest.automationLevel}
        - Implementation Timeline: ${roiRequest.implementationTimeline}
        
        L&F Digital provides a full spectrum of technology solutions, including:
        1. Custom Software Development
        2. AI & Machine Learning
        3. Automation & Workflow Optimization
        4. Cloud Solutions & Infrastructure
        5. Data Analytics & Business Intelligence
        6. Digital Experience & Customer Journey
        7. Enterprise Systems Integration
        8. Cybersecurity & Compliance
        
        Based on the business goal and parameters, determine which service categories would be most beneficial, and calculate a comprehensive ROI projection.
        
        Return your projection as JSON in this exact format:
        {
          "estimatedROI": "percentage",
          "costReduction": "dollar amount per year",
          "timelineMonths": number,
          "potentialSavings": "dollar amount per year",
          "recommendedServiceCategories": ["Category 1", "Category 2"],
          "keyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
          "implementationStages": [
            {"stage": "Planning", "duration": "X weeks", "description": "Description"},
            {"stage": "Development", "duration": "X weeks", "description": "Description"},
            {"stage": "Deployment", "duration": "X weeks", "description": "Description"},
            {"stage": "Optimization", "duration": "X weeks", "description": "Description"}
          ]
        }
        
        The projection should be realistic but impressive, with:
        - Higher ROI for businesses with low automation
        - Faster timelines for urgent implementation
        - Industry-specific insights and terminology
        - Specific technology recommendations matching the business goals
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
        
        // Enhanced fallback with more dynamic content based on the business goal
        const goalLowerCase = roiRequest.businessGoal.toLowerCase();
        
        // Determine relevant service categories based on keywords in the goal
        const recommendedCategories = [];
        if (goalLowerCase.includes('automat') || goalLowerCase.includes('workflow') || goalLowerCase.includes('process')) {
          recommendedCategories.push("Automation & Workflow Optimization");
        }
        if (goalLowerCase.includes('ai') || goalLowerCase.includes('intelligen') || goalLowerCase.includes('predict')) {
          recommendedCategories.push("AI & Machine Learning");
        }
        if (goalLowerCase.includes('data') || goalLowerCase.includes('analytic') || goalLowerCase.includes('insight')) {
          recommendedCategories.push("Data Analytics & Business Intelligence");
        }
        if (goalLowerCase.includes('cloud') || goalLowerCase.includes('infrastruct') || goalLowerCase.includes('scale')) {
          recommendedCategories.push("Cloud Solutions & Infrastructure");
        }
        if (goalLowerCase.includes('customer') || goalLowerCase.includes('experience') || goalLowerCase.includes('interface')) {
          recommendedCategories.push("Digital Experience & Customer Journey");
        }
        if (goalLowerCase.includes('integrat') || goalLowerCase.includes('connect') || goalLowerCase.includes('system')) {
          recommendedCategories.push("Enterprise Systems Integration");
        }
        if (goalLowerCase.includes('app') || goalLowerCase.includes('software') || goalLowerCase.includes('develop')) {
          recommendedCategories.push("Custom Software Development");
        }
        if (goalLowerCase.includes('secur') || goalLowerCase.includes('complian') || goalLowerCase.includes('protect')) {
          recommendedCategories.push("Cybersecurity & Compliance");
        }
        
        // If no categories matched, provide default ones
        if (recommendedCategories.length === 0) {
          recommendedCategories.push("Automation & Workflow Optimization");
          recommendedCategories.push("Data Analytics & Business Intelligence");
        }
        
        // Limit to top 3 categories
        const topCategories = recommendedCategories.slice(0, 3);
        
        // Timeline calculation
        const timelineMonths = roiRequest.implementationTimeline === "ASAP" ? 3 : 
                            roiRequest.implementationTimeline === "3-6 Months" ? 6 : 9;
        
        // Implementation stages with realistic durations
        const implementationStages = [
          {
            stage: "Planning & Discovery", 
            duration: `${Math.ceil(timelineMonths * 0.2)} weeks`,
            description: "Requirements gathering, technical assessment, and solution design"
          },
          {
            stage: "Development & Integration", 
            duration: `${Math.ceil(timelineMonths * 0.5)} weeks`,
            description: "Solution building, integration with existing systems, and initial testing"
          },
          {
            stage: "Deployment & Training", 
            duration: `${Math.ceil(timelineMonths * 0.2)} weeks`,
            description: "Implementation, user training, and handover"
          },
          {
            stage: "Optimization", 
            duration: `${Math.ceil(timelineMonths * 0.3)} weeks`,
            description: "Performance tuning, additional features, and feedback incorporation"
          }
        ];
        
        // Key benefits based on the goal and industry
        const keyBenefits = [
          `${finalROI}% ROI through improved efficiency and reduced operational costs`,
          `Reduced manual workload allowing your team to focus on strategic initiatives`,
          `Enhanced data-driven decision making with real-time insights`
        ];
        
        // Complete fallback response with all fields
        const fallbackResponse = {
          estimatedROI: `${finalROI}%`,
          costReduction: `$${(costReduction).toLocaleString()}/year`,
          timelineMonths: timelineMonths,
          potentialSavings: `$${(costReduction * 3).toLocaleString()}/year`,
          recommendedServiceCategories: topCategories,
          keyBenefits: keyBenefits,
          implementationStages: implementationStages
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