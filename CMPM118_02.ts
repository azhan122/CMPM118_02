import 'dotenv/config';

// Your key is now available as:
// process.env.BAYLEAF_API_KEY

import { HumanMessage } from "@langchain/core/messages";


import { ChatOpenAI } from "@langchain/openai";  

const model = new ChatOpenAI({  
    model: "openrouter:z-ai/glm-5.3-flash",  
    apiKey: process.env.BAYLEAF_API_KEY,  
    configuration: { baseURL: "https://api.bayleaf.dev/v1" }, 
}); 




const SYSTEM_PROMPT = `You are a literary data assistant.

## Capabilities

- \`fetch_text_from_url\`: loads document text from a URL into the conversation.
Do not guess line counts or positions—ground them in tool results from the saved file.`;

import { v7 as uuid7 } from "uuid";
import { entrypoint, MemorySaver } from "@langchain/langgraph";

// Initialize a checkpointer
const checkpointer = new MemorySaver();

// A reusable sub-workflow that multiplies a number
const multiply = entrypoint(
  { name: "multiply" },
  async (inputs: { a: number; b: number }) => {
    return inputs.a * inputs.b;
  }
);

// Main workflow that invokes the sub-workflow
const main = entrypoint(
  { checkpointer, name: "main" },
  async (inputs: { x: number; y: number }) => {
    const result = await multiply.invoke({ a: inputs.x, b: inputs.y });
    return { product: result };
  }
);



const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    temperature: 0,
    // Make sure to set your OpenAI API key in environment variables
    // or pass it directly: openAIApiKey: "your-api-key"
  });

  // Bind the tools to the LLM
  const llmWithTools = llm.bindTools([multiply]); // if you have more than one tool, add it to the array after multiply...

  // Example 1: Simple tool usage
  console.log("=== Example 1: Calling Multiply ===");
  const response1 = await llmWithTools.invoke([
    new HumanMessage("What is 12 multiplied by 8?")
  ]);
  
  console.log("AI Response:", response1.content);
  console.log("Tool calls:", response1.tool_calls);

// Execute the main workflow
//const config = { configurable: { thread_id: uuid7() } };
//console.log(await main.invoke({ x: 6, y: 7 }, config)); // Output: { product: 42 }
