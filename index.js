import { z } from 'zod'
import { runAgent } from './src/agent.js'

let userMessage = process.argv[2]

if (!userMessage) {
  console.error('Please provide a message')
  process.exit(1)
}

const weatherTool = {
  name: 'get_weather',
  description: `this function will only be used to get weather`,
  parameters: z.object({}),
}


const response = await runAgent({ userMessage, tools: [weatherTool] })

// console.log(response)
