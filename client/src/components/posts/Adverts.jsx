import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux"
import { getActiveAdverts } from '../../redux/slices/advertsSlice'
import adPlaceholder from '../../images/Einstein.jpg'

const Adverts = () => {

    // Redux hooks
    const adverts = useSelector(state => state.adverts)
    const allActiveAdverts = adverts && adverts.activeAdverts
    const [adShow, setAdShow] = useState()

    const dispatch = useDispatch()

    // Show each advert for 5 seconds before showing the next one in the array of adverts from the database. Do that repeatedly and continuously.
    const showAdverts = useCallback(() => {
        setAdShow(prevState => {
            if (isNaN(prevState)) {
                return 0
            }
            return (prevState + 1) % allActiveAdverts.length
        })
    }, [allActiveAdverts])

    // Lifecycle method
    useEffect(() => {
        dispatch(getActiveAdverts())
    }, [dispatch])

    // call showAdverts() every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            showAdverts()
        }, 10000)
        // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
        return () => clearInterval(interval)
    }, [showAdverts, adShow])

    const advertToDisplay = allActiveAdverts && allActiveAdverts[adShow]

    return (
        <div className='d-flex flex-column justify-content-center align-items-center mt-0'>
            {advertToDisplay ?
                <>
                    <Link to={advertToDisplay && advertToDisplay.link} target="_blank">
                        <img
                            src={advertToDisplay && advertToDisplay.advert_image} alt="Quiz-Blog Rwanda"
                            style={{ maxWidth: "92%", border: '2px solid #157A6E', borderRadius: '5px' }} />
                    </Link>
                    <p className="mt-2 mb-0 p-1 text-center" style={{ maxWidth: "92%", background: "rgb(255, 193, 7)", fontSize: "1vw", fontWeight: "bold", border: "2px solid #157A6E", borderRadius: '5px' }}>
                        {advertToDisplay && advertToDisplay.caption}
                    </p>
                </> :

                <>
                    <img
                        src={adPlaceholder && adPlaceholder} alt="Quiz-Blog Rwanda"
                        style={{ maxWidth: "92%", border: '2px solid #157A6E', borderRadius: '5px' }} />
                    <p className="mt-2 mb-0 p-1 text-center" style={{ maxWidth: "92%", background: "rgb(255, 193, 7)", fontSize: "1vw", fontWeight: "bold", border: "2px solid #157A6E", borderRadius: '5px' }}>
                        "Welcome to Quiz-Blog. Take and review any multiple choice questions quiz you want from Quiz-Blog."
                    </p>
                </>}
        </div>
    )
}

export default Adverts