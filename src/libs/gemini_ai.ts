import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINIAI_KEY);

export const gemini_flash = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
export const json_model = genAI.getGenerativeModel({model: "gemini-1.5-flash", generationConfig: {
    responseMimeType: "application/json"
  }});