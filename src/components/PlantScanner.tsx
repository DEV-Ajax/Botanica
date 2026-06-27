import { useState, useRef } from "react";
import { Upload, ImageIcon, Loader2, Leaf, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";

export default function PlantScanner({ language }: { language: string; isDark?: boolean }) {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"identify" | "diagnose">("identify");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      setImage(base64);
      setMimeType(file.type);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzePlant = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-plant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64: image, mimeType, language, mode }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }
      
      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setMimeType(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-800 overflow-hidden transition-colors">
      <div className="p-6 border-b border-emerald-50 dark:border-gray-800 bg-emerald-50/30 dark:bg-gray-800/50 flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-emerald-950 dark:text-gray-100">
            {mode === "identify" ? "Plant Identifier" : "Plant Doctor"}
          </h2>
          <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
            {mode === "identify" ? "Upload a photo to get care instructions" : "Upload a photo to diagnose issues"}
          </p>
        </div>
        <div className="ml-auto flex bg-emerald-100/50 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setMode("identify")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              mode === "identify" ? "bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-emerald-600/70 dark:text-emerald-500/70 hover:text-emerald-700 dark:hover:text-emerald-400"
            )}
          >
            Identify
          </button>
          <button
            onClick={() => setMode("diagnose")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              mode === "diagnose" ? "bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-emerald-600/70 dark:text-emerald-500/70 hover:text-emerald-700 dark:hover:text-emerald-400"
            )}
          >
            Diagnose
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square md:aspect-video rounded-xl border-2 border-dashed border-emerald-200 dark:border-gray-700 bg-emerald-50/50 dark:bg-gray-800/30 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-emerald-50 dark:hover:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors"
          >
            <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm">
              <Upload className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-emerald-900 dark:text-gray-300">Click to upload a photo</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500/70 mt-1">Supports JPG, PNG (Max 5MB)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden border border-emerald-100 dark:border-gray-700 bg-black/5 dark:bg-black/20 group">
              <img 
                src={`data:${mimeType};base64,${image}`} 
                alt="Plant to analyze" 
                className="w-full h-48 md:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={clearImage}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-emerald-900 dark:text-gray-200 rounded-lg font-medium text-sm hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Remove Photo
                </button>
              </div>
            </div>

            {!result && !loading && (
              <button
                onClick={analyzePlant}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <ImageIcon className="w-5 h-5" />
                {mode === "identify" ? "Analyze Plant" : "Diagnose Issue"}
              </button>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-emerald-600 dark:text-emerald-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium animate-pulse">Analyzing botanical details...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-900/30">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="prose prose-emerald dark:prose-invert prose-sm max-w-none prose-headings:text-emerald-900 dark:prose-headings:text-emerald-400 prose-a:text-emerald-600 dark:prose-a:text-emerald-400">
                <div className="p-6 bg-emerald-50/50 dark:bg-gray-800/50 rounded-xl border border-emerald-100 dark:border-gray-700">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
    </div>
  );
}
