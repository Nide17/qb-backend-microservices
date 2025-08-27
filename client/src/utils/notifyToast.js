import { toast } from 'react-toastify'

export const notify = (message, status) => {

    if (status === 'error') {
        toast.error(message, { position: "bottom-center", autoClose: 10000, hideProgressBar: true, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined });
    }
    else {
        toast.success(message, { position: "bottom-center", autoClose: 10000, hideProgressBar: true, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined });
    }
}