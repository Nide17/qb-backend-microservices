import React, { useEffect } from "react";
import { Chart } from "react-google-charts"
import { getDailyUserRegistration } from '../../../redux/slices/statisticsSlice'
import { useDispatch, useSelector } from "react-redux"
import QBLoadingSM from '../../rLoading/QBLoadingSM'

const options = {
    chart: {
        title: "USER REGISTRATION STATISTICS",
        subtitle: "Daily registration counts",
    },
    hAxis: {
        title: "DATE",
        format: "dd/MM/yyyy",
        viewWindow: {
            min: [7, 30, 0],
            max: [17, 30, 0]
        }
    },
    vAxis: {
        title: "USERS",
        viewWindow: {
            min: [0],
            max: [10]
        }
    },
    legend: "user registration",
    backgroundColor: "#f1f8e9",
    colors: ["#1b5e20"],
    animation: {
        startup: true,
        duration: 1000,
        easing: "out",
    },
};

const Charts = () => {

    const dispatch = useDispatch()
    const dailyReg = useSelector(state => state.statistics)

    useEffect(() => { dispatch(getDailyUserRegistration()) }, [dispatch])
    const dataSet = dailyReg && dailyReg.dailyUserRegistration && dailyReg.dailyUserRegistration.usersStats

    // Convert the array of objects to an array of arrays for the chart by only picking the date and the number of users
    let titles = ["DATE", "USERS"]
    let userData = dataSet && dataSet.map(user => [user.date, user.users])

    // Add the titles to the beginning of the array and the data one by one to the end of the array
    let data = userData && [titles, ...userData]

    return (

        dailyReg.isDailyUserRegistrationLoading ?
            <QBLoadingSM title='User Registration Statistics' /> :

            <div className="p-3 mt-5 bg-warning text-info border rounded">
                <Chart
                    chartType="Line"
                    width="100%"
                    height="400px"
                    data={data}
                    options={options}
                />
            </div>

    );
}

export default Charts