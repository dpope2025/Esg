import React, { useState, useEffect, useRef } from 'react';
import { Lesson } from '../types';
import { PlayCircle, FileText, Lightbulb, MessageSquare, Loader2, ArrowRight, Video, AlertCircle, Headphones, Download, Mic, Square } from 'lucide-react';
import { Quiz } from './Quiz';
import { askAITutor, generateLessonVideo, generateAudioLecture, processVoiceQuery } from '../services/geminiService';
import jsPDF from 'jspdf';

interface LessonViewProps {
  lesson: Lesson;
  onLessonComplete: (score: number) => void;
  isCompleted: boolean;
  onNext: () => void;
  hasNext: boolean;
  cachedVideoUrl?: string;
  onVideoGenerated: (url: string) => void;
  cachedAudioUrl?: string;
  cachedAudioScript?: string;
  onAudioGenerated: (data: { url: string, script: string }) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({ 
  lesson, 
  onLessonComplete, 
  isCompleted,
  onNext,
  hasNext,
  cachedVideoUrl,
  onVideoGenerated,
  cachedAudioUrl,
  cachedAudioScript,
  onAudioGenerated
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'summary'>('video');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Video State
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoAttemptRef = useRef<string | null>(null);
  
  // Audio State
  const audioAttemptRef = useRef<string | null>(null);

  // Reset state when lesson changes
  useEffect(() => {
    setShowQuiz(false);
    setAiAnswer('');
    setAiQuestion('');
    setActiveTab('video');
    setVideoError(null);
    setVideoLoading(false);
    videoAttemptRef.current = null;
    audioAttemptRef.current = null;
    setIsRecording(false);
  }, [lesson.id]);

  // Auto-generate video if not cached
  useEffect(() => {
    const loadVideo = async () => {
      if (cachedVideoUrl || videoLoading || videoAttemptRef.current === lesson.id) return;

      videoAttemptRef.current = lesson.id;
      setVideoLoading(true);
      setVideoError(null);

      try {
        const url = await generateLessonVideo(lesson.visual_guidance);
        if (url) {
          onVideoGenerated(url);
        } else {
          setVideoError("Could not retrieve video content. Please check your API key.");
        }
      } catch (err) {
        console.error(err);
        setVideoError("An error occurred while loading the video stream.");
      } finally {
        setVideoLoading(false);
      }
    };

    if (activeTab === 'video' && !cachedVideoUrl) {
        loadVideo();
    }
  }, [lesson.id, cachedVideoUrl, activeTab, videoLoading, lesson.visual_guidance, onVideoGenerated]);

  // Auto-generate Audio if not cached
  useEffect(() => {
    const loadAudio = async () => {
      if (cachedAudioUrl || audioAttemptRef.current === lesson.id) return;
      
      audioAttemptRef.current = lesson.id;
      try {
        const result = await generateAudioLecture(lesson.title, lesson.summary);
        if (result) {
          onAudioGenerated(result);
        }
      } catch (err) {
        console.error("Audio gen failed", err);
      }
    };

    if (!cachedAudioUrl) {
      loadAudio();
    }
  }, [lesson.id, cachedAudioUrl, lesson.title, lesson.summary, onAudioGenerated]);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiAnswer(''); 
    
    const context = `Title: ${lesson.title}\nScript: ${lesson.video_script}\nSummary: ${lesson.summary}`;
    
    const answer = await askAITutor(aiQuestion, context);
    setAiAnswer(answer);
    setAiLoading(false);
  };

  // Mic Logic
  const handleMicClick = async () => {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            handleVoiceQuery(audioBlob);
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const handleVoiceQuery = async (audioBlob: Blob) => {
    setAiLoading(true);
    setAiAnswer('');
    setAiQuestion('(Voice Query)');

    const context = `Title: ${lesson.title}\nScript: ${lesson.video_script}\nSummary: ${lesson.summary}`;
    const result = await processVoiceQuery(audioBlob, context);

    setAiLoading(false);
    if (result) {
        setAiAnswer(result.text);
        // Auto-play audio response
        if (result.audioUrl) {
            const audio = new Audio(result.audioUrl);
            audio.play().catch(e => console.error("Auto-play failed", e));
        }
    } else {
        setAiAnswer("Sorry, I couldn't process your voice message.");
    }
  };

  const retryGeneration = () => {
      videoAttemptRef.current = null;
      setVideoLoading(false);
      // Effect will re-trigger
  };

  const handleDownloadNotes = () => {
    if (!cachedAudioScript) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(lesson.title, 20, 20);

    doc.setFontSize(12);
    doc.text("Professor's Lecture Notes", 20, 30);
    doc.line(20, 32, 190, 32);

    // Content logic to parse basic markdown for PDF
    // We handle # Headers and - Bullets
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    
    const lines = cachedAudioScript.split('\n');
    let yPos = 45;
    const lineHeight = 7;
    const pageHeight = 280;

    lines.forEach(line => {
        if (yPos > pageHeight) {
            doc.addPage();
            yPos = 20;
        }

        const trimmed = line.trim();
        if (!trimmed) {
            yPos += lineHeight / 2;
            return;
        }

        // Bold Headers
        if (trimmed.startsWith('#')) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            const text = trimmed.replace(/^#+\s*/, '');
            doc.text(text, 20, yPos);
            yPos += lineHeight * 1.5;
            doc.setFont("times", "normal");
            doc.setFontSize(12);
        } 
        // Bullet points
        else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const text = trimmed.replace(/^[-*]\s*/, '• ');
            // Simple wrap
            const splitText = doc.splitTextToSize(text, 170);
            doc.text(splitText, 25, yPos); // Indent
            yPos += splitText.length * lineHeight;
        }
        // Regular text
        else {
            // Remove markdown bold ** or __
            const cleanText = trimmed.replace(/(\*\*|__)(.*?)\1/g, '$2');
            const splitText = doc.splitTextToSize(cleanText, 170);
            doc.text(splitText, 20, yPos);
            yPos += splitText.length * lineHeight;
        }
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated by GCS Apex | ESG Academy`, 20, 280);

    doc.save(`${lesson.title.replace(/[^a-z0-9]/gi, '_')}_Notes.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">{lesson.title}</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('video')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'video' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Video Lesson</span>
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'summary' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Summary & Key Takeaways</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {activeTab === 'video' ? (
            <div className="space-y-6">
              <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative group">
                {cachedVideoUrl ? (
                  <video 
                    src={cachedVideoUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                     {/* Background Placeholder */}
                     <img src="https://picsum.photos/800/450?grayscale" alt="Video Placeholder" className="w-full h-full object-cover opacity-30" />
                     
                     {/* Overlay Content */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        {videoError ? (
                            <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center">
                                <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                                <p className="text-white font-medium">Content Unavailable</p>
                                <p className="text-xs text-red-200 mt-1 mb-3">{videoError}</p>
                                <button 
                                    onClick={retryGeneration}
                                    className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-slate-200"
                                >
                                    Retry Load
                                </button>
                            </div>
                        ) : (
                            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl flex flex-col items-center">
                                <div className="relative">
                                   <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                                   <div className="absolute inset-0 flex items-center justify-center">
                                     <Video className="w-5 h-5 text-emerald-400 opacity-50" />
                                   </div>
                                </div>
                                <h3 className="text-white font-bold text-lg mt-4 mb-1">Retrieving Video Content</h3>
                                <p className="text-slate-200 text-xs">
                                    Generating AI visual components for this lesson...
                                </p>
                            </div>
                        )}
                     </div>

                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white pointer-events-none">
                       <p className="text-sm font-medium text-emerald-300 mb-1">Director's Notes</p>
                       <p className="text-xs opacity-80 italic">{lesson.visual_guidance}</p>
                     </div>
                  </>
                )}
              </div>

              {/* Audio Player Section - Directly below video */}
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-700 shadow-md flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                 <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="bg-emerald-600 p-3 rounded-full shadow-lg">
                        <Headphones className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Audio Lecture</h4>
                        <p className="text-slate-400 text-xs">Professor's Notes (AI)</p>
                    </div>
                 </div>
                 
                 <div className="flex-1 w-full">
                    {cachedAudioUrl ? (
                        <audio controls className="w-full h-10 rounded" src={cachedAudioUrl} />
                    ) : (
                        <div className="h-10 bg-slate-800 rounded flex items-center justify-center text-emerald-400 text-xs animate-pulse border border-slate-700">
                             <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                             <span>Generating Lecture Audio...</span>
                        </div>
                    )}
                 </div>
              </div>

              <div className="bg-slate-50 p-6 border-t border-slate-200 rounded-xl">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lesson Summary</h4>
                 <p className="text-slate-700 leading-relaxed font-serif text-lg">
                   "{lesson.video_script}"
                 </p>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Summary</h3>
                <p className="text-slate-600 leading-relaxed mb-6">{lesson.summary}</p>
                
                <h4 className="flex items-center text-emerald-700 font-semibold mb-3">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Key Takeaways
                </h4>
                <ul className="space-y-2">
                    {lesson.key_takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-slate-700">{point}</span>
                    </li>
                    ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-slate-500" />
                      Downloadable Resources
                  </h4>
                  
                  <button
                    onClick={handleDownloadNotes}
                    disabled={!cachedAudioScript}
                    className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        cachedAudioScript 
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-5 h-5" />
                    <span>{cachedAudioScript ? 'Download Lesson Notes (PDF)' : 'Preparing Notes...'}</span>
                  </button>
                  {!cachedAudioScript && (
                      <p className="text-xs text-slate-400 mt-2">
                          Notes are being transcribed from the generated audio lecture. Please wait.
                      </p>
                  )}
              </div>
            </div>
          )}

          {/* Quiz Section */}
          <div className="pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Knowledge Check</h3>
                {isCompleted && <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">Completed</span>}
            </div>
            
            {!showQuiz && !isCompleted ? (
                <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
                    <p className="text-slate-600 mb-4">Ready to test your knowledge for this lesson?</p>
                    <button 
                        onClick={() => setShowQuiz(true)}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                        Start Quiz
                    </button>
                </div>
            ) : (
                <Quiz questions={lesson.quiz} onComplete={onLessonComplete} />
            )}

            {/* Completion / Next Actions */}
            {isCompleted && (
                 <div className="mt-6 space-y-4">
                     {!showQuiz && (
                        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                            <p className="text-emerald-800 text-sm">You have mastered this lesson.</p>
                            <button 
                                onClick={() => setShowQuiz(true)}
                                className="text-xs text-emerald-600 underline mt-1 hover:text-emerald-800"
                            >
                                Review Quiz
                            </button>
                        </div>
                     )}
                     
                     {hasNext && (
                         <button 
                            onClick={onNext}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-all transform hover:scale-[1.02] flex items-center justify-center"
                         >
                            <span>Next Lesson</span>
                            <ArrowRight className="w-5 h-5 ml-2" />
                         </button>
                     )}
                 </div>
            )}
          </div>

        </div>

        {/* Sidebar / Tutor */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-b from-indigo-50 to-white rounded-xl border border-indigo-100 p-6 shadow-sm sticky top-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                 <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-slate-800">Tutor</h3>
            </div>
            
            <div className="text-sm text-slate-600 mb-4">
              Have a question about <strong>{lesson.title}</strong>? Ask our GCS Apex assistant.
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1" ref={chatEndRef}>
               {aiAnswer && (
                   <div className="bg-indigo-100 text-indigo-900 p-3 rounded-lg text-sm rounded-tl-none">
                       {aiAnswer}
                   </div>
               )}
               {aiLoading && (
                   <div className="flex items-center space-x-2 text-indigo-500 text-sm">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span>{isRecording ? 'Listening...' : 'Thinking...'}</span>
                   </div>
               )}
            </div>

            <form onSubmit={handleAskAI} className="mt-4 relative">
              <input 
                type="text" 
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder={isRecording ? "Listening..." : "Ask a question..."}
                disabled={isRecording}
                className={`w-full pl-3 pr-20 py-2 text-sm border border-slate-700 bg-slate-900 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${isRecording ? 'ring-2 ring-red-500' : ''}`}
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  {/* Mic Button */}
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`p-1.5 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
                    title="Use Voice"
                  >
                    {isRecording ? <Square className="w-3 h-3" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send Button */}
                  <button 
                    type="submit"
                    disabled={aiLoading || !aiQuestion.trim() || isRecording}
                    className="p-1.5 text-indigo-500 hover:text-indigo-700 disabled:opacity-50"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
              </div>
            </form>
            <div className="mt-2 text-xs text-slate-400 text-center">
              Powered by GCS Apex
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};