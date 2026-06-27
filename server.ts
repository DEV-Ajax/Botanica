import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON with larger limit for images
  app.use(express.json({ limit: '50mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for Plant Analysis
  app.post("/api/analyze-plant", async (req, res) => {
    try {
      const { imageBase64, mimeType, language = "English" } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Image is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: {
          parts: [
            { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } },
            { text: `Identify this plant and provide detailed care instructions including sunlight, watering, soil type, and any other specific needs. Format the output in Markdown. Please reply in the following language: ${language}.` }
          ]
        },
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Error analyzing plant:", error);
      res.status(500).json({ error: error.message || "Failed to analyze plant" });
    }
  });

  // API Route for Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message, language = "English" } = req.body;
      
      const chat = ai.chats.create({
        model: "gemini-3.1-flash-lite",
        config: {
          systemInstruction: `You are a helpful and knowledgeable gardening assistant. You give practical advice on plant care, landscaping, and identifying plant issues based on user descriptions. Keep your answers concise but informative. Use markdown to format your response. Please communicate in the following language: ${language}.`,
        },
      });

      // We need to pass previous history if any, but `ai.chats.create` with `@google/genai` 
      // doesn't have an easy initial history parameter in the config, wait, it does! 
      // Wait, actually I can just send the whole history as `contents` to generateContent, 
      // or replay the history in the chat. Let's just use `generateContent` with history + new message.
      
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({ role: turn.role, parts: [{ text: turn.text }] });
        }
      }
      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: contents,
        config: {
          systemInstruction: `You are a helpful and knowledgeable gardening assistant. You give practical advice on plant care, landscaping, and identifying plant issues based on user descriptions. Keep your answers concise but informative. Use markdown to format your response. Please communicate in the following language: ${language}.`,
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: error.message || "Failed to send message" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
