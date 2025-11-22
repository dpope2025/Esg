import React, { useState, useEffect, useRef } from 'react';
import { Lesson } from '../types';
import { PlayCircle, FileText, Lightbulb, MessageSquare, Loader2, ArrowRight, Video, AlertCircle } from 'lucide-react';
import { Quiz } from './Quiz';
import { askAITutor, generateLessonVideo } from '../services/geminiService';

interface LessonViewProps {
  lesson: Lesson;
  onLessonComplete: (score: number) => void;
  isCompleted: boolean;
  onNext: () => void;
  hasNext: boolean;
  cachedVideoUrl?: string;
  onVideoGenerated: (url: string) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({ 
  lesson, 
  onLessonComplete, 
  isCompleted,
  onNext,
  hasNext,
  cachedVideoUrl,
  onVideoGenerated
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'summary'>('video');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Video State
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  // Track if we've attempted generation for this lesson ID to avoid double calls
  const generationAttemptedRef = useRef<string | null>(null);

  // Reset state when lesson changes
  useEffect(() => {
    setShowQuiz(false);
    setAiAnswer('');
    setAiQuestion('');
    setActiveTab('video');
    setVideoError(null);
    setVideoLoading(false);
    generationAttemptedRef.current = null;
  }, [lesson.id]);

  // Auto-generate video if not cached
  useEffect(() => {
    const loadVideo = async () => {
      // If we already have it, or are loading, or already tried for this lesson, skip
      if (cachedVideoUrl || videoLoading || generationAttemptedRef.current === lesson.id) return;

      generationAttemptedRef.current = lesson.id;
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

    // Trigger immediately on mount/change if in video tab
    if (activeTab === 'video' && !cachedVideoUrl) {
        loadVideo();
    }
  }, [lesson.id, cachedVideoUrl, activeTab, videoLoading, lesson.visual_guidance, onVideoGenerated]);

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

  const retryGeneration = () => {
      generationAttemptedRef.current = null;
      setVideoLoading(false);
      // Effect will re-trigger
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

              <div className="bg-slate-50 p-6 border-t border-slate-200 rounded-xl">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lesson Summary</h4>
                 <p className="text-slate-700 leading-relaxed font-serif text-lg">
                   "{lesson.video_script}"
                 </p>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
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
              Have a question about <strong>{lesson.title}</strong>? Ask our Gemini-powered assistant.
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
                       <span>Thinking...</span>
                   </div>
               )}
            </div>

            <form onSubmit={handleAskAI} className="mt-4 relative">
              <input 
                type="text" 
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask a question..." 
                className="w-full pl-3 pr-10 py-2 text-sm border border-slate-700 bg-slate-900 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                type="submit"
                disabled={aiLoading || !aiQuestion.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700 disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 text-xs text-slate-400 text-center">
              Powered by Gemini API
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};