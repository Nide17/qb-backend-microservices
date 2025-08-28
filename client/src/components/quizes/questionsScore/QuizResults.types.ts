import { Quiz, Category, User } from '../../../types';

export interface QuizResultsProps {
  newScoreId?: string;
  score: number;
  qnsLength: number;
  thisQuiz: Quiz;
  quizToReview: any; // Replace 'any' with proper type
  passMark: number;
  mongoScoreId?: string;
}

export interface QuizResultsState {
  isReviewModalOpen: boolean;
  reviewText: string;
  rating: number;
  isSubmitting: boolean;
  error: string | null;
  isMounted: boolean;
}

export interface QuizResultsViewProps {
  marks: number;
  qnsLength: number;
  passMark: number;
  thisQuiz: Quiz;
  currentUser: User | null;
  categories: Category[];
  isReviewModalOpen: boolean;
  reviewText: string;
  rating: number;
  isSubmitting: boolean;
  error: string | null;
  handleReviewSubmit: (e: React.FormEvent) => Promise<void>;
  setReviewText: React.Dispatch<React.SetStateAction<string>>;
  setRating: React.Dispatch<React.SetStateAction<number>>;
  toggleReviewModal: () => void;
  formatDate: (dateString: string) => string;
  calculatePercentage: (obtained: number, total: number) => number;
}
