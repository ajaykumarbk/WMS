import { useState, useEffect } from 'react'
import axios from 'axios'
import Pagination from '../components/Pagination'

export default function RecyclingTips() {
  const [tips, setTips] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    axios.get(`/api/tips?page=${page}`).then(res => {
      setTips(res.data.tips)
      setPages(res.data.pages)
    })
  }, [page])

  return (
    <div>
      <h2>Recycling Tips</h2>
      {tips.map(tip => (
        <div key={tip.id} className="card">
          <h3>{tip.title}</h3>
          <p>{tip.content}</p>
        </div>
      ))}
      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  )
}