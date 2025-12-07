import OpenAI from "openai";
import { config } from "@/config";

let openaiInstance: OpenAI | null = null

export function getOpenAI(): OpenAI {
    if(!openaiInstance) {
        openaiInstance = new OpenAI({
            apiKey: config.openai.apiKey,
        })
    }
    return openaiInstance;
}

export const openai = getOpenAI();

//Helper 
export async function createChatCompletion(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    options?: {
        model?: string
        temperature?: number
        max_tokens?: number
    }
): Promise<{content: string, tokenUsed: number}> {
    try {
        const completion = await openai.chat.completions.create({
            model: options?.model || config.openai.model,
            messages,
            temperature: options?.temperature || 0.7,
            max_tokens: options?.max_tokens || config.openai.maxTokens,
        })

        const content = completion.choices[0].message?.content || ''
        const tokenUsed = completion.usage?.total_tokens || 0

        return {content, tokenUsed}
    } catch (error) {
        console.error('OpenAI API Error:', error)

        if(error instanceof OpenAI.APIError){
            if(error.status === 429) {
                throw new Error('Layanan AI sedang sibuk. Coba lagi dalam beberapa saat')
            }
            if(error.status === 401) {
                throw new Error ('Konfigurasi AI tidak valid') 
            }
        }
        throw new Error('Gagal komunikasi dengan AI, Silahkan coba lagi')
    }
} 

//Estimate tokens
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 3);
}

//Check if message is within token limit
export function isWithinTokenLimit(
    messages: {content: string}[],
    maxTokens: number = 4800
): boolean {
    const totalEstimate = messages.reduce(
        (sum, msg) => sum + estimateTokens(msg.content),
        0
    )
    return totalEstimate < maxTokens
}