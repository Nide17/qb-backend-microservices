import React, { useEffect, lazy, Suspense, useState, useCallback } from 'react'
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { Toast } from 'reactstrap'
import ReactGA from "react-ga4"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { logRegContext } from './appContexts'
import { getCategories, getCourseCategories, getLandingDisplayNotes, loadUser } from './redux/slices'
import { useSelector, useDispatch } from "react-redux"
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import Unsubscribe from './components/auth/Unsubscribe'
import EditProfile from './components/auth/EditProfile'
import Subscribers from './components/users/Subscribers'
import Contact from './components/contacts/Contact'
import ChatWrapper from './components/contacts/ChatWrapper'
import FaqCollapse from './components/faqs/FaqCollapse'
import About from './components/about/About'
import Privacy from './components/others/Privacy'
import Disclaimer from './components/others/Disclaimer'
import NotFound404 from './components/others/NotFound404'
import QBLoading from './components/rLoading/QBLoading'
import SingleCategory from './components/categories/SingleCategory'
import AllCategories from './components/categories/AllCategories'
import QuizQuestions from './components/quizes/QuizQuestions'
import QuizResults from './components/quizes/questionsScore/QuizResults'
import GetReady from './components/quizes/GetReady'
import ReviewQuiz from './components/quizes/review/ReviewQuiz'
import QuizRanking from './components/quizes/QuizRanking'
import CreateQuestions from './components/questions/CreateQuestions'
import SingleQuestion from './components/questions/SingleQuestion'
import EditQuestion from './components/questions/EditQuestion'
import Broadcasts from './components/broadcasts/Broadcasts'
import Dashboard from './components/dashboard/Dashboard'
import Index from './components/courseNotes/Index'
import ViewCourse from './components/courseNotes/ViewCourse'
import SchoolsLanding from './components/schools/SchoolsLanding'
import AllBlogPosts from './components/blog/public/AllBlogPosts'
import AddBlogPost from './components/blog/blogPosts/AddBlogPost'
import EditBlogPost from './components/blog/blogPosts/EditBlogPost'
import ViewBlogPost from './components/blog/public/ViewBlogPost'
import ByCategory from './components/blog/public/ByCategory'
import UsersStats from './components/statistics/content/users/UsersStats'
import BlogStats from './components/statistics/content/blogposts/BlogStats'
import Verify from './components/auth/Verify'

const Header = lazy(() => import('./components/header/Header'))
const Footer = lazy(() => import('./components/footer/Footer'))
const Statistics = lazy(() => import('./components/statistics/Statistics'))
const Posts = lazy(() => import('./components/posts/Posts'))
const AllPosts = lazy(() => import('./components/posts/AllPosts'))
const ViewNotePaper = lazy(() => import('./components/posts/notes/ViewNotePaper'))

ReactGA.initialize('G-GXLLDMB41B', {
    debug: true,
    gaOptions: { siteSpeedSampleRate: 100 }
})

