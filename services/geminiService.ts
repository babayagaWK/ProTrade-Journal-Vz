import { GoogleGenAI } from "@google/genai";
import { Trade } from '../types';
import { getApiKey } from './storageService';

export const analyzeTradeWithGemini = async (trade: Partial<Trade>): Promise<string> => {
  const apiKey = getApiKey() || process.env.API_KEY;
  
  if (!apiKey) {
    return "API Key is missing. Please set your Gemini API Key in settings.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are a professional senior trading mentor. Analyze the following trade details and provide brief, constructive feedback in 2-3 sentences. Focus on the setup and outcome.
    
    Symbol: ${trade.symbol}
    Type: ${trade.type}
    Outcome P&L: $${trade.pnl}
    Setup Strategy: ${trade.setup}
    User Notes: ${trade.notes}
    
    If the user won, congratulate them but remind them of discipline. If they lost, provide psychological support or technical advice based on the notes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service.";
  }
};