import axios from 'axios';
import { log } from './vite';

interface HuggingFaceConfig {
  model: string;
  inputs: string;
  parameters?: Record<string, any>;
}

// Check if Hugging Face API key is available
export function hasHuggingFaceCredentials(): boolean {
  return !!process.env.HUGGINGFACE_API_KEY;
}

/**
 * Generate text using Hugging Face's Inference API
 * @param prompt The input prompt
 * @param modelId The Hugging Face model ID
 * @param options Additional options for the model
 * @returns Promise with the generated text
 */
export async function generateTextCompletion(
  prompt: string,
  modelId: string = "mistralai/Mistral-7B-Instruct-v0.2",
  options: Record<string, any> = {}
): Promise<string> {
  if (!hasHuggingFaceCredentials()) {
    throw new Error("Hugging Face API key is not available");
  }

  try {
    log(`Generating completion with Hugging Face model: ${modelId}`);
    
    const config: HuggingFaceConfig = {
      model: modelId,
      inputs: prompt,
      parameters: {
        max_length: 1000,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
        ...options
      }
    };

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${modelId}`,
      config,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        }
      }
    );

    if (response.data && response.data.generated_text) {
      return response.data.generated_text;
    } else if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].generated_text;
    }
    
    return "Could not generate a completion from the model.";
  } catch (error: any) {
    log(`Error generating Hugging Face completion: ${error.message}`);
    throw error;
  }
}

/**
 * Generate a chat completion from a conversation context
 * @param messages The array of conversation messages
 * @param modelId The Hugging Face model ID
 * @param options Additional options for the model
 * @returns Promise with the assistant's response
 */
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  modelId: string = "mistralai/Mistral-7B-Instruct-v0.2",
  options: Record<string, any> = {}
): Promise<string> {
  if (!hasHuggingFaceCredentials()) {
    throw new Error("Hugging Face API key is not available");
  }

  try {
    // Format messages into a chat-compatible prompt
    const formattedPrompt = messages.map(msg => {
      if (msg.role === "system") {
        return `<s>system\n${msg.content}</s>`;
      } else if (msg.role === "user") {
        return `<s>user\n${msg.content}</s>`;
      } else if (msg.role === "assistant") {
        return `<s>assistant\n${msg.content}</s>`;
      }
      return `<s>${msg.role}\n${msg.content}</s>`;
    }).join("\n");

    // Include final assistant prompt
    const finalPrompt = `${formattedPrompt}\n<s>assistant\n`;

    log(`Generating chat completion with Hugging Face model: ${modelId}`);
    
    const config = {
      inputs: finalPrompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        ...options
      }
    };

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${modelId}`,
      config,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        }
      }
    );

    if (response.data && response.data.generated_text) {
      // Extract just the assistant's response from the generated text
      const fullResponse = response.data.generated_text;
      const assistantResponse = fullResponse.split("<s>assistant\n")[1]?.split("</s>")[0] || fullResponse;
      return assistantResponse.trim();
    }
    
    return "Could not generate a chat response from the model.";
  } catch (error: any) {
    log(`Error generating Hugging Face chat completion: ${error.message}`);
    throw error;
  }
}

/**
 * Run text classification using Hugging Face's Inference API
 * @param text The text to classify
 * @param modelId The Hugging Face model ID for classification
 * @returns Promise with classification results
 */
export async function classifyText(
  text: string,
  modelId: string = "facebook/bart-large-mnli"
): Promise<any> {
  if (!hasHuggingFaceCredentials()) {
    throw new Error("Hugging Face API key is not available");
  }

  try {
    log(`Classifying text with Hugging Face model: ${modelId}`);
    
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        inputs: text,
        parameters: {
          candidate_labels: ["business", "technology", "finance", "healthcare", "other"]
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        }
      }
    );

    return response.data;
  } catch (error: any) {
    log(`Error classifying text with Hugging Face: ${error.message}`);
    throw error;
  }
}