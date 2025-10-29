import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import ComplaintCard from '../components/ComplaintCard'
import io from 'socket.io-client'

export default function AdminDashboard() {
  const { user } = useContext(AuthContext)
  const [complaints, setComplaints] = useState([])

  useEffect(() => {
    if (user?.role !== 'admin') return
    axios.get('/api/complaints').then(res => setComplaints(res.data.complaints))

    const socket = io('http://localhost:5000')
    socket.on('complaintAdded', (c) => setComplaints(prev => [c, ...prev]))
    socket.on('statusUpdated', (c) => {
      setComplaints(prev => prev.map(p => p.id === c.id ? c : p))
    })

    return () => socket.disconnect()
  }, [user])

  const updateStatus = (id, status) => {
    axios.patch(`/api/complaints/${id}/status`, { status })
  }

  if (user?.role !== 'admin') return <p>Access denied.</p>

  return (
    <div>
      <h2>Admin Panel</h2>
      {complaints.map(c => (
        <ComplaintCard key={c.id} complaint={c} onStatusChange={updateStatus} />
      ))}
    </div>
  )
}