import OpenAI from "openai";
import axios from 'axios';

// Azure OpenAI configuration
const azureOpenAIApiKey = process.env.AZURE_OPENAI_API_KEY;
const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureOpenAIDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

// Check if Azure OpenAI credentials are available
const azureCredentialsAvailable = !!(azureOpenAIApiKey && azureOpenAIEndpoint && azureOpenAIDeploymentName);

// Check if using the models.inference.ai.azure.com endpoint
const isModelInferenceEndpoint = azureOpenAIEndpoint?.includes('models.inference.ai.azure.com');

// Configure OpenAI client - Azure OpenAI only, no standard OpenAI fallback
export const openai = new OpenAI({ 
  // Don't provide any API key if using models.inference.ai.azure.com
  // This prevents using a local OPENAI_API_KEY env var by accident
  apiKey: isModelInferenceEndpoint ? 'USING-DIRECT-AXIOS-FOR-AZURE-INFERENCE' : azureOpenAIApiKey,
  baseURL: !isModelInferenceEndpoint && azureOpenAIEndpoint 
    ? `${azureOpenAIEndpoint}/openai/deployments/${azureOpenAIDeploymentName}` 
    : undefined,
  defaultQuery: !isModelInferenceEndpoint && azureOpenAIEndpoint 
    ? { "api-version": "2023-12-01-preview" } 
    : undefined,
  defaultHeaders: !isModelInferenceEndpoint && azureOpenAIEndpoint 
    ? { "api-key": azureOpenAIApiKey } 
    : undefined
});

// Helper function to make chat completion requests - Azure OpenAI only
export async function createChatCompletion(messages: Array<{ role: string; content: string }>, options: any = {}) {
  // Enhanced logging
  console.log("createChatCompletion called with options:", JSON.stringify({
    messageCount: messages.length,
    firstRole: messages[0]?.role || 'none',
    lastRole: messages[messages.length - 1]?.role || 'none',
    options: Object.keys(options || {})
  }));
  
  // Log credential status
  console.log("Azure OpenAI credentials status:", {
    keyAvailable: !!azureOpenAIApiKey,
    endpointAvailable: !!azureOpenAIEndpoint,
    deploymentNameAvailable: !!azureOpenAIDeploymentName,
    isInferenceEndpoint: isModelInferenceEndpoint
  });
  
  // If Azure credentials are not available, return a friendly message
  if (!azureCredentialsAvailable) {
    console.log("Azure OpenAI credentials not available, returning mock response");
    return JSON.stringify({ 
      message: "AI service is currently in offline mode. Please check your Azure OpenAI credentials."
    });
  }

  try {
    // For models.inference.ai.azure.com endpoint, use direct axios calls
    if (isModelInferenceEndpoint) {
      console.log("Using models.inference.ai.azure.com endpoint with direct axios call");
      
      const requestOptions = {
        model: azureOpenAIDeploymentName,
        messages: messages,
        ...(options.response_format !== undefined ? { response_format: options.response_format } : { response_format: { type: "json_object" } }),
        ...options
      };
      
      // Log request configuration (sanitized)
      console.log("Request configuration:", {
        endpoint: azureOpenAIEndpoint,
        model: azureOpenAIDeploymentName,
        messageCount: messages.length,
        hasResponseFormat: !!options.response_format
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
        
        console.log("Azure OpenAI response received successfully");
        return response.data.choices[0].message.content || '';
      } catch (error: any) {
        // Detailed error logging
        console.error("Azure OpenAI API error (inference endpoint):", error instanceof Error ? error.message : String(error));
        
        // Log request error information
        if (error.response) {
          // The request was made and the server responded with a status code outside of 2xx
          console.error("Error response data:", JSON.stringify(error.response.data));
          console.error("Error response status:", error.response.status);
          console.error("Error response headers:", JSON.stringify(error.response.headers));
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Error request sent but no response received");
        }
        
        // Return a friendly error response with more details
        return JSON.stringify({
          message: "AI service is temporarily unavailable. Our team is investigating the issue.",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } else {
      // Standard Azure OpenAI
      console.log("Using standard Azure OpenAI endpoint");
      try {
        const response = await openai.chat.completions.create({
          model: azureOpenAIDeploymentName, // Use deployment name as model for Azure
          messages: messages,
          ...(options.response_format !== undefined ? { response_format: options.response_format } : { response_format: { type: "json_object" } }),
          ...options
        });
        
        console.log("Standard Azure OpenAI response received successfully");
        return response.choices[0].message.content || '';
      } catch (error: any) {
        // Detailed error logging for standard Azure OpenAI
        console.error("Azure OpenAI API error (standard endpoint):", error instanceof Error ? error.message : String(error));
        
        if (error.response) {
          console.error("Error details:", JSON.stringify(error.response || {}));
        }
        
        // Return a friendly error response with more details
        return JSON.stringify({
          message: "AI service is temporarily unavailable. Our team is investigating the issue.",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  } catch (error) {
    console.error("Overall OpenAI API error:", error instanceof Error ? error.message : String(error));
    
    // Return a friendly error response
    return JSON.stringify({
      message: "AI service is temporarily unavailable due to an unexpected error.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}