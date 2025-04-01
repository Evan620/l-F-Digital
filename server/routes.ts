import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBusinessInfoSchema, insertConversationSchema, type Message } from "@shared/schema";
import { createChatCompletion } from "./openai";
import { googleCalendar, hasGoogleCalendarCredentials } from "./googleCalendar";
import { generateChatCompletion as openrouterGenerateChatCompletion, hasOpenRouterCredentials } from "./openrouter";

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
      
      const prompt = `
        Based on this business challenge: "${businessChallenge}"
        
        Recommend the most appropriate services from L&F Digital's offerings to address this challenge.
        L&F Digital offers a full spectrum of technology solutions across the following categories:
        
        - Automation & Workflow Optimization: Process automation, document digitization, RPA, workflow redesign, business process management
        
        - AI & Machine Learning: Predictive models, computer vision, NLP, conversational AI, recommendation systems, machine learning operations
        
        - Custom Software Development: Enterprise applications, mobile apps, web platforms, IoT solutions, microservices architecture 
        
        - Data Analytics & Business Intelligence: Data warehousing, interactive dashboards, predictive analytics, data visualization, data modeling
        
        - Cloud Solutions & Infrastructure: Cloud migration, serverless computing, containerization, infrastructure as code, DevOps implementation
        
        - Enterprise Systems Integration: API development, middleware solutions, systems consolidation, ETL pipelines, legacy system modernization
        
        - Cybersecurity & Compliance: Security assessments, compliance frameworks, attack surface reduction, incident response, security monitoring
        
        - Digital Experience & Customer Journey: UX/UI design, customer portals, engagement platforms, personalization engines, omnichannel solutions
        
        Return a JSON response with three service recommendations from our catalog that would best address the business challenge. Format your response as follows:
        {
          "serviceSuggestions": [
            {
              "id": 1, 
              "name": "Service Name",
              "description": "Detailed service description",
              "category": "Category from the list above",
              "features": ["Feature 1", "Feature 2", "Feature 3"],
              "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
              "timeline": "Estimated implementation timeline",
              "maturityLevel": "Established"
            },
            {second suggestion with same structure},
            {third suggestion with same structure}
          ]
        }

        Each suggestion should be comprehensive, tailored to the specific business challenge, and match one of our existing service categories. Be specific with the service name and provide a detailed, compelling description.
      `;
      
      let responseContent: string | null = null;
      
      try {
        // Use OpenRouter for AI service
        if (hasOpenRouterCredentials()) {
          try {
            console.log("Using OpenRouter with Mistral model for service recommendations");
            responseContent = await openrouterGenerateChatCompletion(
              [{ role: "user", content: prompt }],
              { jsonMode: true, maxTokens: 1500 }
            );
            console.log("Successfully generated service recommendations with OpenRouter");
          } catch (openrouterError) {
            console.error("OpenRouter service failed:", openrouterError);
            throw openrouterError;
          }
        } else {
          console.log("No OpenRouter credentials available");
          throw new Error("OpenRouter API key is not available");
        }
        
        if (!responseContent) {
          throw new Error("No response received from any AI service");
        }
        
        let parsedResponse;
        try {
          // First attempt to clean response - handle various formatting issues
          let cleanedContent = responseContent;
          
          // Remove markdown code blocks if present
          if (cleanedContent.includes("```json")) {
            cleanedContent = cleanedContent.replace(/```json\n|\n```/g, "");
          }
          
          // Log what we're trying to parse to help with debugging
          console.log("Attempting to parse service recommendation JSON:", cleanedContent.substring(0, 100) + "...");
          
          parsedResponse = JSON.parse(cleanedContent);
          
          // Check if we got an error message instead of recommendations
          if (parsedResponse.message && !parsedResponse.serviceSuggestions) {
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
          error: error instanceof Error ? error.message : "Could not generate service recommendations" 
        });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid service recommendation request", error });
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
      
      let responseContent: string | null = null;
      
      try {
        // Use OpenRouter for AI service
        if (hasOpenRouterCredentials()) {
          try {
            console.log("Using OpenRouter with Mistral model for case study generation");
            responseContent = await openrouterGenerateChatCompletion(
              [{ role: "user", content: prompt }],
              { jsonMode: true, maxTokens: 1500 }
            );
            console.log("Successfully generated case study with OpenRouter");
          } catch (openrouterError) {
            console.error("OpenRouter service failed:", openrouterError);
            throw openrouterError;
          }
        } else {
          console.log("No OpenRouter credentials available");
          throw new Error("OpenRouter API key is not available");
        }
        
        if (!responseContent) {
          throw new Error("No response received from any AI service");
        }
        
        let parsedResponse;
        try {
          // First attempt to clean response - handle various formatting issues
          let cleanedContent = responseContent;
          
          // Remove markdown code blocks if present
          if (cleanedContent.includes("```json")) {
            cleanedContent = cleanedContent.replace(/```json\n|\n```/g, "");
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
      
      // Use Azure OpenAI to generate a response
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
        const formattedMessages = [
          { role: "system" as const, content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ];
        
        let responseContent: string | null = null;
        
        // Use OpenRouter for AI chat service
        if (hasOpenRouterCredentials()) {
          try {
            console.log("Using OpenRouter with Mistral model for chat response");
            responseContent = await openrouterGenerateChatCompletion(
              formattedMessages,
              { jsonMode: false, maxTokens: 800 }
            );
            console.log("Successfully generated chat response with OpenRouter");
          } catch (openrouterError) {
            console.error("OpenRouter service failed:", openrouterError);
            throw openrouterError;
          }
        } else {
          console.log("No OpenRouter credentials available");
          throw new Error("OpenRouter API key is not available");
        }
        
        if (!responseContent) {
          throw new Error("No response received from any AI service");
        }
        
        // Add assistant message
        const assistantMessage: Message = {
          role: "assistant",
          content: responseContent,
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
      
      // Use Azure OpenAI to generate a realistic ROI projection
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
      
      let responseContent: string | null = null;
      
      try {
        // Use OpenRouter for AI service
        if (hasOpenRouterCredentials()) {
          try {
            console.log("Using OpenRouter with Mistral model for ROI calculation");
            responseContent = await openrouterGenerateChatCompletion(
              [{ role: "user", content: prompt }],
              { jsonMode: true, maxTokens: 1500 }
            );
            console.log("Successfully generated ROI with OpenRouter");
          } catch (openrouterError) {
            console.error("OpenRouter service failed:", openrouterError);
            throw openrouterError;
          }
        } else {
          console.log("No OpenRouter credentials available");
          throw new Error("OpenRouter API key is not available");
        }
        
        if (!responseContent) {
          throw new Error("No response received from any AI service");
        }
        
        let parsedResponse;
        try {
          // First attempt to clean response - handle various formatting issues
          let cleanedContent = responseContent;
          
          // Remove markdown code blocks if present
          if (cleanedContent.includes("```json")) {
            cleanedContent = cleanedContent.replace(/```json\n|\n```/g, "");
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

  // Google Calendar Integration endpoints
  app.get("/api/calendar/status", async (_req: Request, res: Response) => {
    const isConfigured = hasGoogleCalendarCredentials();
    res.json({ 
      isConfigured,
      message: isConfigured ? 
        "Google Calendar integration is available." : 
        "Google Calendar integration is not configured. Contact the administrator to set up the integration."
    });
  });

  app.get("/api/calendar/available-dates", async (_req: Request, res: Response) => {
    try {
      const dates = googleCalendar.getAvailableDates();
      res.json({ dates });
    } catch (error) {
      console.error("Error getting available dates:", error);
      res.status(500).json({ 
        message: "Failed to retrieve available dates", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/calendar/available-slots/:date", async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
      
      if (!dateRegex.test(date)) {
        return res.status(400).json({ message: "Invalid date format. Please use YYYY-MM-DD." });
      }
      
      const availableSlots = await googleCalendar.getAvailableTimeSlots(date);
      res.json(availableSlots);
    } catch (error) {
      console.error("Error getting available time slots:", error);
      res.status(500).json({ 
        message: "Failed to retrieve available time slots", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/calendar/book", async (req: Request, res: Response) => {
    try {
      const bookingSchema = z.object({
        fullName: z.string().min(2).max(100),
        email: z.string().email(),
        phone: z.string().optional(),
        companyName: z.string().min(1).max(100),
        businessDescription: z.string().optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
        time: z.string(), // e.g., "09:00 AM"
        serviceType: z.string().optional().default("Business Consultation")
      });
      
      const bookingData = bookingSchema.parse(req.body);
      
      // Convert time (e.g., "09:00 AM") to 24-hour format for the Google Calendar API
      let [hours, minutes] = bookingData.time.split(':');
      minutes = minutes.split(' ')[0]; // Remove AM/PM
      const period = bookingData.time.includes('PM') ? 'PM' : 'AM';
      
      // Convert to 24-hour format
      let hour24 = parseInt(hours);
      if (period === 'PM' && hour24 < 12) hour24 += 12;
      if (period === 'AM' && hour24 === 12) hour24 = 0;
      
      // Format for API
      const startDateTime = `${bookingData.date}T${hour24.toString().padStart(2, '0')}:${minutes}:00`;
      
      // End time is 1 hour later
      let endHour24 = hour24 + 1;
      if (endHour24 === 24) endHour24 = 0; // Handle edge case
      
      const endDateTime = `${bookingData.date}T${endHour24.toString().padStart(2, '0')}:${minutes}:00`;
      
      // Create event in Google Calendar
      const eventData = {
        summary: `${bookingData.serviceType} with ${bookingData.fullName}`,
        description: `Company: ${bookingData.companyName}\nEmail: ${bookingData.email}\nPhone: ${bookingData.phone || 'Not provided'}\n\n${bookingData.businessDescription || ''}`,
        startDateTime,
        endDateTime,
        attendees: [
          { email: bookingData.email },
          { email: 'consultant@lf-digital.com' } // The consultant's email
        ]
      };
      
      if (hasGoogleCalendarCredentials()) {
        // If Google Calendar is configured, create the event
        const result = await googleCalendar.createEvent(eventData);
        
        // Send notification email
        try {
          await sendBookingNotification(bookingData);
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
        }
        
        res.json(result);
      } else {
        // If not configured, return a simulated successful booking
        console.log("Google Calendar not configured. Simulating successful booking:", eventData);
        
        // Still send notification email
        try {
          await sendBookingNotification(bookingData);
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
        }
        
        res.json({
          success: true,
          message: "Consultation scheduled successfully (Google Calendar integration not available)",
          booking: {
            name: bookingData.fullName,
            email: bookingData.email,
            date: bookingData.date,
            time: bookingData.time,
            serviceType: bookingData.serviceType
          }
        });
      }
    } catch (error) {
      console.error("Error booking consultation:", error);
      res.status(500).json({ 
        message: "Failed to book consultation", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}