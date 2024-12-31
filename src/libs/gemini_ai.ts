import { GoogleGenerativeAI } from "@google/generative-ai";
const test_key = 'AIzaSyAxFDZAzvq0ch32_MwYl1dnQpMMU-5fjtw';
const genAI = new GoogleGenerativeAI(test_key);

export const gemini_flash = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
export const json_model = genAI.getGenerativeModel({model: "gemini-1.5-flash", generationConfig: {
    responseMimeType: "application/json"
  }});