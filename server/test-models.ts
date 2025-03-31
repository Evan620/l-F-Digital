import { generateChatCompletion as generateOpenRouterCompletion } from './openrouter';
import { hasOpenRouterCredentials } from './openrouter';

// Test all the models specified by the user
async function testOpenRouterModels() {
  if (!hasOpenRouterCredentials()) {
    console.log("⚠️ OpenRouter API key is not available. Please check your environment variables.");
    return;
  }

  const testPrompt = "Respond with a short JSON object with the fields: {success: true, model_name: 'your model name'}. Keep it brief.";
  const models = [
    "anthropic/claude-3.5-haiku-20241022:beta",
    "deepseek/deepseek-r1:free",
    "qwen/qwen2.5-vl-32b-instruct:free"
  ];

  console.log("🔍 TESTING OPENROUTER MODELS 🔍");
  console.log("===============================");
  
  for (const model of models) {
    console.log(`\n📝 Testing model: ${model}`);
    try {
      const response = await generateOpenRouterCompletion(
        [{ role: "user", content: testPrompt }],
        { model: model, jsonMode: true }
      );
      
      console.log(`✅ Response from ${model}:`);
      console.log(response);
      
      // Try to parse the response as JSON
      try {
        const parsedResponse = JSON.parse(response);
        console.log(`📊 Parsed response: ${JSON.stringify(parsedResponse, null, 2)}`);
      } catch (parseError: any) {
        console.log(`⚠️ Could not parse response as JSON: ${parseError.message}`);
      }
    } catch (error: any) {
      console.error(`❌ Error with ${model}: ${error.message}`);
    }
  }
  
  console.log("\n===============================");
  console.log("🏁 MODEL TESTING COMPLETE 🏁");
}

// Run the test function immediately
testOpenRouterModels().catch(err => {
  console.error("Test failed with error:", err);
});