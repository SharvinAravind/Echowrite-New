
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WritingStyle, Tone, Length } from "../types";

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

export const generateToneLengthVariations = async (
  text: string,
  tone: Tone,
  length: Length,
  targetLanguage: string = 'English'
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const toneDescriptions = {
    [Tone.APPRECIATIVE]: 'grateful, thankful, and showing positive acknowledgment',
    [Tone.WARM]: 'friendly, personable, and empathetic',
    [Tone.PROFESSIONAL]: 'formal, business-appropriate, and polished',
    [Tone.RESPECTFUL]: 'courteous, considerate, and diplomatic',
    [Tone.MARKETING]: 'persuasive, engaging, and action-oriented',
    [Tone.ELABORATE]: 'detailed, comprehensive, and thorough'
  };

  const lengthGuidelines = {
    [Length.SIMPLE]: { wordRange: '20-40 words', description: '1-2 sentences, direct and concise' },
    [Length.MEDIUM]: { wordRange: '60-100 words', description: '3-5 sentences, balanced approach' },
    [Length.LONG]: { wordRange: '150-250 words', description: 'multi-paragraph, detailed version' }
  };

  const systemPrompt = `You are an elite AI writing assistant specialized in tone and length variations.

CRITICAL REQUIREMENTS:
1. Write in ${targetLanguage} language
2. Maintain ${toneDescriptions[tone]} tone throughout
3. Strictly adhere to ${lengthGuidelines[length].wordRange} (${lengthGuidelines[length].description})
4. NEVER repeat the same phrases or sentence structures
5. Each variation must be unique in vocabulary and approach
6. Provide proper grammar, spacing, and formatting for direct copy-paste use

Return a JSON object with ONE variation:
{
  "id": "unique-id",
  "label": "${tone} - ${length}",
  "suggestedText": "the refined content here",
  "tone": "${tone}",
  "length": "${length}",
  "wordCount": number,
  "changes": [{"field": "string", "reason": "string"}],
  "analysis": {
    "sentiment": "string",
    "keywords": ["word1", "word2", "word3"]
  }
}`;

  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: `Refine this text with ${tone} tone at ${length} length:\n\n"${text}"`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          suggestedText: { type: Type.STRING },
          tone: { type: Type.STRING },
          length: { type: Type.STRING },
          wordCount: { type: Type.NUMBER },
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
        required: ["id", "label", "suggestedText", "tone", "length", "wordCount"]
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

export const generateAllVariations = async (
  text: string,
  tones: Tone[],
  lengths: Length[],
  targetLanguage: string = 'English'
) => {
  const variations = [];

  for (const tone of tones) {
    for (const length of lengths) {
      try {
        const variation = await generateToneLengthVariations(text, tone, length, targetLanguage);
        variations.push(variation);
      } catch (error) {
        console.error(`Failed to generate ${tone} - ${length}:`, error);
      }
    }
  }

  return { variations };
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
