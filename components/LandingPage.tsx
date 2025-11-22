import React, { useState } from 'react';
import { FullCourseData } from '../types';
import { Play, CheckCircle, Award, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  data: FullCourseData['landing_page'];
  onStart: (name: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ data, onStart }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError(true);
      return;
    }
    onStart(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold tracking-wide">
              New Course
            </span>
            <h1 className="text-5xl font-bold text-slate-900 leading-tight">
              {data.title}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              {data.short_description}
            </p>
          </div>

          <ul className="space-y-3">
            {data.key_features.map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-3 text-slate-700">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Enter your Name to Begin
              </label>
              <input
                type="text"
                id="name"
                className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700 bg-slate-900 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500'} outline-none transition-all`}
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(false);
                }}
              />
              {error && <p className="text-red-500 text-sm mt-1">Please enter a valid name.</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-md hover:shadow-lg"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Right Column: Visual */}
        <div className="hidden md:flex justify-center relative">
          <div className="absolute inset-0 bg-emerald-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 w-full max-w-md">
            <div className="aspect-video bg-slate-900 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <img 
                src="https://picsum.photos/800/450" 
                alt="Course Preview" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-slate-600">Certified Course</span>
                </div>
                <span className="text-sm font-medium text-emerald-600">5 Lessons</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-emerald-500 rounded-full"></div>
              </div>
              <p className="text-xs text-slate-400 text-center">Join 10,000+ professionals learning ESG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};