export interface QuestionOption {
  answer: string;
  correct: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuestionOption[];
}

export interface Lesson {
  id: string;
  title: string;
  video_script: string;
  visual_guidance: string;
  summary: string;
  key_takeaways: string[];
  quiz: QuizQuestion[];
}

export interface Module {
  module_title: string;
  lessons: Lesson[];
}

export interface CourseStructure {
  modules: Module[];
}

export interface LandingPageData {
  title: string;
  short_description: string;
  key_features: string[];
}

export interface CertificateData {
  certificate_title: string;
  certificate_text: string;
  shareable_message: string;
}

export interface FullCourseData {
  landing_page: LandingPageData;
  course: CourseStructure;
  certificate: CertificateData;
}

export interface UserState {
  name: string;
  started: boolean;
  completedLessonIds: string[];
  currentLessonId: string;
  quizScores: Record<string, number>; // lessonId -> score (0-100)
}