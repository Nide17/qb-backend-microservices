import axios from 'axios'
import { notify } from '../utils/notifyToast'

export const qbURL = 'https://myqb-245fdbd30c9b.herokuapp.com/'
export const qbTestURL = 'https://qb-test-c6396eeaa356.herokuapp.com/'
export const qbApiGateway = 'https://qb-api-gateway-faaa805537e5.herokuapp.com/'
export const apiURL = 'https://quiz-blog-rw-server.onrender.com/'
export const devApiURL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/'

// Axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.NODE_ENV === 'development' ? devApiURL : (qbApiGateway || qbURL),
    // baseURL : qbTestURL,
})

// List of action types that doesn't require a reload
const reloadActionTypes = ['verify', 'login', 'changeStatus']
const noToastActionTypes = ['loadUser', 'createBlogPostView']

// Default reload timeout
const RELOAD_TIMEOUT = 4000

// API call helper function to make async actions with createAsyncThunk
export const apiCallHelper = async (url, method, body, getState, actionType) => {
    try {
        const headers = { 'Content-Type': 'application/json', 'x-auth-token': getState().auth.token }
        const response = await axiosInstance[method](url, method === 'get' || method === 'delete' ? { headers } : body, { headers })

        if ((response.status === 200 || response.status === 201) && method !== 'get') {

            if (reloadActionTypes.includes(actionType)) {
                setTimeout(() => { window.location.reload() }, RELOAD_TIMEOUT)
            }
            else {
                if (!noToastActionTypes.includes(actionType)) {
                    notify(response.data.error ? response.data.error : response.data.msg ? response.data.msg : '✅ Success', 'success')
                }
            }
        }

        return response.data
    } catch (err) {
        if (err.response && err.response.data && err.response.data.error && !noToastActionTypes.includes(actionType)) {
            console.log(err.response.data)
            notify(err.response.data.error, 'error')
            if (err.response.data.id == 'CONFIRM_ERR') {
                return Promise.reject(err.response.data.id)
            }
        }
        return Promise.reject(err.response.data.error)
    }
}

// API call helper function to make async actions with createAsyncThunk for file uploads
export const apiCallHelperUpload = async (url, method, formData, getState, actionType) => {
    try {
        const response = await axiosInstance[method](url, formData, {
            headers: { 'x-auth-token': getState().auth.token },
        })

        if ((response.status === 200 || response.status === 201) && reloadActionTypes.includes(actionType)) {
            setTimeout(() => { window.location.reload() }, RELOAD_TIMEOUT)
        }

        return response.data
    } catch (err) {
        if (err.response && err.response.data && err.response.data.error && !noToastActionTypes.includes(actionType)) {
            notify(err.response.data.error, 'error')
        }
        return Promise.reject(err.response.data.error)
    }
}


export const handlePending = (state) => {
    state.isLoading = true;
};

export const handleRejected = (state) => {
    state.isLoading = false;
};
