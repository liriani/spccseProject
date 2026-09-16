import { useState } from 'react'

export function MediaCard({ gif, color }: { gif: { url: string; caption: string; emoji: string }; color: string }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col group"
      style={{ border: '3px solid #1A1A2E', boxShadow: '4px 4px 0 #1A1A2E' }}
    >
      {/* 16:9 media area */}
      <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%', background: color + '22' }}>
        {!loaded && !errored && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl animate-bounce">{gif.emoji}</span>
          </div>
        )}
        {!errored && (
          <img
            loading="lazy"
            src={gif.url}
            alt={gif.caption}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        )}
        {errored && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-5xl">{gif.emoji}</span>
            <p className="text-xs font-bold" style={{ color: 'rgba(26,26,46,0.4)' }}>Imagen no disponible</p>
          </div>
        )}
        {/* GIF badge */}
        {loaded && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 text-[0.58rem] font-black tracking-widest rounded-md text-white"
            style={{ background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(4px)' }}
          >
            GIF
          </div>
        )}
        {/* Hover shimmer */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 pointer-events-none" />
      </div>
      {/* Caption bar */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5"
        style={{ background: color + '18', borderTop: '1px solid rgba(26,26,46,0.08)' }}
      >
        <span className="text-base flex-shrink-0">{gif.emoji}</span>
        <p className="flex-1 text-[0.72rem] font-bold text-[#1A1A2E] leading-snug">{gif.caption}</p>
        <span className="flex-shrink-0 text-[0.52rem] font-black tracking-widest uppercase" style={{ color: 'rgba(26,26,46,0.2)' }}>GIPHY</span>
      </div>
    </div>
  )
}
