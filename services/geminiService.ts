

import { GoogleGenAI, Chat, HarmCategory, HarmBlockThreshold, GenerateContentResponse, Content, Type, Modality, Part, LiveSession, LiveServerMessage, Blob } from "@google/genai";
import type { AIPersona, RepurposedContent, PresentationFeedback } from '../types';
import { apiClient } from './apiClient';

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;
let apiKey: string | null = null;

export const geminiState = {
  isInitialized: false,
  error: '',
  isInitializing: true,
};

const fetchApiKey = async (): Promise<string> => {
  if (apiKey) {
    return apiKey;
  }

  // TEMPORARY: Use environment variable directly
  // TODO: Switch to backend API when backend is running
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (envKey) {
    apiKey = envKey;
    return apiKey;
  }

  // Fallback: Try to fetch from backend (will fail if backend not running)
  try {
    const response = await apiClient.get('/users/gemini-api-key');
    apiKey = response.data.data.apiKey;
    return apiKey;
  } catch (error) {
    throw new Error('API key not found. Please set VITE_GEMINI_API_KEY in .env.local');
  }
};

export const initializeWithApiKey = async (userProvidedKey?: string): Promise<boolean> => {
  try {
    const providedKey = userProvidedKey?.trim();
    const key = providedKey || await fetchApiKey();

    if (!key) {
      geminiState.isInitialized = false;
      geminiState.error = 'API Key not available.';
      return false;
    }

    const newAiInstance = new GoogleGenAI({ apiKey: key });
    await newAiInstance.models.generateContent({ model: 'gemini-2.5-flash', contents: 'hi' });
    
    ai = newAiInstance;
    apiKey = key;
    geminiState.isInitialized = true;
    geminiState.error = '';

    if (providedKey) {
      await apiClient.post('/users/gemini-api-key', { apiKey: providedKey });
    }

    console.log("Gemini AI Initialized Successfully.");
    return true;
  } catch (error: any) {
    ai = null;
    apiKey = null;
    geminiState.isInitialized = false;
    geminiState.error = 'Invalid API Key or network error.';
    console.error("Failed to initialize GoogleGenAI:", error);
    return false;
  }
};

export const attemptAutoInitialize = async () => {
  if (geminiState.isInitialized) {
    geminiState.isInitializing = false;
    return;
  }
  geminiState.isInitializing = true;
  await initializeWithApiKey();
  geminiState.isInitializing = false;
};

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const toolDeclarations = [
  {
    functionDeclarations: [
      {
        name: 'generateTitlesAndHooks',
        description: 'Generates 10 compelling titles and hooks for a piece of content, given a topic and a target audience.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: 'The main topic of the content.' },
            audience: { type: Type.STRING, description: 'The intended audience for the content.' },
          },
          required: ['topic', 'audience'],
        },
      },
      {
        name: 'generateThumbnailPrompts',
        description: 'Generates creative prompts for an AI image generator to create a YouTube thumbnail, given a video topic and a desired tone.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            videoTopic: { type: Type.STRING, description: 'The topic of the YouTube video.' },
            tone: { type: Type.STRING, description: 'The desired tone of the thumbnail (e.g., professional, dramatic, fun).' },
          },
          required: ['videoTopic', 'tone'],
        },
      },
    ],
  },
];


const getHistoryStorageKey = (userId: string) => `chatHistory_${userId}`;

export const startChatSession = async (userId: string): Promise<Content[]> => {
    if (!ai) {
        console.error("GenAI not initialized.");
        throw new Error("AI service is not configured. Please set your API key.");
    }
    
    const storedHistoryJson = localStorage.getItem(getHistoryStorageKey(userId));
    let history: Content[] = [];
    if (storedHistoryJson) {
        try {
            history = JSON.parse(storedHistoryJson);
        } catch (e) {
            console.error("Failed to parse chat history from localStorage", e);
            // History will remain an empty array, which is a safe fallback.
        }
    }

    chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            ...generationConfig,
            safetySettings,
            tools: toolDeclarations,
            systemInstruction: "You are a helpful and friendly AI assistant for a website called 'Mike's AI Forge'. Your purpose is to assist users by answering their questions about the website's features, which include an AI Tools Directory, free Utility tools, a Workflow Vault, and a Content Automation Studio. Be concise and helpful. When a user asks you to perform a task that matches one of your available tools (like generating titles or thumbnail prompts), you must use that tool.",
        }
    });
    console.log("Chat session started with history:", history);
    return history;
};

