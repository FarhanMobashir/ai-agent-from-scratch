import { zodFunction } from "openai/helpers/zod"
import { systemPrompt } from "./systemPrompt.js";
import ollama from "ollama";

export const runLLM = async ({
  model = 'llama3.2:1b',
  messages = [],
  temperature = 0.9,
  tools = []
}) => {
  const formattedTools = tools.map(zodFunction)
  // console.log(formattedTools)
  try {

    const response = await ollama.chat({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      tools: formattedTools,
      options: {
        temperature,
      },
      stream: false
    })

    return response.message

  } catch (error) {
    console.error('Error calling local LLM API:', error);
    throw error;
  }
};
