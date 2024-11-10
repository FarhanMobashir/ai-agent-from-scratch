import { tool } from "@langchain/core/tools";
import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";
import readline from "readline";

// Define a math tool that handles addition of multiple numbers
const additionTool = tool(
    async ({ numbers }) => {
        // If numbers is a string, parse it to an array
        if (typeof numbers === "string") {
            numbers = JSON.parse(numbers);
        }

        if (!Array.isArray(numbers) || numbers.some((num) => typeof num !== 'number')) {
            throw new Error("Invalid numbers provided");
        }

        const sum = numbers.reduce((acc, num) => acc + num, 0);
        return `The sum of ${numbers.join(", ")} is ${sum}.`;
    },
    {
        name: "addition",
        description: "Performs addition on multiple numbers",
        schema: z.object({
            numbers: z.union([z.array(z.number()), z.string()]).describe("Array of numbers to add"),
        }),
    }
);

// Define the model and bind tools
const model = new ChatOllama({
    model: "llama3.2:3b",
});

const modelWithTools = model.bindTools([additionTool]);

// Chat interface function
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function runChat() {
    rl.question("You: ", async (query) => {
        if (query.toLowerCase() === "exit") {
            rl.close();
            return;
        }

        try {
            const result = await modelWithTools.invoke(query);
            console.log("AI:", result.response);

            console.log(result)
            console.log(result.tool_calls)

            if (result.tool_calls && result.tool_calls.length > 0) {
                for (const toolCall of result.tool_calls) {
                    try {
                        if (toolCall.name === "addition") {
                            const additionResult = await additionTool.invoke({
                                numbers: typeof toolCall.args.numbers === 'string'
                                    ? JSON.parse(toolCall.args.numbers)
                                    : toolCall.args.numbers,
                            });
                            console.log("AI:", additionResult);
                        }
                    } catch (toolError) {
                        console.error(`Error invoking ${toolCall.name}:`, toolError.message || "Unknown error");
                    }
                }
            }
        } catch (error) {
            console.error("Error in chat:", error.message || error);
        }

        runChat(); // Prompt the user again after the response
    });
}

// Start the chat
console.log("Welcome to the CLI Chat! Type your question or 'exit' to quit.");
runChat();