export const sendMessageToChatStream = async (userId: string, message: string | Part[]): Promise<AsyncGenerator<GenerateContentResponse>> => {
    if (!chatSession) {
        await startChatSession(userId);
    }
    if (!chatSession) {
        throw new Error("Chat session could not be started.");
    }

    try {
        const result = await chatSession.sendMessageStream({ message });
        return result;
    } catch (error: any) {
        console.error("Error sending message stream to Gemini:", error);
        throw new Error(`Sorry, an error occurred while processing your message: ${error.message}`);
    }
};

export const persistChatHistory = async (userId: string): Promise<void> => {
    if (!chatSession) {
        console.warn("Attempted to persist history, but no chat session was active.");
        return;
    }
    try {
        const updatedHistory = await chatSession.getHistory();
        localStorage.setItem(getHistoryStorageKey(userId), JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Failed to save chat history:", error);
    }
};

export const clearChatHistory = async (userId: string): Promise<void> => {
    localStorage.removeItem(getHistoryStorageKey(userId));
    await startChatSession(userId); 
    console.log(`Chat history cleared for user ${userId}.`);
};

export const generateTitlesAndHooks = async (topic: string, audience: string, systemInstruction?: string): Promise<string[]> => {
  if (!ai) throw new Error("AI service is not configured. Please set your API key.");
  
  const prompt = `Generate 10 compelling titles and hooks for a piece of content. The topic is "${topic}" and the target audience is "${audience}". Combine titles and hooks in single strings. For example: "Title: The #1 Mistake Coders Make | Hook: Are you making this critical error?". Return the response as a JSON array of 10 unique strings.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      ...generationConfig,
      safetySettings,
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
  });

  const jsonStr = response.text.trim();
  const results = JSON.parse(jsonStr);
  return results as string[];
};

export const generateChaptersAndSummary = async (youtubeUrl: string): Promise<{ summary: string; chapters: string[] }> => {
  if (!ai) throw new Error("AI service is not configured. Please set your API key.");
  
  const prompt = `You are a YouTube video analyst. Given the video URL "${youtubeUrl}", please do the following:
1.  Write a concise, one-paragraph summary of the video's content.
2.  Create a list of key chapters with timestamps (e.g., "00:00 - Introduction").
Assume you have access to the video's transcript. Your response must be a valid JSON object.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      ...generationConfig,
      temperature: 0.2,
      safetySettings,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A concise, one-paragraph summary of the video.",
          },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "A list of chapters with timestamps, e.g., '00:00 - Introduction'.",
          },
        },
        required: ["summary", "chapters"],
      },
    },
  });
  
  const jsonStr = response.text.trim();
  const results = JSON.parse(jsonStr);
  return results as { summary: string; chapters: string[] };
};

export const formatCaptions = async (rawText: string): Promise<{ srt: string; styleNotes: string[] }> => {
  if (!ai) throw new Error("AI service is not configured. Please set your API key.");
  
  const prompt = `You are a subtitle and caption expert. Take the following raw text transcript and format it into a standard SRT (SubRip) file format. Create logical timestamps starting from 00:00:01,000. Also, provide 3 brief style notes for displaying these captions for maximum readability (e.g., font choice, background, highlighting). Your response must be a valid JSON object.

Raw Text:
---
${rawText}
---`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      ...generationConfig,
      temperature: 0.2,
      safetySettings,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          srt: {
            type: Type.STRING,
            description: "The fully formatted SRT content, including sequence numbers, timestamps, and text.",
          },
          styleNotes: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "A list of 3 brief style suggestions for displaying the captions.",
          },
        },
        required: ["srt", "styleNotes"],
      },
    },
  });

  const jsonStr = response.text.trim();
  const results = JSON.parse(jsonStr);
  return results as { srt: string; styleNotes: string[] };
};

