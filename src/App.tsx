/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import PlantScanner from "./components/PlantScanner";
import ChatBot from "./components/ChatBot";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "./lib/utils";

export default function App() {
  const [language, setLanguage] = useState("English");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className={cn(
      "min-h-screen p-4 md:p-8 font-sans transition-colors duration-300",
      isDark ? "bg-gray-950 text-gray-100" : "bg-emerald-50/20 text-gray-900"
    )}>
      <div className="max-w-6xl mx-auto md:h-[calc(100vh-4rem)] flex flex-col">
        <header className="mb-4 md:mb-6 shrink-0 flex items-center justify-between">
          <div>
            <h1 className={cn(
              "text-2xl md:text-3xl font-semibold tracking-tight",
              isDark ? "text-emerald-400" : "text-emerald-950"
            )}>
              Botanica
            </h1>
            <p className={cn(
              "text-sm md:text-base mt-1",
              isDark ? "text-emerald-500/80" : "text-emerald-700/80"
            )}>Your personal AI gardening assistant</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDark ? "bg-gray-800 text-emerald-400 hover:bg-gray-700" : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
              )}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={cn(
                "px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-emerald-200 text-emerald-900"
              )}
            >
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
              <option value="German">Deutsch</option>
              <option value="Italian">Italiano</option>
              <option value="Portuguese">Português</option>
              <option value="Chinese (Simplified)">简体中文</option>
              <option value="Japanese">日本語</option>
              <option value="Korean">한국어</option>
              <option value="Arabic">العربية</option>
              <option value="Hindi">हिन्दी</option>
              <option value="Bengali">বাংলা</option>
              <option value="Russian">Русский</option>
              <option value="Turkish">Türkçe</option>
              <option value="Dutch">Nederlands</option>
              <option value="Vietnamese">Tiếng Việt</option>
            </select>
          </div>
        </header>
        
        <main className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="w-full md:w-1/2 lg:w-5/12 h-[500px] md:h-full">
            <PlantScanner language={language} isDark={isDark} />
          </div>
          <div className="w-full md:w-1/2 lg:w-7/12 h-[600px] md:h-full">
            <ChatBot language={language} isDark={isDark} />
          </div>
        </main>
      </div>
    </div>
  );
}
