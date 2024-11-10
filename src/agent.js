import { runLLM } from './llm.js'
import { addMessages, getMessages, saveToolResponse } from './memory.js'
import { runTool } from './toolRunner.js'
import { logMessage, showLoader } from './ui.js'

export const runAgent = async ({ userMessage, tools }) => {
    await addMessages([
        {
            role: 'user',
            content: userMessage,
        },
    ])

    const loader = showLoader('Thinking...')

    while (true) {
        const history = await getMessages()
        const response = await runLLM({
            messages: history,
            tools,
        })

        await addMessages([response])

        if (response.content && !response.tool_calls) {
            logMessage(response)
            loader.stop();
            return getMessages()
        }

        if (response.tool_calls && response.tool_calls.length > 0) {
            const tool_call = response.tool_calls[0];
            // console.log(tool_call)

            loader.update(`Executing: ${tool_call.function.name}`);

            const resp = await runTool(tool_call, userMessage);
            await saveToolResponse(resp)
            loader.update(`done: ${tool_call.function.name}`)

        }
        loader.stop()
        return getMessages()
    }

}
