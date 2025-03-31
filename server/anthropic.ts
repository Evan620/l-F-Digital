import Anthropic from '@anthropic-ai/sdk';

// Check if Anthropic API key is available
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Export function to check if credentials are available
export function hasAnthropicCredentials(): boolean {
  return !!ANTHROPIC_API_KEY;
}

// Create the Anthropic client if API key is available
export const anthropic = !!ANTHROPIC_API_KEY 
  ? new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    })
  // Mock client when no credentials are available
  : {
      messages: {
        create: async () => ({
          content: [{ 
            type: 'text', 
            text: JSON.stringify({ 
              message: "Anthropic service is not configured. Please check your API credentials." 
            }) 
          }]
        })
      }
    } as any;

// Helper function to generate chat completions using Anthropic
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  // Log the request (sanitized)
  console.log("Anthropic chat completion request:", {
    messageCount: messages.length,
    firstRole: messages[0]?.role || 'none',
    lastRole: messages[messages.length - 1]?.role || 'none',
    options: JSON.stringify(options)
  });

  if (!hasAnthropicCredentials()) {
    console.log("Anthropic API key not available, returning mock response");
    return JSON.stringify({
      message: "Anthropic AI service is currently unavailable. Please check your API credentials."
    });
  }

  try {
    // Use the claude-3-7-sonnet-20250219 model which is the latest model released after knowledge cutoff
    const model = options.model || "claude-3-7-sonnet-20250219";
    
    // Map standard role format to Anthropic format if needed
    const formattedMessages = messages.map(msg => {
      // Anthropic uses 'assistant' and 'user' roles, but not 'system'
      // If there's a system message, we'll prepend it to the first user message
      return {
        role: msg.role === 'system' ? 'user' : msg.role,
        content: msg.content
      };
    });

    const response = await anthropic.messages.create({
      model: model,
      messages: formattedMessages,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
    });

    console.log("Anthropic response received successfully");
    // Anthropic returns an array of content blocks
    return response.content[0].text || '';
  } catch (error: any) {
    // Detailed error logging
    console.error("Anthropic API error:", error instanceof Error ? error.message : String(error));
    
    // Log request error details
    if (error.response) {
      console.error("Error response data:", JSON.stringify(error.response.data));
      console.error("Error response status:", error.response.status);
    }
    
    // Return a friendly error response
    return JSON.stringify({
      message: "AI service is temporarily unavailable. Please try again later.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}