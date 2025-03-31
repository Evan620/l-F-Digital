import axios from 'axios';
import { generateOpenRouterCompletion } from './openrouter';

// This script tests the Qwen model on OpenRouter
async function testQwenModel() {
  try {
    console.log("Testing Qwen model on OpenRouter...");
    
    const prompt = `
      Generate a realistic case study based on this query: "Manufacturing automation for a mid-sized automotive parts manufacturer"
      
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
    
    // Test direct API call to Qwen model via OpenRouter
    const qwenResponse = await generateOpenRouterCompletion([
      { role: "user", content: prompt }
    ], { 
      model: "qwen/qwen2.5-vl-32b-instruct:free",
      jsonMode: true 
    });
    
    console.log("Qwen model response received");
    
    // Attempt to parse the response
    let cleanedContent = qwenResponse;
    
    // Remove markdown code blocks if present
    if (cleanedContent.includes("```json")) {
      cleanedContent = cleanedContent.replace(/```json\n|\n```/g, "");
    }
    
    // Remove LaTeX \boxed{} wrapper if present (from DeepSeek model)
    if (cleanedContent.includes("\\boxed{")) {
      cleanedContent = cleanedContent.replace(/\\boxed\{\s*|\s*\}/g, "");
    }
    
    console.log("Cleaned JSON:\n", cleanedContent.substring(0, 200) + "...");
    
    const parsedResponse = JSON.parse(cleanedContent);
    console.log("Successfully parsed JSON");
    
    // Print key info from the case study
    if (parsedResponse.caseStudy) {
      const cs = parsedResponse.caseStudy;
      console.log(`\nCase Study Title: ${cs.title}`);
      console.log(`Industry: ${cs.industry}`);
      console.log(`Primary Service: ${cs.primaryServiceCategory}`);
      console.log(`Technologies: ${cs.technologiesUsed.join(", ")}`);
      console.log("Metrics:", cs.metrics);
    } else {
      console.log("No case study found in response:", parsedResponse);
    }
    
  } catch (error) {
    console.error("Error testing Qwen model:", error instanceof Error ? error.message : String(error));
  }
}

// Run the test
testQwenModel().then(() => {
  console.log("Test completed");
}).catch(err => {
  console.error("Test failed:", err);
});