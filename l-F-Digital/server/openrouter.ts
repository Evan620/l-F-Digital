import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Helper function to check if OpenRouter API key is available
export function hasOpenRouterCredentials(): boolean {
  return !!OPENROUTER_API_KEY;
}

// Function to generate chat completions using OpenRouter
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string; 
    jsonMode?: boolean;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  // Log the request (sanitized)
  console.log("OpenRouter chat completion request:", {
    messageCount: messages.length,
    firstRole: messages[0]?.role || 'none',
    lastRole: messages[messages.length - 1]?.role || 'none',
    options: JSON.stringify(options)
  });

  if (!hasOpenRouterCredentials()) {
    console.log("OpenRouter API key not available, returning mock response");
    return JSON.stringify({
      message: "AI service is currently in offline mode. Please check your API credentials."
    });
  }

  try {
    // Default to DeepSeek model
    const model = options.model || "deepseek/deepseek-coder";
    
    // Format response for JSON if needed
    const responseFormat = options.jsonMode 
      ? { type: "json_object" } 
      : undefined;

    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: model,
        messages: messages,
        ...(responseFormat && { response_format: responseFormat }),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1024,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://lf-digital.replit.app', // Replace with your actual domain
          'X-Title': 'L&F Digital AI Website'
        }
      }
    );

    console.log("OpenRouter response received successfully");
    return response.data.choices[0].message.content || '';
  } catch (error: any) {
    // Detailed error logging
    console.error("OpenRouter API error:", error instanceof Error ? error.message : String(error));
    
    // Log request error details
    if (error.response) {
      console.error("Error response data:", JSON.stringify(error.response.data));
      console.error("Error response status:", error.response.status);
    } else if (error.request) {
      console.error("Error request sent but no response received");
    }
    
    // Return a friendly error response
    return JSON.stringify({
      message: "AI service is temporarily unavailable. Please try again later.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Function to generate AI images using OpenRouter models
export async function generateImage(
  prompt: string,
  options: {
    model?: string;
    width?: number;
    height?: number;
    numImages?: number;
  } = {}
): Promise<string[]> {
  if (!hasOpenRouterCredentials()) {
    console.log("OpenRouter API key not available, returning mock response");
    return ["https://placehold.co/512x512/png?text=AI+Image+Unavailable"];
  }

  try {
    // Default to a free tier image model
    const model = options.model || "stability/stable-diffusion-xl";
    
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/images/generations`,
      {
        model: model,
        prompt: prompt,
        n: options.numImages || 1,
        size: `${options.width || 512}x${options.height || 512}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://lf-digital.replit.app', // Replace with your actual domain
          'X-Title': 'L&F Digital AI Website'
        }
      }
    );

    return response.data.data.map((img: any) => img.url);
  } catch (error) {
    console.error("OpenRouter image generation error:", error instanceof Error ? error.message : String(error));
    return ["https://placehold.co/512x512/png?text=AI+Image+Unavailable"];
  }
}