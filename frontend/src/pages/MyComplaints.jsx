import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import ComplaintCard from '../components/ComplaintCard'
import Pagination from '../components/Pagination'

// 🔥 Backend API URL
const API = import.meta.env.VITE_API_URL

export default function MyComplaints() {
  const { user } = useContext(AuthContext)
  const [complaints, setComplaints] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    if (!user) return;

    // 🔥 FIXED API URL
    axios.get(`${API}/api/complaints?page=${page}`)
      .then(res => {
        setComplaints(res.data.complaints)
        setPages(res.data.pages)
      })
      .catch(err => console.error("Error loading complaints:", err))
  }, [page, user])

  if (!user) return <p>Please login.</p>

  return (
    <div>
      <h2>My Complaints</h2>
      {complaints.map(c => <ComplaintCard key={c.id} complaint={c} />)}

      <Pagination 
        page={page} 
        pages={pages} 
        onPageChange={setPage} 
      />
    </div>
  )
}
