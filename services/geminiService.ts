import { GoogleGenAI } from "@google/genai";

// Helper to get a fresh client instance
// This is crucial because the API key might change if the user selects one via window.aistudio
const getClient = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const askAITutor = async (
  question: string,
  context: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return "To use the AI Tutor, please configure a valid API_KEY in the environment variables.";
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an expert ESG (Environmental, Social, and Governance) Tutor.
      The student is currently learning from the following lesson content:
      "${context}"

      The student asks: "${question}"

      Answer concisely (under 100 words), encouragingly, and strictly based on ESG principles.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "I couldn't generate an answer at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, the AI Tutor is currently experiencing connection issues.";
  }
};

export const generateLessonVideo = async (
  prompt: string
): Promise<string | null> => {
  // Check for API Key selection for Veo
  if (window.aistudio && window.aistudio.hasSelectedApiKey && window.aistudio.openSelectKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      try {
        await window.aistudio.openSelectKey();
      } catch (e) {
        console.error("Error selecting key:", e);
        return null;
      }
    }
  }

  const ai = getClient();
  if (!ai) {
    console.error("No API Key available for video generation");
    return null;
  }

  try {
    // Using the fast preview model for demo purposes
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic, professional documentary style: ${prompt}`,
      config: {
        numberOfVideos: 1,
        resolution: '720p', 
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (videoUri) {
       // Retrieve the actual video bytes to create a playable Blob URL
       // This avoids CORS/Auth issues with playing the raw URI directly in a video tag
       const apiKey = process.env.API_KEY;
       const response = await fetch(`${videoUri}&key=${apiKey}`);
       
       if (!response.ok) {
         throw new Error(`Failed to fetch video data: ${response.statusText}`);
       }

       const blob = await response.blob();
       return URL.createObjectURL(blob);
    }
    
    return null;
  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};