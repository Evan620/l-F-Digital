import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBusinessInfoSchema, insertConversationSchema, type Message } from "@shared/schema";

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
      
      // Get services to filter a relevant set based on the business challenge
      const services = await storage.getAllServices();
      
      // Return placeholder response - this is temporary until we implement a new AI service
      res.status(503).json({
        message: "Service recommendation AI temporarily unavailable",
        error: "AI services are being reconfigured. Please try again later."
      });
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
        
        L&F Digital offers a full spectrum of technology solutions across the following categories:
        
        - Automation & Workflow Optimization: Process automation, document digitization, RPA, workflow redesign, business process management
        
        - AI & Machine Learning: Predictive models, computer vision, NLP, conversational AI, recommendation systems, machine learning operations
        
        - Custom Software Development: Enterprise applications, mobile apps, web platforms, IoT solutions, microservices architecture 
        
        - Data Analytics & Business Intelligence: Data warehousing, interactive dashboards, predictive analytics, data visualization, data modeling
        
        - Cloud Solutions & Infrastructure: Cloud migration, serverless computing, containerization, infrastructure as code, DevOps implementation
        
        - Enterprise Systems Integration: API development, middleware solutions, systems consolidation, ETL pipelines, legacy system modernization
        
        - Cybersecurity & Compliance: Security assessments, compliance frameworks, attack surface reduction, incident response, security monitoring
        
        - Digital Experience & Customer Journey: UX/UI design, customer portals, engagement platforms, personalization engines, omnichannel solutions
        
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
        // Prioritize OpenRouter with DeepSeek-R1 model
        let responseContent;
        
        // Start with OpenRouter using DeepSeek-R1 model
        if (hasOpenRouterCredentials()) {
          try {
            console.log("Using OpenRouter with DeepSeek-R1 model for case study generation");
            responseContent = await generateOpenRouterCompletion([
              { role: "user", content: prompt }
            ], { 
              model: "deepseek/deepseek-r1:free",
              jsonMode: true 
            });
            console.log("OpenRouter DeepSeek response received successfully");
          } catch (deepseekError) {
            console.error("OpenRouter DeepSeek error:", deepseekError);
            
            // Try other OpenRouter models as fallbacks
            try {
              console.log("Trying OpenRouter with Claude as fallback for case study generation");
              responseContent = await generateOpenRouterCompletion([
                { role: "user", content: prompt }
              ], { 
                model: "anthropic/claude-3.5-haiku-20241022:beta",
                jsonMode: true 
              });
              console.log("OpenRouter Claude response received successfully");
            } catch (claudeError) {
              console.error("OpenRouter Claude error:", claudeError);
              
              // Try Qwen as a secondary fallback
              try {
                console.log("Trying OpenRouter with Qwen as secondary fallback for case study generation");
                responseContent = await generateOpenRouterCompletion([
                  { role: "user", content: prompt }
                ], { 
                  model: "qwen/qwen2.5-vl-32b-instruct:free",
                  jsonMode: true 
                });
                console.log("OpenRouter Qwen response received successfully");
              } catch (qwenError) {
                console.error("OpenRouter Qwen error:", qwenError);
              }
            }
          }
        }
        
        // Try Azure OpenAI as a fallback if OpenRouter fails
        if (!responseContent) {
          try {
            console.log("Trying Azure OpenAI (GPT-4o) as fallback for case study generation");
            responseContent = await createChatCompletion([
              { role: "user", content: prompt }
            ]);
            console.log("Azure OpenAI response received successfully");
          } catch (azureError) {
            console.error("Azure OpenAI error:", azureError);
          }
        }
        
        // Try Anthropic as a final fallback if available
        if (!responseContent && hasAnthropicCredentials()) {
          try {
            console.log("Trying Anthropic as final fallback for case study generation");
            responseContent = await generateAnthropicCompletion([
              { role: "user", content: prompt }
            ], {
              model: "claude-3-7-sonnet-20250219" // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
            });
            console.log("Anthropic response received successfully");
          } catch (anthropicError) {
            console.error("Anthropic error:", anthropicError);
          }
        }
        
        let parsedResponse;
        try {
          // First attempt to clean response - handle various formatting issues
          let cleanedContent = responseContent;
          
          // Remove markdown code blocks if present
          if (cleanedContent.includes("```json")) {
            cleanedContent = cleanedContent.replace(/```json\n|\n```/g, "");
          }
          
          // Remove LaTeX \boxed{} wrapper if present (from DeepSeek model)
          if (cleanedContent.includes("\\boxed{")) {
            cleanedContent = cleanedContent.replace(/\\boxed\{\s*|\s*\}/g, "");
          }
          
          // Log what we're trying to parse to help with debugging
          console.log("Attempting to parse JSON:", cleanedContent.substring(0, 100) + "...");
          
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
          
          // Return an error instead of hardcoded fallback
          res.status(500).json({
            message: "AI service error: Could not generate case study",
            error: parseError instanceof Error ? parseError.message : String(parseError)
          });
        }
      } catch (error) {
        console.error("AI service error:", error instanceof Error ? error.message : String(error));
        // Return an error instead of hardcoded fallback
        res.status(500).json({
          message: "AI service error: Could not generate case study",
          error: error instanceof Error ? error.message : String(error)
        });
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
        
        L&F Digital offers a full spectrum of technology solutions across the following categories:
        
        - Automation & Workflow Optimization
          - Process automation and workflow redesign
          - Robotic Process Automation (RPA)
          - Document digitization and processing
          - Business process management and optimization
          - Automated quality assurance and testing
        
        - AI & Machine Learning
          - Predictive analytics and forecasting models
          - Computer vision solutions
          - Natural language processing
          - Conversational AI and chatbots
          - Recommendation systems
          - Machine learning operations (MLOps)
        
        - Custom Software Development
          - Enterprise application suites
          - Mobile applications (iOS, Android, cross-platform)
          - Web platforms and portals
          - IoT solutions and embedded systems
          - Microservices architecture
          - Low-code/no-code solutions
        
        - Data Analytics & Business Intelligence
          - Data warehousing and data lakes
          - Interactive dashboards and visualization
          - Predictive analytics and forecasting
          - Data modeling and ETL/ELT pipelines
          - Real-time analytics systems
        
        - Cloud Solutions & Infrastructure
          - Cloud migration and optimization
          - Serverless computing and containerization
          - Infrastructure as Code (IaC)
          - DevOps implementation and CI/CD
          - Multi-cloud strategies
        
        - Enterprise Systems Integration
          - API development and management
          - Middleware solutions
          - Legacy system modernization
          - Systems consolidation
          - ETL pipelines
        
        - Cybersecurity & Compliance
          - Security assessments and audits
          - Compliance frameworks implementation
          - Attack surface reduction
          - Incident response planning
          - Security monitoring and remediation
        
        - Digital Experience & Customer Journey
          - UX/UI design and development
          - Customer portals and engagement platforms
          - Personalization engines
          - Omnichannel solution implementation
          - Customer journey mapping and optimization
        
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
        
        // Prioritize OpenRouter with DeepSeek-R1 model
        let responseContent;
        
        // Start with OpenRouter using DeepSeek-R1 model
        if (hasOpenRouterCredentials()) {
          try {
            console.log("Using OpenRouter with DeepSeek-R1 model for chat response");
            responseContent = await generateOpenRouterCompletion(openAIMessages, { 
              model: "deepseek/deepseek-r1:free" 
            });
            console.log("OpenRouter DeepSeek response received successfully");
          } catch (deepseekError) {
            console.error("OpenRouter DeepSeek error:", deepseekError);
            
            // Try OpenRouter with Claude as a fallback if available
            try {
              console.log("Trying OpenRouter with Claude-3.5-Haiku as fallback for chat response");
              responseContent = await generateOpenRouterCompletion(openAIMessages, { 
                model: "anthropic/claude-3.5-haiku-20241022:beta"
              });
              console.log("OpenRouter Claude response received successfully");
            } catch (claudeError) {
              console.error("OpenRouter Claude error:", claudeError);
              
              // Try Qwen as a secondary fallback
              try {
                console.log("Trying OpenRouter with Qwen as secondary fallback");
                responseContent = await generateOpenRouterCompletion(openAIMessages, { 
                  model: "qwen/qwen2.5-vl-32b-instruct:free" 
                });
                console.log("OpenRouter Qwen response received successfully");
              } catch (qwenError) {
                console.error("OpenRouter Qwen error:", qwenError);
              }
            }
          }
        }
        
        // Try Azure OpenAI if OpenRouter failed
        if (!responseContent) {
          try {
            console.log("Trying Azure OpenAI (GPT-4o) as fallback for chat response");
            responseContent = await createChatCompletion(openAIMessages, {
              response_format: undefined  // Chat doesn't need JSON format
            });
            console.log("Azure OpenAI response received successfully");
          } catch (azureError) {
            console.error("Azure OpenAI error:", azureError);
          }
        }
        
        // Try Anthropic as a final fallback if available
        if (!responseContent && hasAnthropicCredentials()) {
          try {
            console.log("Trying Anthropic as final fallback for chat response");
            responseContent = await generateAnthropicCompletion(openAIMessages, {
              model: "claude-3-7-sonnet-20250219" // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
            });
            console.log("Anthropic response received successfully");
          } catch (anthropicError) {
            console.error("Anthropic error:", anthropicError);
          }
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
        
        L&F Digital offers a full spectrum of technology solutions across the following categories:
        
        - Automation & Workflow Optimization: Process automation, document digitization, RPA, workflow redesign, business process management
        
        - AI & Machine Learning: Predictive models, computer vision, NLP, conversational AI, recommendation systems, machine learning operations
        
        - Custom Software Development: Enterprise applications, mobile apps, web platforms, IoT solutions, microservices architecture 
        
        - Data Analytics & Business Intelligence: Data warehousing, interactive dashboards, predictive analytics, data visualization, data modeling
        
        - Cloud Solutions & Infrastructure: Cloud migration, serverless computing, containerization, infrastructure as code, DevOps implementation
        
        - Enterprise Systems Integration: API development, middleware solutions, systems consolidation, ETL pipelines, legacy system modernization
        
        - Cybersecurity & Compliance: Security assessments, compliance frameworks, attack surface reduction, incident response, security monitoring
        
        - Digital Experience & Customer Journey: UX/UI design, customer portals, engagement platforms, personalization engines, omnichannel solutions
        
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
        // Prioritize OpenRouter with DeepSeek-R1 model
        let responseContent;
        
        // Start with OpenRouter using DeepSeek-R1 model
        if (hasOpenRouterCredentials()) {
          try {
            console.log("Using OpenRouter with DeepSeek-R1 model for ROI calculation");
            responseContent = await generateOpenRouterCompletion([
              { role: "user", content: prompt }
            ], { 
              model: "deepseek/deepseek-r1:free",
              jsonMode: true 
            });
            console.log("OpenRouter DeepSeek response received successfully");
          } catch (deepseekError) {
            console.error("OpenRouter DeepSeek error:", deepseekError);
            
            // Try OpenRouter with Claude as a fallback if available
            try {
              console.log("Trying OpenRouter with Claude-3.5-Haiku as fallback for ROI calculation");
              responseContent = await generateOpenRouterCompletion([
                { role: "user", content: prompt }
              ], { 
                model: "anthropic/claude-3.5-haiku-20241022:beta",
                jsonMode: true 
              });
              console.log("OpenRouter Claude response received successfully");
            } catch (claudeError) {
              console.error("OpenRouter Claude error:", claudeError);
              
              // Try Qwen as a secondary fallback
              try {
                console.log("Trying OpenRouter with Qwen as secondary fallback for ROI calculation");
                responseContent = await generateOpenRouterCompletion([
                  { role: "user", content: prompt }
                ], { 
                  model: "qwen/qwen2.5-vl-32b-instruct:free",
                  jsonMode: true 
                });
                console.log("OpenRouter Qwen response received successfully");
              } catch (qwenError) {
                console.error("OpenRouter Qwen error:", qwenError);
              }
            }
          }
        }
        
        // Try Azure OpenAI if OpenRouter failed
        if (!responseContent) {
          try {
            console.log("Trying Azure OpenAI (GPT-4o) as fallback for ROI calculation");
            responseContent = await createChatCompletion([
              { role: "user", content: prompt }
            ]);
            console.log("Azure OpenAI response received successfully");
          } catch (azureError) {
            console.error("Azure OpenAI error:", azureError);
          }
        }
        
        // Try Anthropic as a final fallback if available
        if (!responseContent && hasAnthropicCredentials()) {
          try {
            console.log("Trying Anthropic as final fallback for ROI calculation");
            responseContent = await generateAnthropicCompletion([
              { role: "user", content: prompt }
            ], {
              model: "claude-3-7-sonnet-20250219" // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
            });
            console.log("Anthropic response received successfully");
          } catch (anthropicError) {
            console.error("Anthropic error:", anthropicError);
          }
        }
        
        let parsedResponse;
        try {
          // First attempt to clean response - handle various formatting issues
          let cleanedContent = responseContent;
          
          // Remove markdown code blocks if present
          if (cleanedContent.includes("```json")) {
            cleanedContent = cleanedContent.replace(/```json\n|\n```/g, "");
          }
          
          // Remove LaTeX \boxed{} wrapper if present (from DeepSeek model)
          if (cleanedContent.includes("\\boxed{")) {
            cleanedContent = cleanedContent.replace(/\\boxed\{\s*|\s*\}/g, "");
          }
          
          // Log what we're trying to parse to help with debugging
          console.log("Attempting to parse ROI JSON:", cleanedContent.substring(0, 100) + "...");
          
          parsedResponse = JSON.parse(cleanedContent);
          
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
        
        // Return an error response instead of providing fallback data
        res.status(500).json({ 
          message: "AI service unavailable", 
          error: error instanceof Error ? error.message : "Could not generate ROI calculation" 
        });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid ROI calculation request", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}