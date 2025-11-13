// import { createContext, useState, useEffect } from 'react'
// import axios from 'axios'

// export const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const token = localStorage.getItem('token')
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
//       axios.get('/api/auth/me')
//         .then(res => setUser(res.data))
//         .catch(() => localStorage.removeItem('token'))
//         .finally(() => setLoading(false))
//     } else {
//       setLoading(false)
//     }
//   }, [])

//   const login = async (email, password) => {
//     const res = await axios.post('/api/auth/login', { email, password })
//     localStorage.setItem('token', res.data.token)
//     axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
//     setUser(res.data.user)
//   }

//   const logout = () => {
//     localStorage.removeItem('token')
//     delete axios.defaults.headers.common['Authorization']
//     setUser(null)
//   }

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

// Backend API Base URL from .env.production
const API = import.meta.env.VITE_API_URL

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      axios
        .get(`${API}/api/auth/me`)
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password })

    localStorage.setItem('token', res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`

    setUser(res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
