import { io } from 'socket.io-client'

export const qbURL = 'https://myqb-245fdbd30c9b.herokuapp.com/'
export const qbTestURL = 'https://qb-test-c6396eeaa356.herokuapp.com/'
export const qbContactsAPI = 'https://qb-contacts-service-156b2230ac4f.herokuapp.com/'
export const apiURL = 'https://quiz-blog-rw-server.onrender.com/'
export const devApiURL = import.meta.env.VITE_REACT_APP_CONTACTS_URL || 'http://localhost:5008/'

const serverUrl = import.meta.env.NODE_ENV === 'development' ? devApiURL : (qbContactsAPI || qbURL || apiURL)
// const serverUrl = qbTestURL

export const socket = io(serverUrl);
