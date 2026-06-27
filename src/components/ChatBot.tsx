import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sprout } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";

type Message = {
  role: "user" | "model";
  text: string;
};

export default function ChatBot({ language }: { language: string; isDark?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hello! I'm your gardening assistant. How can I help your garden grow today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const suggestions = [
    "How often should I water my snake plant?",
    "Why are my tomato leaves turning yellow?",
    "What are the best indoor plants for low light?",
    "How do I get rid of aphids naturally?"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    setInput("");
    
    // We send previous messages EXCEPT the very first greeting (or include it, doesn't matter)
    // To save tokens, we only send the actual conversation history
    const history = messages.filter((_, i) => i !== 0);

    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ history, message: text, language }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      
      setMessages((prev) => [...prev, { role: "model", text: data.result }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "model", text: `*Error:* ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-800 overflow-hidden transition-colors">
      <div className="p-6 border-b border-emerald-50 dark:border-gray-800 bg-emerald-50/30 dark:bg-gray-800/50 flex items-center gap-3 shrink-0">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
          <Sprout className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-emerald-950 dark:text-gray-100">Gardening Assistant</h2>
          <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Ask me anything about plants</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
              msg.role === "user" ? "bg-emerald-600 text-white" : "bg-emerald-100 dark:bg-gray-800 text-emerald-700 dark:text-emerald-400"
            )}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl text-sm prose prose-emerald dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/5 dark:prose-pre:bg-white/5",
              msg.role === "user" 
                ? "bg-emerald-600 text-white prose-p:text-white prose-a:text-emerald-200" 
                : "bg-emerald-50/50 dark:bg-gray-800/50 text-emerald-950 dark:text-gray-200 border border-emerald-100 dark:border-gray-700 prose-p:text-emerald-900 dark:prose-p:text-gray-300"
            )}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
             <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-emerald-100 dark:bg-gray-800 text-emerald-700 dark:text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-300 dark:bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-emerald-300 dark:bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-emerald-300 dark:bg-emerald-600 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        
        {messages.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSend(suggestion)}
                className="text-left px-4 py-3 bg-emerald-50 dark:bg-gray-800/80 hover:bg-emerald-100 dark:hover:bg-gray-700 text-emerald-800 dark:text-emerald-300 text-sm rounded-xl border border-emerald-100 dark:border-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 border-t border-emerald-50 dark:border-gray-800 shrink-0">
        <form onSubmit={onSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about watering, pests, sunlight..."
            className="w-full pl-4 pr-12 py-3 bg-emerald-50/50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-500 text-sm text-gray-900 dark:text-gray-100 placeholder:text-emerald-600/40 dark:placeholder:text-gray-500 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
