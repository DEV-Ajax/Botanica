import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

// Middleware to parse JSON with larger limit for images
app.use(express.json({ limit: '50mb' }));

const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please add it to your Vercel project settings.");
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Route for Plant Analysis
app.post("/api/analyze-plant", async (req, res) => {
  try {
    const ai = getAiClient();
    const { imageBase64, mimeType, language = "English", mode = "identify" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image is required" });
    }

    let promptText = `Identify this plant and provide detailed care instructions including sunlight, watering, soil type, and any other specific needs. Format the output in Markdown. Please reply in the following language: ${language}.`;
    if (mode === "diagnose") {
      promptText = `Act as a Plant Doctor. Analyze this image of a plant and diagnose any issues, such as pests, diseases, or nutrient deficiencies. Provide a clear treatment plan to help the plant recover. Format the output in Markdown. Please reply in the following language: ${language}.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } },
          { text: promptText }
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
    const ai = getAiClient();
    const { history, message, language = "English" } = req.body;
    
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

export default app;
