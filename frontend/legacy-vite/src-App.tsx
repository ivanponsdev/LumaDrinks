// Archived App.tsx (original Vite entry)
import { useEffect, useState } from 'react'
import { getProducts } from '../src/services/api'

function App() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error)
  }, [])

  return (
    <div>Archived App</div>
  )
}

export default App
