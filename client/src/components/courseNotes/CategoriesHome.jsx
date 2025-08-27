import React, { lazy, Suspense, useContext } from 'react'
import { Button } from 'reactstrap'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { logRegContext } from '../../appContexts'
import { useSelector } from 'react-redux'

const GridMultiplex = lazy(() => import('../adsenses/GridMultiplex'))

const CategoriesHome = () => {

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const isAuthenticated = useSelector(state => state.auth && state.auth.isAuthenticated)
    const { toggleL } = useContext(logRegContext)

    return (
        isAuthenticated ?
            <>
                <div className="text-center rounded px-3 px-sm-4 py-3 py-sm-5 mx-3 d-flex justify-content-center align-items-center flex-column">
                    <h3 className="fw-bolder my-lg-4" style={{ color: "#157A6E" }}>
                        Hello, {currentUser && currentUser ? currentUser.name : ''}!
                    </h3>

                    <p className="lead">
                        Discover the user-friendly courses and resource portal at Quiz-Blog, where you can access a vast array of valuable information to enhance your learning and achieve academic success.
                    </p>

                    <p className="text-muted">
                        With its well-organized categories, you can seamlessly choose the content you require through the navigation, making it effortless to access and download any resource, thus enhancing your overall learning experience.
                    </p>

                    <div className="my-5" style={{ color: "#157A6E" }}>
                        <p className="fw-bolder mt-2 mb-0 fw-bolder">
                            It does not matter where you go and what you study, what matters most is what you share with yourself and the world.
                        </p>
                        <small className="d-block fst-italic">~Santosh Kalwar~</small>
                    </div>

                    <p className="share-text">
                        <i className="fa fa-share-alt"></i> &nbsp; So, if you find this interesting, please don't forget to share it with your friends via social media or any other means you prefer.
                    </p>

                    <Button style={{ backgroundColor: "#157A6E" }} className="ms-1 py-1 px-2 mb-0 share-btn">
                        <i className="fa-brands fa-whatsapp"></i>&nbsp;
                        <a className="text-white" href={`https://api.whatsapp.com/send?phone=whatsappphonenumber&text=View course notes shared by Quiz-Blog by logging on
                        \nhttps://www.quizblog.rw/course-notes`}>Share</a>
                    </Button>
                </div>

                {/* GridMultiplex Ad in a Suspense */}
                <Suspense fallback={<QBLoadingSM />}>
                    {process.env.NODE_ENV !== 'development' ? <GridMultiplex /> : null}
                </Suspense>


            </> :

            // If not authenticated or loading
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {
                    auth.isLoading ?
                        <QBLoadingSM /> :
                        <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                            Login first
                        </Button>
                }
            </div>
    );
};

export default CategoriesHome;