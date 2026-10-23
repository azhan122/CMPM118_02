import 'dotenv/config';
import { v7 as uuid7 } from "uuid";
import { entrypoint, MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";  
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a literary data assistant.
## Capabilities
- \`fetch_text_from_url\`: loads document text from a URL into the conversation.
Do not guess line counts or positions—ground them in tool results from the saved file.`;

const checkpointer = new MemorySaver();

const model = new ChatOpenAI({  
    model: "openrouter:z-ai/glm-5.3-flash",  
    apiKey: process.env.BAYLEAF_API_KEY,  
    configuration: { baseURL: "https://api.bayleaf.dev/v1" }, 
}); 
const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    temperature: 0,
});
const multiply = tool(
  async ({a , b}) => {
    console.log("Multiplying", a, "and", b);
    return a * b;
  },
  {
    name: "multiply",
    description: "Multiplies two numbers together.",
    schema: z.object({
      a: z.number().describe("The first number to multiply."),
      b: z.number().describe("The second number to multiply."),
    }),
  }
);

import { HumanMessage, ToolMessage , BaseMessage } from "@langchain/core/messages";

const llmWithTools = llm.bindTools([multiply]);

const messages: BaseMessage[] = [new HumanMessage("What is 12 multiplied by 8?")];
const response1 = await llmWithTools.invoke(messages);
messages.push(response1);

for (const toolCall of response1.tool_calls ?? []) {
  const result = await multiply.invoke(toolCall.args as { a: number; b: number });
  messages.push(
    new ToolMessage({
      content: JSON.stringify(result),
      tool_call_id: toolCall.id!,
    })
  );
}

const response2 = await llmWithTools.invoke(messages);
console.log("AI Response:", response2.content);

export {}; // makes this file a module so top-level await is allowed

const city = "Santa Cruz";

const url =
  "https://geocoding-api.open-meteo.com/v1/search" +
  `?name=${encodeURIComponent(city)}&count=1`;

const data = await (await fetch(url)).json();
const place = data.results[0];

console.log(`${place.name}, ${place.admin1}, ${place.country}`);
console.log(`Latitude:  ${place.latitude}`);
console.log(`Longitude: ${place.longitude}`);