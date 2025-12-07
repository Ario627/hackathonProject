'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@/hooks/useChat'
import { useBusinessList } from '@/hooks/useBusiness'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { useToastContext } from '@/providers/ToastProvider'

export default function ChatPage() {
  const [businessId, setBusinessId] = useState<string | undefined>()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { businesses, isLoading: loadingBiz } = useBusinessList()
  const { messages, isLoading, isSending, error, sendMessage, clearChat } = useChat(businessId)
  const { error: toastError } = useToastContext()

  useEffect(() => {
    if (error) toastError(error)
  }, [error, toastError])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    await sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Konsultasi AI</h1>
          <p className="text-gray-500">Pilih bisnis (opsional) agar saran lebih personal.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={businessId || ''}
            onChange={(e) => setBusinessId(e.target.value || undefined)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Tanpa konteks bisnis</option>
            {loadingBiz ? (
              <option>Memuat...</option>
            ) : (
              businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nama_usaha}
                </option>
              ))
            )}
          </select>
          <Button variant="ghost" onClick={clearChat} disabled={isLoading || isSending}>
            Bersihkan
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loading text="Memuat riwayat..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">Belum ada chat. Mulai tanya apa saja seputar bisnismu.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
              <p className="text-sm whitespace-pre-line">{m.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Tulis pertanyaanmu tentang bisnis..."
            className="w-full border-none focus:ring-0 resize-none text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">Tekan Enter untuk kirim, Shift+Enter untuk baris baru.</p>
            <Button onClick={handleSend} isLoading={isSending}>
              Kirim
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}