const App = () => {

    const location = useLocation()
    const dispatch = useDispatch()
    const [isOpenL, setIsOpenL] = useState(false)
    const [isOpenR, setIsOpenR] = useState(false)
    const [modal, setModal] = useState(false)
    const [percentage, setPercentage] = useState(0)

    const toggleL = useCallback(() => {
        setIsOpenR(false)
        setIsOpenL(prevIsOpenL => !prevIsOpenL)
    }, [])

    const toggleR = useCallback(() => {
        setIsOpenL(false)
        setIsOpenR(prevIsOpenR => !prevIsOpenR)
    }, [])

    const toggle = () => setModal(!modal)

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: location.pathname + location.search, title: `${location.pathname + location.search}` });
    }, [location])

    useEffect(() => {
        dispatch(loadUser())
        dispatch(getCategories())
        dispatch(getCourseCategories())
        dispatch(getLandingDisplayNotes())
    }, [dispatch])

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const categories = useSelector(state => state.categories)
    const courseCategories = useSelector(state => state.courseCategories)

    useEffect(() => {

        if (currentUser) {

            const NonEmptyFields = Object.keys(currentUser).filter(key => currentUser[key]).length
            const percent = (NonEmptyFields - 4) * 10

            if (percent > 0 && percent < 100) {

                setPercentage(percent)
                setModal(true)
            }
        }
    }, [currentUser])

    return (
        <logRegContext.Provider value={{ isOpenL, toggleL, isOpenR, toggleR }}>
            <Suspense fallback={<QBLoading />}>
                <Toast isOpen={modal} className={`w-100 popup-toast`}>
                    <div className="bg-warning py-2 px-3 d-flex justify-content-between align-items-center">
                        <p className='text-danger text-center fw-bolder d-block mb-0'>
                            &nbsp;&nbsp;Your profile is {`${percentage}`} % up to date!
                            &nbsp;&nbsp;
                            <Link to={`/edit-profile/${auth.user && auth.user._id}`}>
                                <strong className='px-1' style={{ color: '#157A6E', textDecoration: 'underline' }}>
                                    Consider updating ...
                                </strong>
                            </Link>
                        </p>
                        <button onClick={toggle} className="btn btn-sm btn-danger ms-2">
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                </Toast>
                <Header />
                <Routes fallback={<QBLoading />}>
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/disclaimer" element={<Disclaimer />} />
                    <Route path="/unsubscribe" element={<Unsubscribe />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify" element={<Verify />} />
                    <Route exact path="/category/:categoryId" element={<SingleCategory />} />
                    <Route exact path="/edit-profile/:userId" element={<EditProfile />} />
                    <Route exact path="/view-quiz/:quizSlug" element={<GetReady />} />
                    <Route exact path="/attempt-quiz/:quizSlug" element={<QuizQuestions />} />
                    <Route exact path="/quiz-results/:quizSlug" element={<QuizResults />} />
                    <Route exact path="/view-question/:questionID" element={<SingleQuestion />} />
                    <Route exact path="/edit-question/:questionID" element={<EditQuestion />} />
                    <Route exact path="/review-quiz/:reviewId" element={<ReviewQuiz />} />
                    <Route exact path="/quiz-ranking/:quizID" element={<QuizRanking />} />
                    <Route exact path="/questions-create/:quizSlug" element={<CreateQuestions />} />
                    <Route exact path="/contact" element={<Contact />} />
                    <Route exact path="/contact-chat" element={<ChatWrapper />} />
                    <Route exact path="/faqs" element={<FaqCollapse />} />
                    <Route path="/all-categories" element={<AllCategories />} />
                    <Route path="/course-notes" element={<Index />} />
                    <Route exact path="/view-course/:courseId" element={<ViewCourse />} />
                    <Route exact path="/schools" element={<SchoolsLanding />} />
                    <Route exact path="/subscribers" element={<Subscribers />} />
                    <Route exact path="/broadcasts" element={<Broadcasts />} />
                    <Route exact path="/blog" element={<AllBlogPosts />} />
                    <Route exact path="/blog/:bPCatID" element={<ByCategory />} />
                    <Route exact path="/create-bpost/:bPCatID" element={<AddBlogPost />} />
                    <Route exact path="/edit-bpost/:bPSlug" element={<EditBlogPost />} />
                    <Route exact path="/view-blog-post/:bPSlug" element={<ViewBlogPost />} />
                    <Route path="/ads.txt" element={<div>google.com, pub-8918850949540829, DIRECT, f08c47fec0942fa0</div>} />
                    <Route exact path="/" element={<Posts toggleR={toggleR} />} />
                    <Route exact path="/allposts" element={<AllPosts />} />
                    <Route exact path="/view-note-paper/:noteSlug" element={<ViewNotePaper />} />
                    <Route exact path="/dashboard" element={<Dashboard />} />
                    <Route exact path="/statistics" element={<Statistics />}>
                        <Route path="/statistics/new-50-users" element={<UsersStats />} />
                        <Route path="/statistics/with-image" element={<UsersStats />} />
                        <Route path="/statistics/with-school" element={<UsersStats />} />
                        <Route path="/statistics/with-level" element={<UsersStats />} />
                        <Route path="/statistics/with-faculty" element={<UsersStats />} />
                        <Route path="/statistics/with-interests" element={<UsersStats />} />
                        <Route path="/statistics/with-about" element={<UsersStats />} />
                        <Route path="/statistics/all-users" element={<UsersStats />} />
                        <Route path="/statistics/top-100-quizzing" element={<UsersStats />} />
                        <Route path="/statistics/top-100-downloaders" element={<UsersStats />} />
                        <Route path="/statistics/top-20-quizzes" element={<UsersStats />} />
                        <Route path="/statistics/quizzes-stats" element={<UsersStats />} />
                        <Route path="/statistics/top-20-notes" element={<UsersStats />} />
                        <Route path="/statistics/notes-stats" element={<UsersStats />} />
                        <Route path="/statistics/quiz-categories-stats" element={<UsersStats />} />
                        <Route path="/statistics/notes-categories-stats" element={<UsersStats />} />
                        <Route path="/statistics/recent-ten-views" element={<BlogStats />} />
                        <Route path="/statistics/all-posts-views" element={<BlogStats />} />
                    </Route>
                    <Route path="/*" element={<NotFound404 />} />
                </Routes>
                <ToastContainer limit={2} style={{ fontSize: '0.8rem', textAlign: 'left' }} />
                <Footer />
            </Suspense>
        </logRegContext.Provider>
    )
}

export default App
