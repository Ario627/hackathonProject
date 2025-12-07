'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { chatApi } from '@/lib/api-client'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  isStreaming?: boolean
}

export function useChat(businessId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Load chat history
  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await chatApi.history()
      setMessages(response.data.messages)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error. message || 'Gagal memuat riwayat chat')
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadHistory()
  }, [loadHistory])
  
  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (! content.trim() || isSending) return
      
      setIsSending(true)
      setError(null)
      
      // Add user message optimistically
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }
      
      // Add loading message for AI
      const tempAiMessage: ChatMessage = {
        id: `temp-ai-${Date.now()}`,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        isStreaming: true,
      }
      
      setMessages((prev) => [...prev, tempUserMessage, tempAiMessage])
      
      try {
        const response = await chatApi.send(content, businessId)
        
        // Replace temp messages with real ones
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === tempAiMessage.id) {
              return {
                ...msg,
                content: response.data.message,
                isStreaming: false,
              }
            }
            return msg
          })
        )
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error.message || 'Gagal mengirim pesan')
        
        // Remove failed messages
        setMessages((prev) =>
          prev.filter(
            (msg) => msg.id !== tempUserMessage.id && msg.id !== tempAiMessage.id
          )
        )
      } finally {
        setIsSending(false)
      }
    },
    [businessId, isSending]
  )
  
  // Clear chat
  const clearChat = useCallback(async () => {
    try {
      await chatApi.clear()
      setMessages([])
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Gagal menghapus chat')
    }
  }, [])
  
  // Cancel ongoing request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current. abort()
      abortControllerRef. current = null
      setIsSending(false)
    }
  }, [])
  
  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    clearChat,
    cancel,
    loadHistory,
  }
}