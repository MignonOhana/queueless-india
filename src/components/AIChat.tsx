"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { useCustomerQueue } from "@/lib/useCustomerQueue";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function FloatChatWidget({ orgId, tokenNumber }: { orgId: string, tokenNumber: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "init", sender: "ai", text: "Hi! Asking about your wait time? I can help!"
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const { peopleAhead, currentlyServing } = useCustomerQueue(orgId, tokenNumber);

  const sendMessage = async () => {
    if (!input.trim() || !tokenNumber) return;

    const userMsg = { id: Date.now().toString(), sender: "user" as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          tokenNumber,
          peopleAhead,
          currentlyServing,
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.response || "Something went wrong."
      }]);
    } catch {
      setMessages(prev => [...prev, { id: "err", sender: "ai", text: "Oops, AI is currently offline." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!tokenNumber) return null; // Only show if they actually joined the queue

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white shadow-xl shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Output Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 font-bold">
              <Bot size={20} />
              Queue Assistant AI
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 dark:bg-slate-950">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.sender === "user" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>
                  {m.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${m.sender === "user" ? "bg-orange-500 text-white rounded-tr-none" : "bg-white dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-75"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your queue..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
            />
            <button 
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors shrink-0"
            >
              <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
