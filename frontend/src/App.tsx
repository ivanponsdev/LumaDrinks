/*App.tsx*/
import { useEffect, useState } from 'react'
import { getProducts } from './services/api'

function App() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen p-4 md:p-10">
      {/* Header */}
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          LUMA DRINKS
        </h1>
        <p className="text-gray-400 mt-2 italic">Upgrade your focus ⚡</p>
      </header>

      {/* Grid de Productos: 1 columna en móvil, 2 en tablet, 3 en PC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p: any) => (
          <div key={p.id} className="group bg-gray-900 border border-gray-800 p-1 rounded-3xl hover:border-cyan-500/50 transition-all duration-300 shadow-2xl">
            <div className="bg-gray-800 h-64 rounded-2xl mb-4 overflow-hidden relative">
               {/* Aquí irá la imagen de Supabase pronto */}
               <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest">
                 No Image
               </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold group-hover:text-cyan-400 transition-colors">{p.name}</h2>
                <span className="text-xl font-mono font-bold text-green-400">{p.price}€</span>
              </div>
              
              <p className="text-gray-400 text-sm line-clamp-2 mb-4">{p.description}</p>
              
              <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-cyan-400 transition-colors active:scale-95">
                Añadir al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App