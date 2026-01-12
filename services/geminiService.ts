
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WritingStyle } from "../types";

const MODEL_PRO = 'gemini-3-pro-preview';
const MODEL_FLASH = 'gemini-3-flash-preview';
const MODEL_IMAGE = 'gemini-2.5-flash-image';

export const getWritingVariations = async (text: string, style: WritingStyle) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const styleContext = {
    [WritingStyle.MEETING_NOTES]: "Organize into objective, formatted meeting notes with attendees (placeholder), discussion points, and clear headers.",
    [WritingStyle.ACTION_ITEMS]: "Extract clear, actionable tasks with checkboxes and owners from the text.",
    [WritingStyle.BLOG_DRAFT]: "Expand the input into a structured blog post draft with an engaging hook, subheadings, and a conclusion.",
  }[style] || "";

  const systemPrompt = `You are an elite AI writing assistant. 
  Generate 4 distinct variations for the goal: ${style}. ${styleContext}
  
  For each variation, perform a deep analysis including:
  1. Sentiment (Overall mood)
  2. Keywords (Top 5 technical or key terms)
  
  Return a JSON object:
  {
    "variations": [
      {
        "id": "string",
        "label": "Variation Name",
        "suggestedText": "The actual content",
        "tone": "Brief tone descriptor",
        "changes": [{"field": "string", "reason": "string"}],
        "analysis": {
          "sentiment": "Positive/Neutral/Formal etc",
          "keywords": ["word1", "word2"]
        }
      }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Process this input text and refine it based on the specified style:\n\n${text}`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          variations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                suggestedText: { type: Type.STRING },
                tone: { type: Type.STRING },
                changes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      field: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    }
                  }
                },
                analysis: {
                  type: Type.OBJECT,
                  properties: {
                    sentiment: { type: Type.STRING },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              required: ["id", "label", "suggestedText", "tone", "changes"]
            }
          }
        },
        required: ["variations"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("Neural output format mismatch.");
  }
};

export const translateText = async (text: string, targetLanguage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Translate the following text to ${targetLanguage}. Maintain tone and formatting exactly: "${text}"`,
  });
  return response.text;
};

export const rephraseText = async (text: string, lengthType: 'simple' | 'medium' | 'long') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompts = {
    simple: "Make it extremely concise and plain. Remove any fluff.",
    medium: "Keep it professional, balanced, and clear.",
    long: "Elaborate extensively with illustrative details and supporting points."
  };
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `${prompts[lengthType]}\n\nText: "${text}"`,
  });
  return response.text;
};

export const generateVisualContent = async (text: string, count: number = 3, editPrompt?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const results: string[] = [];
  const basePrompts = [
    `Infographic diagram for: ${text}. Business logic style, 4K, clean aesthetic.`,
    `Mind map for: ${text}. Professional digital art, high contrast.`,
    `Conceptual 3D flow visualization for: ${text}. Glassmorphism style.`
  ];

  for (let i = 0; i < count; i++) {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: { parts: [{ text: editPrompt || basePrompts[i] }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        results.push(`data:image/png;base64,${part.inlineData.data}`);
        break;
      }
    }
  }
  return results;
};

export const createLiveSession = (callbacks: {
  onopen: () => void;
  onmessage: (message: any) => void;
  onerror: (e: any) => void;
  onclose: (e: any) => void;
}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: callbacks.onopen,
      onmessage: callbacks.onmessage,
      onerror: callbacks.onerror,
      onclose: callbacks.onclose,
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: 'You are an elite writing assistant named Echo. Brainstorm wording and clarify ideas with the user through spoken voice conversation. Be concise and professional.',
    },
  });
};
