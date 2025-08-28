import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import { saveFeedback } from '../../../redux/slices/feedbacksSlice';
import { logRegContext } from '../../../appContexts';
import QBLoadingSM from '../../rLoading/QBLoadingSM';
import ErrorBoundary from '../../ErrorBoundary';
import { QuizResultsProps, QuizResultsViewProps } from './QuizResults.types';

// Lazy load heavy components
const ResponsiveAd = lazy(() => import('../../adsenses/ResponsiveAd'));
const ResponsiveHorizontal = lazy(() => import('../../adsenses/ResponsiveHorizontal'));
const GridMultiplex = lazy(() => import('../../adsenses/GridMultiplex'));
const MarksStatus = lazy(() => import('./MarksStatus'));
const PdfDocument = lazy(() => import('../../dashboard/pdfs/PdfDocument'));
const SimilarQuizes = lazy(() => import('./SimilarQuizes'));
const RelatedNotes = lazy(() => import('./RelatedNotes'));
const ReviewForm = lazy(() => import('./ReviewForm'));

const QuizResultsView = React.memo(({
  marks,
  qnsLength,
  passMark,
  thisQuiz,
  currentUser,
  categories,
  isReviewModalOpen,
  reviewText,
  rating,
  isSubmitting,
  error,
  handleReviewSubmit,
  setReviewText,
  setRating,
  toggleReviewModal,
  formatDate,
  calculatePercentage,
}: QuizResultsViewProps) => (
  <div className="quiz-results">
    <div className="results-header text-center mb-4">
      <h2>Quiz Results</h2>
      <p className="lead">Your performance summary</p>
    </div>

    <div className="score-summary mb-5">
      <MarksStatus
        marks={marks}
        qnsLength={qnsLength}
        passMark={passMark}
      />
      
      <div className="text-center mt-4">
        <Button color="primary" onClick={toggleReviewModal}>
          {currentUser ? 'Leave a Review' : 'Login to Leave a Review'}
        </Button>
      </div>
    </div>

    {/* Additional quiz details and review form */}
    <Suspense fallback={<QBLoadingSM />}>
      <ReviewForm
        isOpen={isReviewModalOpen}
        toggle={toggleReviewModal}
        onSubmit={handleReviewSubmit}
        reviewText={reviewText}
        setReviewText={setReviewText}
        rating={rating}
        setRating={setRating}
        isSubmitting={isSubmitting}
        error={error}
      />

      <SimilarQuizes currentQuizId={thisQuiz?._id} categoryId={thisQuiz?.category} />
      <RelatedNotes quizId={thisQuiz?._id} />
    </Suspense>
  </div>
));

QuizResultsView.displayName = 'QuizResultsView';

const QuizResults: React.FC = () => {
  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggleL } = React.useContext(logRegContext);
  
  // State
  const [state, setState] = useState<Omit<QuizResultsState, 'isMounted'>>({
    isReviewModalOpen: false,
    reviewText: '',
    rating: 5,
    isSubmitting: false,
    error: null,
  });
  const [isMounted, setIsMounted] = useState(false);

  // Selectors
  const auth = useSelector((state: any) => state.auth);
  const currentUser = auth?.user || null;
  const categories = useSelector((state: any) => state.categories?.categories || []);

  // Extract data from location state with proper type checking
  const locationState = location.state as QuizResultsProps | null;
  const {
    newScoreId,
    score = 0,
    qnsLength = 0,
    thisQuiz = null,
    quizToReview = null,
    passMark = 50,
    mongoScoreId,
  } = locationState || {};

  // Memoized values
  const marks = useMemo(() => (isNaN(score) ? 0 : score), [score]);
  
  // Check if component is mounted
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Validate required data
  useEffect(() => {
    if (!locationState) {
      toast.error('Invalid quiz results data. Please try again.');
      navigate('/quizzes');
    }
  }, [locationState, navigate]);

  // Handlers
  const toggleReviewModal = useCallback(() => {
    if (!currentUser) {
      toggleL();
      return;
    }
    setState(prev => ({
      ...prev,
      isReviewModalOpen: !prev.isReviewModalOpen,
      error: null,
    }));
  }, [currentUser, toggleL]);

  const handleReviewSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!currentUser || !thisQuiz?._id) return;
      
      setState(prev => ({ ...prev, isSubmitting: true, error: null }));

      try {
        await dispatch(
          saveFeedback({
            quiz: thisQuiz._id,
            user: currentUser._id,
            rating: state.rating,
            text: state.reviewText,
          })
        ).unwrap();

        if (isMounted) {
          setState(prev => ({
            ...prev,
            isReviewModalOpen: false,
            reviewText: '',
            rating: 5,
            isSubmitting: false,
          }));
          toast.success('Thank you for your review!');
        }
      } catch (error: any) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: error.message || 'Failed to submit review',
            isSubmitting: false,
          }));
        }
      }
    },
    [currentUser, dispatch, isMounted, state.rating, state.reviewText, thisQuiz?._id]
  );

  // Utility functions
  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const calculatePercentage = useCallback((obtained: number, total: number): number => {
    return total > 0 ? Math.round((obtained / total) * 100) : 0;
  }, []);

  // Early return if no quiz data
  if (!locationState) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <h4>No quiz results found</h4>
          <Button color="primary" onClick={() => navigate('/quizzes')}>
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<QBLoadingSM />}>
        <QuizResultsView
          marks={marks}
          qnsLength={qnsLength}
          passMark={passMark}
          thisQuiz={thisQuiz}
          currentUser={currentUser}
          categories={categories}
          isReviewModalOpen={state.isReviewModalOpen}
          reviewText={state.reviewText}
          rating={state.rating}
          isSubmitting={state.isSubmitting}
          error={state.error}
          handleReviewSubmit={handleReviewSubmit}
          setReviewText={(text) => setState(prev => ({ ...prev, reviewText: text }))}
          setRating={(rating) => setState(prev => ({ ...prev, rating }))}
          toggleReviewModal={toggleReviewModal}
          formatDate={formatDate}
          calculatePercentage={calculatePercentage}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default React.memo(QuizResults);
