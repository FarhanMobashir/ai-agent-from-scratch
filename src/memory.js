import { JSONFilePreset } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'

const addMetadata = (message) => ({
    ...message,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
})

const removeMetadata = (message) => {
    const { id, createdAt, ...messageWithoutMetadata } = message
    return messageWithoutMetadata
}

const defaultData = { messages: [] }

export const getDb = async () => {
    const db = await JSONFilePreset('db.json', defaultData)
    return db
}

export const addMessages = async (messages) => {
    const db = await getDb()

    db.data.messages.push(...messages.map(addMetadata))
    await db.write()
}

export const getMessages = async () => {
    const db = await getDb()
    return db.data.messages.map(removeMetadata)
}

export const saveToolResponse = async (
    toolResponse
) => {
    return await addMessages([
        { role: 'tool', content: toolResponse },
    ])
}
