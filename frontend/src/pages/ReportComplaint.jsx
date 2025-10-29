import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ReportComplaint() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [location, setLocation] = useState({ latitude: '', longitude: '' })
  const [form, setForm] = useState({ title: '', description: '', category_id: '', image: null })

  useEffect(() => {
    axios.get('/api/complaints/categories').then(res => setCategories(res.data))

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }),
        () => alert('Location access denied')
      )
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('title', form.title)
    data.append('description', form.description)
    data.append('category_id', form.category_id)
    data.append('latitude', location.latitude)
    data.append('longitude', location.longitude)
    if (form.image) data.append('image', form.image)

    try {
      await axios.post('/api/complaints', data)
      alert('Complaint reported!')
      navigate('/my-complaints')
    } catch (err) {
      alert(err.response?.data?.message || 'Error')
    }
  }

  if (!user) return <p>Please <a href="/login">login</a> to report.</p>

  return (
    <div className="card">
      <h2>Report Waste Issue</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" onChange={e => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" rows="4" onChange={e => setForm({ ...form, description: e.target.value })} required />
        <select onChange={e => setForm({ ...form, category_id: e.target.value })} required>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files[0] })} />
        <p><strong>Location:</strong> {location.latitude || 'Getting...'}, {location.longitude || 'Getting...'}</p>
        <button type="submit">Submit Report</button>
      </form>
    </div>
  )
}