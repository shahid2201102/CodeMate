import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });

export async function generateResult(userPrompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: userPrompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}