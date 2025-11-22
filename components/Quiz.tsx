import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle, XCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void; // Score percentage 0-100
}

export const Quiz: React.FC<QuizProps> = ({ questions, onComplete }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleOptionSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    const isCorrect = questions[currentQIndex].options[selectedOption].correct;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    // Calculate final score based on correct answers in this session logic
    // Since we increment score immediately, we just need to normalize it
    // Wait... the score state update might be batched. 
    // Actually, let's calculate the final percentage.
    // NOTE: score state is reliable here because handleNext is a separate render cycle from handleSubmitAnswer.
    
    // Wait, if the last question is correct, score updates, showFeedback becomes true. 
    // Then user clicks Next/Finish. 
    // However, `score` tracks correct answers.
    
    // Correction: The 'score' state holds the count of correct answers.
    // We need to handle the update from the *last* question before finishing.
    // Ah, `handleNext` is called *after* feedback. So score is already updated.
    
    const finalScoreCount = score; // This is safe.
    const percentage = Math.round((finalScoreCount / questions.length) * 100);
    setQuizFinished(true);
    onComplete(percentage);
  };

  const currentQuestion = questions[currentQIndex];

  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 60;

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-6">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${passed ? 'bg-emerald-100' : 'bg-orange-100'}`}>
          {passed ? <CheckCircle className="w-10 h-10 text-emerald-600" /> : <XCircle className="w-10 h-10 text-orange-600" />}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">{passed ? 'Quiz Completed!' : 'Needs Improvement'}</h3>
          <p className="text-slate-600 mt-2">You scored {percentage}%</p>
        </div>
        {passed ? (
           <p className="text-sm text-emerald-600 font-medium">Lesson marked as complete.</p>
        ) : (
          <button 
            onClick={() => {
                setScore(0);
                setCurrentQIndex(0);
                setSelectedOption(null);
                setShowFeedback(false);
                setQuizFinished(false);
            }}
            className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retry Quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Question {currentQIndex + 1} of {questions.length}
        </span>
        <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded">
          Multiple Choice
        </span>
      </div>
      
      <div className="p-6 sm:p-8">
        <h3 className="text-xl font-medium text-slate-900 mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            let optionClass = "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50";
            let icon = null;

            if (showFeedback) {
              if (opt.correct) {
                optionClass = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500";
                icon = <CheckCircle className="w-5 h-5 text-emerald-600" />;
              } else if (selectedOption === idx) {
                optionClass = "border-red-500 bg-red-50 ring-1 ring-red-500";
                icon = <XCircle className="w-5 h-5 text-red-600" />;
              } else {
                 optionClass = "border-slate-200 opacity-50";
              }
            } else if (selectedOption === idx) {
              optionClass = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between group ${optionClass}`}
              >
                <span className="text-slate-700 font-medium">{opt.answer}</span>
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
        {!showFeedback ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
          >
            Submit Answer
          </button>
        ) : (
           <button
            onClick={handleNext}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors flex items-center"
          >
            {currentQIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};