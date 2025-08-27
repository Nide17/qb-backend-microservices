import React, { useEffect, useState } from 'react'
import { get50NewUsers, getAllUsers, getUsersWithImage, getUsersWithSchool, getUsersWithLevel, getUsersWithFaculty, getUsersWithInterests, getUsersWithAbout, getTop100Quizzing, getTop100Downloaders, getTop20Quizzes, getQuizzesStats, getTop20Notes, getNotesStats, getQuizCategoriesStats, getNotesCategoriesStats } from '../../../../redux/slices/statisticsSlice'
import { useDispatch, useSelector } from 'react-redux'
import TableData from '../TableData'
import QBLoadingSM from '../../../rLoading/QBLoadingSM'
import { useLocation } from "react-router-dom"

const UsersStats = () => {

    // Redux
    const stats = useSelector(state => state.statistics)
    const dispatch = useDispatch()

    const [usersStats, setUsersStats] = useState([])
    const [usersStatsLoading, setUsersStatsLoading] = useState(false)

    // set the current route
    const location = useLocation()

    // Lifecycle method to get the data according to the current route on mount
    useEffect(() => {
        switch (location.pathname) {

            case "/statistics/new-50-users":
                dispatch(get50NewUsers())
                break

            case "/statistics/all-users":
                dispatch(getAllUsers())
                break

            case "/statistics/with-image":
                dispatch(getUsersWithImage())
                break

            case "/statistics/with-school":
                dispatch(getUsersWithSchool())
                break

            case "/statistics/with-level":
                dispatch(getUsersWithLevel())
                break

            case "/statistics/with-faculty":
                dispatch(getUsersWithFaculty())
                break

            case "/statistics/with-interests":
                dispatch(getUsersWithInterests())
                break

            case "/statistics/with-about":
                dispatch(getUsersWithAbout())
                break

            case "/statistics/top-100-quizzing":
                dispatch(getTop100Quizzing())
                break

            case "/statistics/top-100-downloaders":
                dispatch(getTop100Downloaders())
                break

            case "/statistics/top-20-quizzes":
                dispatch(getTop20Quizzes())
                break

            case "/statistics/quizzes-stats":
                dispatch(getQuizzesStats())
                break

            case "/statistics/top-20-notes":
                dispatch(getTop20Notes())
                break

            case "/statistics/notes-stats":
                dispatch(getNotesStats())
                break

            case "/statistics/quiz-categories-stats":
                dispatch(getQuizCategoriesStats())
                break

            case "/statistics/notes-categories-stats":
                dispatch(getNotesCategoriesStats())
                break

            default:
                break
        }
    }, [dispatch, location])

    // Updating the state according to the current route and the data returned from the server
    useEffect(() => {
        switch (location.pathname) {

            case "/statistics/new-50-users":
                setUsersStats(stats.new50Users)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/all-users":
                setUsersStats(stats.allUsers)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/with-image":
                setUsersStats(stats.usersWithImage)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/with-school":
                setUsersStats(stats.usersWithSchool)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/with-level":
                setUsersStats(stats.usersWithLevel)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/with-faculty":
                setUsersStats(stats.usersWithFaculty)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/with-interests":
                setUsersStats(stats.usersWithInterests)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/with-about":
                setUsersStats(stats.usersWithAbout)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/top-100-quizzing":
                setUsersStats(stats.top100Quizzing)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/top-100-downloaders":
                setUsersStats(stats.top100Downloaders)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/top-20-quizzes":
                setUsersStats(stats.top20Quizzes)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/quizzes-stats":
                setUsersStats(stats.quizzesStats)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/top-20-notes":
                setUsersStats(stats.top20Notes)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/notes-stats":
                setUsersStats(stats.notesStats)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/quiz-categories-stats":
                setUsersStats(stats.quizCategoriesStats)
                setUsersStatsLoading(stats.isLoading)
                break

            case "/statistics/notes-categories-stats":
                setUsersStats(stats.notesCategoriesStats)
                setUsersStatsLoading(stats.isLoading)
                break

            default:
                break
        }
    }, [location, stats])

    // Generate filename 
    const filename = location.pathname.split("/")[2]

    return (
        <div style={{ position: "relative" }} className="p-1 m-1 d-flex justify-content-center align-items-center overflow-auto">

            {usersStatsLoading && usersStatsLoading ?

                <div className="vh-100 d-flex justify-content-center align-items-center">
                    <QBLoadingSM />
                </div> :

                <div className="w-100 ">
                    {
                        usersStats && usersStats.length > 0 ?
                            <TableData data={usersStats} filename={filename} /> :

                            <div className="p-1 m-1 d-flex justify-content-center align-items-center">
                                No data to display yet!
                            </div>
                    }
                </div>
            }
        </div>
    )
}

export default UsersStats