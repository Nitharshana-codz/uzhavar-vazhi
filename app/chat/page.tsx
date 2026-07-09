'use client';

import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type ChatApiResponse = {
  response?: string;
  error?: string;
  suggestions?: string[];
};

const quickQuestions = [
  { en: 'How do I use this website?', ta: 'இந்த இணையதளத்தை எப்படி பயன்படுத்துவது?', text: 'How do I use the Uzhavar Vazhi website to check loans, MSP, weather, and risk?' },
  { en: 'What loans am I eligible for?', ta: 'எனக்கு தகுதியான கடன்கள் என்ன?', text: 'What loans am I eligible for if I have 2 acres of paddy in Thanjavur?' },
  { en: 'How do I claim PMFBY insurance?', ta: 'PMFBY காப்பீடு எப்படி பெறுவது?', text: 'How do I claim PMFBY crop insurance?' },
  { en: 'What is the MSP for paddy?', ta: 'நெல்லின் MSP என்ன?', text: 'What is the current MSP for paddy?' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const lastAIMessage = useMemo(() => messages.findLast?.((message) => message.role === 'assistant'), [messages]);

  async function submitQuestion(question: string) {
    if (!question.trim() || isTyping) return;
    const userMessage: Message = { role: 'user', content: question, timestamp: new Date().toLocaleTimeString() };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsTyping(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, language: lang, history: messages.map(({ role, content }) => ({ role, content })) }),
      });
      const data = (await response.json()) as ChatApiResponse;
      const fallbackMessage = lang === 'ta'
        ? 'மன்னிக்கவும், இப்போது பதில் கிடைக்கவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.'
        : 'Sorry, I could not get an answer right now. Please try again shortly.';
      const assistantMessage = data.response ?? data.error ?? fallbackMessage;
      setMessages((current) => [...current, { role: 'assistant', content: assistantMessage, timestamp: new Date().toLocaleTimeString() }]);
      setSuggestions(data.suggestions ?? []);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: lang === 'ta' ? 'மன்னிக்கவும், இணைப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.' : 'Sorry, I could not connect. Please try again.', timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitQuestion(input);
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-straw shadow-sm overflow-hidden">
            <div className="border-b border-straw px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <h1 className="font-semibold text-soil">Ask Uzhavar AI</h1>
                <p className="font-tamil text-sm text-soil/60">உழவர் AI கேளுங்கள்</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs bg-turmeric-light text-turmeric">Farmer assistant</span>
            </div>

            <div className="min-h-[440px] max-h-[60vh] overflow-y-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div>
                  <div className="rounded-xl border border-straw bg-cream p-4 mb-4">
                    <p className="text-soil">Hello! Ask about using the website, schemes, loans, MSP, documents, weather, or eligibility.</p>
                    <p className="font-tamil text-sm text-soil/60 mt-1">இணையதள பயன்பாடு, திட்டங்கள், கடன், MSP, ஆவணங்கள், வானிலை அல்லது தகுதி பற்றி கேளுங்கள்.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quickQuestions.map((question) => (
                      <button key={question.text} onClick={() => submitQuestion(question.text)} className="text-left rounded-lg border border-straw p-4 hover:border-turmeric bg-white">
                        <p className="font-medium text-soil">{question.en}</p>
                        <p className="font-tamil text-sm text-soil/60">{question.ta}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <motion.div key={`${message.timestamp}-${index}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-xl p-4 ${message.role === 'user' ? 'bg-turmeric text-white rounded-br-sm' : 'bg-cream border border-straw text-soil rounded-bl-sm'}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-soil/40'}`}>{message.timestamp}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-cream rounded-xl border border-straw p-4 flex items-center gap-2 text-soil/60">
                    <Loader2 className="w-4 h-4 animate-spin text-turmeric" /> Thinking... / சிந்திக்கிறது...
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-straw p-4">
              {lastAIMessage && suggestions.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {suggestions.map((suggestion) => <button key={suggestion} onClick={() => submitQuestion(suggestion)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm bg-straw/50 text-soil hover:bg-turmeric-light">{suggestion}</button>)}
                </div>
              )}
              <div className="flex justify-end mb-2">
                <div className="flex gap-1 bg-straw/30 rounded-full p-1">
                  <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs rounded-full ${lang === 'en' ? 'bg-turmeric text-white' : 'text-soil/60'}`}>EN</button>
                  <button onClick={() => setLang('ta')} className={`px-3 py-1 text-xs rounded-full font-tamil ${lang === 'ta' ? 'bg-turmeric text-white' : 'text-soil/60'}`}>தமிழ்</button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={lang === 'ta' ? 'உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்...' : 'Type your question...'} className="flex-1 h-12 px-4 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none" disabled={isTyping} />
                <motion.button type="submit" disabled={!input.trim() || isTyping} whileHover={{ scale: input.trim() ? 1.05 : 1 }} whileTap={{ scale: 0.95 }} className={`w-12 h-12 rounded-lg flex items-center justify-center ${input.trim() && !isTyping ? 'bg-turmeric text-white' : 'bg-straw text-soil/40 cursor-not-allowed'}`}>
                  <Send className="w-5 h-5" />
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}
