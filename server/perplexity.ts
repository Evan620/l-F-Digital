import axios from 'axios';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai';

// Helper function to check if Perplexity API key is available
export function hasPerplexityCredentials(): boolean {
  return !!PERPLEXITY_API_KEY;
}

// Function to generate chat completions using Perplexity
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string; 
    jsonMode?: boolean;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  if (!hasPerplexityCredentials()) {
    throw new Error('Perplexity API key is missing');
  }

  try {
    // Default to llama-3.1-sonar-small-128k-online if no model specified
    const model = options.model || 'llama-3.1-sonar-small-128k-online';
    
    // Set up request parameters
    const requestBody: any = {
      model,
      messages,
      temperature: options.temperature || 0.2,
      max_tokens: options.maxTokens || 2048,
      stream: false,
      frequency_penalty: 1
    };

    // Add response format for JSON if needed
    if (options.jsonMode) {
      requestBody.response_format = { type: "json_object" };
    }

    // Make the API call
    const response = await axios.post(
      `${PERPLEXITY_BASE_URL}/chat/completions`, 
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response from Perplexity API');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(`Perplexity API error: ${error.response.status} - ${error.response.data.error?.message || JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error(`Perplexity API request failed: ${error.message}`);
    } else {
      throw new Error(`Perplexity API error: ${error.message}`);
    }
  }
}