export const generateThumbnailPrompts = async (videoTopic: string, tone: string): Promise<{ prompts: string[]; cues: string[] }> => {
  if (!ai) throw new Error("AI service is not configured. Please set your API key.");
  
  const prompt = `You are a creative director specializing in YouTube thumbnails. For a video with the topic "${videoTopic}" and a desired tone of "${tone}", generate the following:
1.  A list of 5 creative, specific prompts that could be used with an AI image generator (like Midjourney or DALL-E) to create a compelling thumbnail.
2.  A list of 3 design cues, including suggestions for color palettes, font styles, and composition.
Your response must be a valid JSON object.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      ...generationConfig,
      safetySettings,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompts: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "A list of 5 creative prompts for an AI image generator.",
          },
          cues: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "A list of 3 design cues (color, font, composition).",
          },
        },
        required: ["prompts", "cues"],
      },
    },
  });

  const jsonStr = response.text.trim();
  const results = JSON.parse(jsonStr);
  return results as { prompts: string[]; cues: string[] };
};

export const generateVideoClip = async (prompt: string, imageBase64?: string, mimeType?: string): Promise<string> => {
  if (!ai) throw new Error("AI service is not configured. Please set your API key.");

  let operation;
  const generateVideosRequest = {
      model: 'veo-2.0-generate-001',
      prompt,
      config: { numberOfVideos: 1 },
      ...(imageBase64 && mimeType && { image: { imageBytes: imageBase64, mimeType } })
  };

  operation = await ai.models.generateVideos(generateVideosRequest);

  while (!operation.done) {
      console.log("Video generation in progress, polling for status...");
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
      console.error("Video generation operation finished but returned no data:", operation);
      throw new Error("Video generation failed or did not return a valid download link.");
  }
  
  const key = apiKey ?? await fetchApiKey();
  if (!key) throw new Error("API key not found for video download.");

  // Append API key for download
  return `${downloadLink}&key=${key}`;
};

export interface ThumbnailAnalysis {
  overallScore: number;
  clarity: number;
  emotionalImpact: number;
  textReadability: number;
  suggestions: string[];
}

export const analyzeThumbnail = async (imageBase64: string, mimeType: string): Promise<ThumbnailAnalysis> => {
  if (!ai) throw new Error("AI service is not configured. Please set your API key.");

  const imagePart = {
    inlineData: {
      mimeType,
      data: imageBase64,
    },
  };

  const textPart = {
    text: "You are a world-class YouTube thumbnail analyst. Analyze the provided thumbnail based on proven strategies for high click-through rates. Evaluate its clarity, emotional impact, and text readability, each on a scale of 1 to 10. Provide an overall score out of 10. Give 3-5 specific, actionable suggestions for improvement. Respond ONLY with a valid JSON object matching the provided schema."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      ...generationConfig,
      temperature: 0.2,
      safetySettings,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER, description: 'An overall score from 1 to 10.' },
          clarity: { type: Type.NUMBER, description: 'A score from 1 to 10 for how clear the thumbnail\'s message is.' },
          emotionalImpact: { type: Type.NUMBER, description: 'A score from 1 to 10 for its emotional impact.' },
          textReadability: { type: Type.NUMBER, description: 'A score from 1 to 10 for text readability.' },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 3-5 actionable suggestions for improvement.'
          }
        },
        required: ["overallScore", "clarity", "emotionalImpact", "textReadability", "suggestions"]
      }
    }
  });

  const jsonStr = response.text.trim();
  const results = JSON.parse(jsonStr);
  return results as ThumbnailAnalysis;
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    if (!ai) throw new Error("AI service is not configured. Please set your API key.");

    const audioPart = {
        inlineData: {
            mimeType,
            data: audioBase64,
        },
    };
    
    const textPart = {
        text: "Transcribe the provided audio. Include timestamps for each speaker or paragraph."
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [audioPart, textPart] },
        config: {
            ...generationConfig,
            safetySettings,
        }
    });

    return response.text;
};

export const repurposeTranscript = async (transcript: string, systemInstruction?: string): Promise<RepurposedContent> => {
  if (!ai) throw new Error("AI service is not configured. Please set your API key.");
  
  const prompt = `You are a content repurposing expert. Take the following transcript or text and generate the following assets:
1.  A concise, one-paragraph summary.
2.  A list of 5-7 key takeaways in bullet point format.
3.  A professional social media post suitable for LinkedIn.
4.  A short, engaging social media post suitable for Twitter (X).
Your response must be a valid JSON object matching the provided schema.

Transcript:
---
${transcript}
---`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      ...generationConfig,
      safetySettings,
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A concise, one-paragraph summary of the text.",
          },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 5-7 key takeaways.",
          },
          socialPosts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING, enum: ["LinkedIn", "Twitter"] },
                content: { type: Type.STRING },
              },
              required: ["platform", "content"],
            },
            description: "A list of social media posts for different platforms.",
          },
        },
        required: ["summary", "keyTakeaways", "socialPosts"],
      },
    },
  });

  const jsonStr = response.text.trim();
  const results = JSON.parse(jsonStr);
  return results as RepurposedContent;
};

export const generateImages = async (prompt: string, numberOfImages: number, aspectRatio: string): Promise<string[]> => {
    if (!ai) throw new Error("AI service is not configured. Please set your API key.");

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages,
            outputMimeType: 'image/jpeg',
            aspectRatio,
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed to return any images.");
    }

    return response.generatedImages.map(img => img.image.imageBytes);
};

export interface EditedImageResponse {
  newImageBase64: string | null;
  textResponse: string | null;
}

export const editImage = async (imageBase64: string, mimeType: string, prompt: string): Promise<EditedImageResponse> => {
  if (!ai) throw new Error("AI service is not configured. Please set your API key.");

  const imagePart = { inlineData: { data: imageBase64, mimeType } };
  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const result: EditedImageResponse = { newImageBase64: null, textResponse: null };

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      result.textResponse = part.text;
    } else if (part.inlineData) {
      result.newImageBase64 = part.inlineData.data;
    }
  }
  
  if (!result.newImageBase64) {
    throw new Error("The AI did not return an edited image. It may have refused the request.");
  }

  return result;
};

// --- Live Presentation Coach Functions ---

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const connectLiveSession = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}): Promise<LiveSession> => {
    if (!ai) throw new Error("AI service is not configured.");

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
        },
    });
    return sessionPromise;
};

export const analyzePresentationTranscript = async (transcript: string): Promise<PresentationFeedback> => {
  if (!ai) throw new Error("AI service is not configured. Please set your API key.");
  
  const prompt = `You are a world-class public speaking coach. Analyze the following transcript of a presentation. Provide feedback on clarity, pacing (based on text flow), use of filler words, and engagement. Give an overall score out of 10. Also provide a list of actionable suggestions for improvement and a count of common filler words found.

Respond ONLY with a valid JSON object matching the provided schema.

Transcript:
---
${transcript}
---`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      ...generationConfig,
      temperature: 0.4,
      safetySettings,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER, description: 'An overall score from 1 to 10.' },
          feedback: {
            type: Type.OBJECT,
            properties: {
              clarity: { type: Type.STRING, description: 'Feedback on the clarity of the message.' },
              pacing: { type: Type.STRING, description: 'Feedback on the pacing and flow.' },
              fillerWords: { type: Type.STRING, description: 'Feedback on the use of filler words.' },
              engagement: { type: Type.STRING, description: 'Feedback on how engaging the speech is.' },
            },
            required: ["clarity", "pacing", "fillerWords", "engagement"],
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of actionable suggestions for improvement.'
          },
          fillerWordCount: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    count: { type: Type.NUMBER },
                },
                 required: ["word", "count"],
            },
            description: 'A count of common filler words found in the transcript.'
          }
        },
        required: ["overallScore", "feedback", "suggestions", "fillerWordCount"]
      }
    }
  });

  const jsonStr = response.text.trim();
  const results = JSON.parse(jsonStr);
  return results as PresentationFeedback;
};
