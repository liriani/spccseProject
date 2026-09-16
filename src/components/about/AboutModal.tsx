import { motion } from 'framer-motion'

// ─── About Modal (Sobre el proyecto) ─────────────────────────────────────────

export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.7)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: '4px solid #1A1A2E', background: '#FFFBF0', boxShadow: '8px 8px 0 #1A1A2E' }}
        >
          {/* Hero */}
          <div
            className="px-7 pt-7 pb-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF4B4B15 0%, #CE82FF15 100%)' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl border-2 border-[#1A1A2E] flex items-center justify-center font-black text-lg hover:bg-[#1A1A2E]/10 transition-colors"
              style={{ boxShadow: '2px 2px 0 #1A1A2E' }}
            >
              ×
            </button>
            <div className="text-4xl mb-3">🇪🇸</div>
            <h2 className="font-black text-[#1A1A2E] text-xl mb-0.5" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Sobre el Proyecto
            </h2>
            <p className="text-xs font-bold text-[#1A1A2E]/50 uppercase tracking-widest">Prueba CCSE · Español para siempre</p>
          </div>

          {/* Content */}
          <div className="px-7 py-5 space-y-4 max-h-[55vh] overflow-y-auto">
            {/* What it is */}
            <div
              className="rounded-2xl p-4"
              style={{ border: '2px solid #1A1A2E', background: '#FFC80018', boxShadow: '3px 3px 0 #FFC800' }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]/50 mb-1.5">¿Qué es esto? 📚</p>
              <p className="text-sm text-[#1A1A2E] font-semibold leading-relaxed">
                Una herramienta gratuita para preparar el examen <strong>CCSE</strong> (Conocimientos Constitucionales y Socioculturales de España), requisito para la nacionalidad española.
              </p>
            </div>

            {/* How to use */}
            <div
              className="rounded-2xl p-4"
              style={{ border: '2px solid #1A1A2E', background: '#1CB0F618', boxShadow: '3px 3px 0 #1CB0F6' }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]/50 mb-2">¿Cómo usarla? 🗺️</p>
              <div className="space-y-1.5">
                {[
                  ['1', 'Elige un módulo en el menú lateral'],
                  ['2', 'Lee la teoría y los datos clave'],
                  ['3', 'Practica con los ejercicios interactivos'],
                  ['4', 'Sigue tu progreso con las insignias 🏅'],
                ].map(([n, text]) => (
                  <div key={n} className="flex items-start gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5"
                      style={{ background: '#1CB0F6' }}
                    >
                      {n}
                    </span>
                    <p className="text-sm text-[#1A1A2E] font-semibold">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div
              className="rounded-2xl p-4"
              style={{ border: '2px solid #1A1A2E', background: '#58CC0215', boxShadow: '3px 3px 0 #58CC02' }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]/50 mb-1.5">Contacto & Sugerencias 💬</p>
              <p className="text-sm text-[#1A1A2E] font-semibold leading-relaxed">
                ¿Encontraste un error o tienes una sugerencia? ¿Encontraste un error o tienes una sugerencia? Escríbeme a{' '}
                <a
                  href="mailto:its.liriani@gmail.com"
                  className="font-black underline decoration-dotted"
                  style={{ color: '#58CC02' }}
                >
                  its.liriani@gmail.com
                </a>
              </p>
            </div>

            {/* Thank you */}
            <div
              className="rounded-2xl p-4 text-center"
              style={{ border: '2px solid #1A1A2E', background: '#FF4B4B12', boxShadow: '3px 3px 0 #FF4B4B' }}
            >
              <p className="text-2xl mb-2">❤️</p>
              <p className="text-sm text-[#1A1A2E] font-bold leading-relaxed">
                Gracias por usar esta herramienta. Fue hecha con <strong>mucho amor</strong> para ayudarte a cumplir tu sueño. ¡Tú puedes!
              </p>
              <p className="text-xs text-[#1A1A2E]/40 font-semibold mt-2 uppercase tracking-wider">Hecho con ❤️ para la comunidad</p>
            </div>
          </div>

          {/* Close button */}
          <div className="px-7 pb-6">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl font-black text-sm text-white border-2 border-[#1A1A2E] transition-all hover:scale-[1.02]"
              style={{ background: '#FF4B4B', boxShadow: '4px 4px 0 #1A1A2E' }}
            >
              ¡Entendido, a estudiar! 📖
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
