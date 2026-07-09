'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ChatApiResponse = {
  response: string;
  suggestions?: string[];
};

const quickQuestions = [
  { en: 'What loans am I eligible for?', ta: 'என் தகுதியான கடன்கள் என்ன?' },
  { en: 'How do I claim PMFBY insurance?', ta: 'PMFBY காப்பீடு எப்படி பெறுவது?' },
  { en: 'What is the MSP for paddy?', ta: 'நெல்லின் MSP என்ன?' },
  { en: 'How to apply for KCC loan?', ta: 'KCC கடன் எப்படி விண்ணப்பிப்பது?' },
];

function formatTime(timestamp: Date) {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function submitQuestion(message: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date(),
    };

    const history = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setSuggestions([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMessage,
          language,
          history,
        }),
      });

      const data = (await response.json()) as Partial<ChatApiResponse>;

      if (!response.ok || typeof data.response !== 'string') {
        throw new Error(data.response ?? 'Chat API request failed');
      }

      const aiResponse = data.response;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
        },
      ]);
      setSuggestions(data.suggestions ?? []);
    } catch (error) {
      console.error('Chat API error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, I could not connect. Please try again. / மன்னிக்கவும், இணைப்பு தோல்வியடைந்தது.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSend() {
    submitQuestion(inputMessage);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSend();
  }

  function handleQuickQuestion(question: string) {
    submitQuestion(question);
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="mx-auto flex h-[calc(100vh-11rem)] max-w-4xl flex-col overflow-hidden rounded-xl border border-straw bg-cream shadow-sm">
          <div className="bg-paddy text-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold">Ask Uzhavar AI</h1>
                <p className="font-tamil text-paddy-light text-sm">உழவர் AI கேளுங்கள்</p>
                <p className="text-white/70 text-xs mt-1">
                  Ask anything about loans, insurance, crop prices or farming
                </p>
              </div>
              <div className="flex gap-1 rounded-full bg-white/15 p-1">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    language === 'en' ? 'bg-white text-paddy' : 'text-white/80 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ta')}
                  className={`rounded-full px-3 py-1 text-xs font-tamil transition-colors ${
                    language === 'ta' ? 'bg-white text-paddy' : 'text-white/80 hover:text-white'
                  }`}
                >
                  தமிழ்
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="bg-white border border-straw rounded-xl p-4 max-w-sm">
                  <p className="text-soil text-sm">
                    வணக்கம்! நான் உழவர் Vazhi AI. உங்கள் விவசாய கேள்விகளுக்கு நான்
                    உதவுகிறேன்.
                  </p>
                  <p className="text-soil/70 text-sm mt-1">
                    Hello! I am Uzhavar Vazhi AI. Ask me anything about farming schemes,
                    loans, or crop prices.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q.en}
                      type="button"
                      onClick={() => handleQuickQuestion(q.en)}
                      className="px-3 py-2 rounded-full border border-straw bg-white text-soil text-xs hover:bg-turmeric-light hover:border-turmeric transition-colors"
                    >
                      {q.en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.timestamp.toISOString()}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-turmeric text-white'
                        : 'bg-white border border-straw text-soil'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                    <p
                      className={`mt-2 text-xs ${
                        message.role === 'user' ? 'text-white/70' : 'text-soil/50'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 px-4 py-3 bg-white rounded-xl border border-straw w-fit">
                    <span
                      className="w-2 h-2 bg-paddy rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-paddy rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-paddy rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div ref={messagesEndRef} />
          </div>

          {suggestions.length > 0 && (
            <div className="border-t border-straw bg-white px-4 py-3">
              <div className="flex gap-2 overflow-x-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleQuickQuestion(suggestion)}
                    className="flex-shrink-0 rounded-full border border-straw bg-cream px-3 py-1.5 text-xs text-soil transition-colors hover:border-turmeric hover:bg-turmeric-light"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-t border-straw bg-white p-4 flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your question... / உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்"
              className="flex-1 rounded-lg border border-straw px-4 py-3 text-sm text-soil focus:outline-none focus:ring-2 focus:ring-turmeric/30"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="inline-flex items-center gap-2 px-4 py-3 bg-turmeric text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-turmeric/90 transition-colors"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
