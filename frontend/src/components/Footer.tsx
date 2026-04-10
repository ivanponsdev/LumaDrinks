/*Footer*/
export default function Footer() {
  return (
    <footer className="bg-brand-surface border-t border-brand-muted/20 py-16 px-10">
      <div className="container mx-auto max-w-4xl text-center space-y-8">
        
        {/* Título de Sección */}
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 text-brand-primary">Contacto</h2>
          <div className="w-12 h-1 bg-brand-accent mx-auto"></div>
        </div>

        {/* Email de Contacto */}
        <div className="text-lg font-medium">
          <a href="mailto:hola@lumadrinks.com" className="hover:underline">
            hola@lumadrinks.com
          </a>
        </div>

        {/* Redes Sociales (Logos provisionales) */}
        <div className="flex justify-center space-x-8 text-2xl">
          <a href="#" className="hover:scale-110 transition-transform" title="Instagram">
            📸 <span className="text-sm block font-bold">Instagram</span>
          </a>
          <a href="#" className="hover:scale-110 transition-transform" title="WhatsApp">
            💬 <span className="text-sm block font-bold">WhatsApp</span>
          </a>
        </div>

        {/* Copyright y marca */}
        <div className="pt-8 border-t border-brand-muted/20 text-brand-muted text-xs tracking-widest uppercase">
          <p>© {new Date().getFullYear()} LUMA DRINKS - OPTIMIZA TU MENTE</p>
          <p className="mt-2 text-[10px]">Todos los derechos reservados</p>
        </div>

      </div>
    </footer>
  );
}