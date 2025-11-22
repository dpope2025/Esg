import React, { useState, useEffect, useMemo } from 'react';
import { UserState } from './types';
import { COURSE_DATA } from './data';
import { LandingPage } from './components/LandingPage';
import { LessonView } from './components/LessonView';
import { CertificateView } from './components/CertificateView';
import { BookOpen, CheckCircle, Circle, Menu, X, GraduationCap, Lock, LogOut } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [user, setUser] = useState<UserState>(() => {
    // Load from local storage if available
    const saved = localStorage.getItem('esg_user');
    return saved ? JSON.parse(saved) : {
      name: '',
      started: false,
      completedLessonIds: [],
      currentLessonId: COURSE_DATA.course.modules[0].lessons[0].id,
      quizScores: {}
    };
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Cache for generated video URLs to prevent regeneration on navigation
  const [videoCache, setVideoCache] = useState<Record<string, string>>({});
  // Cache for generated audio lectures
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('esg_user', JSON.stringify(user));
  }, [user]);

  // --- Derived State ---
  const allLessons = useMemo(() => 
    COURSE_DATA.course.modules.flatMap(m => m.lessons), 
  []);

  const currentLessonIndex = allLessons.findIndex(l => l.id === user.currentLessonId);
  const isCourseComplete = user.completedLessonIds.length === allLessons.length;
  const hasNextLesson = currentLessonIndex < allLessons.length - 1 || (isCourseComplete && user.currentLessonId !== 'certificate');

  // --- Handlers ---
  const startCourse = (name: string) => {
    setUser(prev => ({ ...prev, name, started: true }));
  };

  const handleLessonComplete = (score: number) => {
    if (score >= 60) {
      setUser(prev => {
        const newCompleted = prev.completedLessonIds.includes(prev.currentLessonId)
          ? prev.completedLessonIds
          : [...prev.completedLessonIds, prev.currentLessonId];
        
        return {
          ...prev,
          completedLessonIds: newCompleted,
          quizScores: { ...prev.quizScores, [prev.currentLessonId]: score }
        };
      });
    }
  };

  const navigateToLesson = (id: string) => {
    setUser(prev => ({ ...prev, currentLessonId: id }));
    setSidebarOpen(false);
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      navigateToLesson(allLessons[currentLessonIndex + 1].id);
      window.scrollTo(0,0);
    } else if (isCourseComplete) {
      navigateToLesson('certificate');
      window.scrollTo(0,0);
    }
  };

  const handleVideoGenerated = (lessonId: string, url: string) => {
    setVideoCache(prev => ({ ...prev, [lessonId]: url }));
  };

  const handleAudioGenerated = (lessonId: string, url: string) => {
    setAudioCache(prev => ({ ...prev, [lessonId]: url }));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to exit? This will reset all your progress.")) {
      const initialState = {
        name: '',
        started: false,
        completedLessonIds: [],
        currentLessonId: COURSE_DATA.course.modules[0].lessons[0].id,
        quizScores: {}
      };
      setUser(initialState);
      setVideoCache({}); // Clear cached videos
      setAudioCache({}); // Clear cached audio
      localStorage.removeItem('esg_user');
      setSidebarOpen(false);
    }
  };

  // --- Views ---

  if (!user.started) {
    return <LandingPage data={COURSE_DATA.landing_page} onStart={startCourse} />;
  }

  const currentLesson = allLessons.find(l => l.id === user.currentLessonId);

  // Render Course Layout
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Sidebar Toggle */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 z-20 md:hidden flex justify-between items-center">
        <span className="font-bold text-emerald-700">ESG Academy</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 bg-slate-900 text-slate-100 transform transition-transform duration-300 ease-in-out z-30
        md:relative md:translate-x-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span>ESG Academy</span>
          </h1>
          <div className="mt-4 text-sm text-slate-400">
            Welcome back, <span className="text-white font-medium">{user.name}</span>
          </div>
          <div className="mt-4 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${(user.completedLessonIds.length / allLessons.length) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-slate-400 flex justify-between">
             <span>{Math.round((user.completedLessonIds.length / allLessons.length) * 100)}% Complete</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           {COURSE_DATA.course.modules.map((module, mIdx) => (
             <div key={mIdx}>
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pl-3">
                 {module.module_title}
               </h3>
               <div className="space-y-1">
                 {module.lessons.map((lesson, lIdx) => {
                   const isCompleted = user.completedLessonIds.includes(lesson.id);
                   const isActive = user.currentLessonId === lesson.id;
                   // Lock logic: simple linear progression. 
                   // Unlock if it's the first lesson OR if the previous lesson is completed.
                   const prevLessonId = allLessons[allLessons.findIndex(l => l.id === lesson.id) - 1]?.id;
                   const isLocked = prevLessonId && !user.completedLessonIds.includes(prevLessonId);

                   return (
                     <button
                       key={lesson.id}
                       disabled={!!isLocked}
                       onClick={() => navigateToLesson(lesson.id)}
                       className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left text-sm transition-colors ${
                         isActive 
                           ? 'bg-emerald-600 text-white' 
                           : isLocked 
                             ? 'opacity-50 cursor-not-allowed text-slate-500'
                             : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                       }`}
                     >
                       {isCompleted ? (
                         <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                       ) : isLocked ? (
                         <Lock className="w-4 h-4 flex-shrink-0" />
                       ) : (
                         <Circle className="w-4 h-4 flex-shrink-0" />
                       )}
                       <span className="line-clamp-1">{lesson.title}</span>
                     </button>
                   );
                 })}
               </div>
             </div>
           ))}

           {/* Certificate Link (Only show if complete) */}
           <div className="border-t border-slate-800 pt-6">
                <button
                    disabled={!isCourseComplete}
                    onClick={() => navigateToLesson('certificate')}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left text-sm transition-colors ${
                         user.currentLessonId === 'certificate'
                           ? 'bg-yellow-600 text-white'
                           : !isCourseComplete
                             ? 'opacity-50 cursor-not-allowed text-slate-500'
                             : 'text-yellow-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <GraduationCap className="w-4 h-4 flex-shrink-0" />
                    <span>Certificate</span>
                    {!isCourseComplete && <span className="text-xs ml-auto">(Locked)</span>}
                </button>
           </div>
        </div>

        {/* Footer with Reset Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
            <button
                onClick={handleReset}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-slate-400 hover:text-red-200 hover:bg-red-900/30 rounded-lg transition-colors text-sm border border-transparent hover:border-red-900/50 group"
            >
                <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
                <span>Reset & Exit Course</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pt-20 md:pt-0 bg-slate-50">
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
            {user.currentLessonId === 'certificate' && isCourseComplete ? (
                <CertificateView 
                    data={COURSE_DATA.certificate} 
                    userName={user.name} 
                />
            ) : currentLesson ? (
                <LessonView 
                    lesson={currentLesson} 
                    onLessonComplete={handleLessonComplete}
                    isCompleted={user.completedLessonIds.includes(currentLesson.id)}
                    onNext={handleNextLesson}
                    hasNext={hasNextLesson}
                    cachedVideoUrl={videoCache[currentLesson.id]}
                    onVideoGenerated={(url) => handleVideoGenerated(currentLesson.id, url)}
                    cachedAudioUrl={audioCache[currentLesson.id]}
                    onAudioGenerated={(url) => handleAudioGenerated(currentLesson.id, url)}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                    Select a lesson to continue
                </div>
            )}
        </div>
      </main>

    </div>
  );
};

export default App;
