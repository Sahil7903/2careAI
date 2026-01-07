
import { GoogleGenAI } from "@google/genai";
import { Vitals } from "../types";

export const getHealthInsights = async (vitals: Vitals): Promise<string> => {
  // Always initialize with process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze these vitals and provide a brief (2 sentence) friendly health insight or advice for a patient:
  - Blood Pressure: ${vitals.bloodPressure || 'N/A'}
  - Sugar Level: ${vitals.sugarLevel || 'N/A'} mg/dL
  - Heart Rate: ${vitals.heartRate || 'N/A'} BPM`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // response.text is a property, not a method
    return response.text || "Vitals look within normal range. Keep it up!";
  } catch (err) {
    console.error(err);
    return "Health tracking is a great habit for longevity!";
  }
};
