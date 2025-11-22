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

export const processVoiceQuery = async (
  audioBlob: Blob,
  context: string
): Promise<{ text: string; audioUrl: string } | null> => {
  const ai = getClient();
  if (!ai) return null;

  try {
    // 1. Convert Blob to Base64
    const base64Audio = await blobToBase64(audioBlob);

    // 2. Get Text Answer
    // We send the audio directly to the model
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an expert, friendly female ESG Tutor.
      Context: ${context}
      Listen to the student's question in the provided audio and answer concisely (max 2 sentences).
      Tone: Warm, encouraging, like a helpful lecturer.
    `;

    const resp = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { 
            inlineData: { 
              mimeType: audioBlob.type || "audio/webm", 
              data: base64Audio 
            } 
          },
          { text: prompt }
        ]
      }
    });

    const answerText = resp.text || "I didn't quite catch that, could you repeat it?";

    // 3. Get Audio for the answer (TTS)
    const ttsResp = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: answerText }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Female voice
          },
        },
      },
    });

    const ttsBase64 = ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!ttsBase64) return { text: answerText, audioUrl: "" };

    const wavBlob = base64ToWavBlob(ttsBase64);
    const audioUrl = URL.createObjectURL(wavBlob);

    return { text: answerText, audioUrl };

  } catch (e) {
    console.error("Voice Query Error", e);
    return null;
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

export const generateAudioLecture = async (
  title: string,
  summary: string
): Promise<{ audioUrl: string, script: string } | null> => {
  const ai = getClient();
  if (!ai) return null;

  try {
    // 1. Generate the Script
    // We ask the model to write a script suitable for a mature British professor
    // Explicitly instructing NO stage directions/markdown visuals to keep PDF clean.
    const scriptPrompt = `
      Write an engaging, educational lecture script for a university course.
      Topic: ${title}
      Key Concepts: ${summary}
      Persona: A distinguished, mature British professor. Deep, authoritative, yet warm voice.
      Format: Pure spoken monologue. 
      Constraint: DO NOT include stage directions, scene descriptions, [brackets], or visual cues. Only write the words the professor speaks.
      Length: Approximately 400-500 words (roughly 3-4 minutes spoken).
      Content: Explain the concepts clearly, provide a real-world example, and explain why it matters. 
      Style: Use sophisticated but accessible language. 
      Start with: "Welcome back. Today we are delving into ${title}..."
    `;

    const scriptResp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: scriptPrompt,
    });
    const script = scriptResp.text || "";

    if (!script) return null;

    // 2. Convert to Speech
    // We use the Fenrir voice for a deeper, more mature tone
    const ttsResp = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: script }] }],
      config: {
        responseModalities: ['AUDIO'], 
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const base64 = ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64) return null;

    // 3. Convert PCM to WAV
    // The API returns raw PCM (24kHz). Browsers need a WAV container to play it easily.
    const audioBlob = base64ToWavBlob(base64);
    const audioUrl = URL.createObjectURL(audioBlob);

    return { audioUrl, script };

  } catch (e) {
    console.error("Audio Gen Error", e);
    return null;
  }
};

// Helper: Convert Blob to Base64 string
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // remove data:audio/wav;base64, prefix
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Helper: Convert Base64 PCM string to WAV Blob
function base64ToWavBlob(base64: string): Blob {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Gemini output is usually 24kHz, 1 channel, 16-bit PCM
  const wavHeader = getWavHeader(len, 24000, 1, 16);
  return new Blob([wavHeader, bytes], { type: 'audio/wav' });
}

// Helper: Construct WAV Header
function getWavHeader(dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number) {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  return header;
}