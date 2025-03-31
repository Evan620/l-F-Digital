import OpenAI from "openai";
import axios from 'axios';

// Azure OpenAI configuration
const azureOpenAIApiKey = process.env.AZURE_OPENAI_API_KEY;
const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureOpenAIDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

// Check if Azure OpenAI credentials are available
const useAzure = !!(azureOpenAIApiKey && azureOpenAIEndpoint && azureOpenAIDeploymentName);

// Check if using the models.inference.ai.azure.com endpoint
const isModelInferenceEndpoint = azureOpenAIEndpoint?.includes('models.inference.ai.azure.com');

// Configure OpenAI client - using standard config for both (we'll handle inference endpoint specially in the helper function)
export const openai = new OpenAI({ 
  apiKey: useAzure ? azureOpenAIApiKey : (process.env.OPENAI_API_KEY || 'dummy-key-for-dev'),
  baseURL: useAzure && !isModelInferenceEndpoint 
    ? `${azureOpenAIEndpoint}/openai/deployments/${azureOpenAIDeploymentName}` 
    : undefined,
  defaultQuery: useAzure && !isModelInferenceEndpoint 
    ? { "api-version": "2023-12-01-preview" } 
    : undefined,
  defaultHeaders: useAzure && !isModelInferenceEndpoint 
    ? { "api-key": azureOpenAIApiKey } 
    : undefined
});

// Helper function to make chat completion requests
export async function createChatCompletion(messages: Array<{ role: string; content: string }>, options: any = {}) {
  try {
    // For models.inference.ai.azure.com endpoint, use direct axios calls
    if (useAzure && isModelInferenceEndpoint) {
      console.log("Using models.inference.ai.azure.com endpoint with direct axios call");
      
      const requestOptions = {
        model: azureOpenAIDeploymentName || "gpt-4o",
        messages: messages,
        ...(options.response_format !== undefined ? { response_format: options.response_format } : { response_format: { type: "json_object" } }),
        ...options
      };
      
      // Log request configuration (sanitized)
      console.log("Request configuration:", {
        ...requestOptions,
        messages: `[${requestOptions.messages.length} messages]` // Don't log full message content
      });
      
      try {
        // Try direct axios call to the inference endpoint
        const response = await axios.post(
          azureOpenAIEndpoint + '/v1/chat/completions', 
          requestOptions,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${azureOpenAIApiKey}`
            }
          }
        );
        
        return response.data.choices[0].message.content || '';
      } catch (axiosError) {
        console.error("Axios API error:", axiosError.response?.data || axiosError.message);
        
        // If direct call fails, try standard OpenAI client as fallback
        console.log("Falling back to standard OpenAI client");
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // Use a standard model as fallback
          messages: messages,
          response_format: { type: "json_object" },
          ...options
        });
        
        return response.choices[0].message.content || '';
      }
    } else if (useAzure) {
      // Standard Azure OpenAI
      const response = await openai.chat.completions.create({
        model: azureOpenAIDeploymentName, // Use deployment name as model for Azure
        messages: messages,
        response_format: { type: "json_object" },
        ...options
      });
      
      return response.choices[0].message.content || '';
    } else {
      // Standard OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        response_format: { type: "json_object" },
        ...options
      });
      
      return response.choices[0].message.content || '';
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}