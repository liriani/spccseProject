import { useState } from 'react'
import type { Step } from '../../types'

export function AccordionItem({ step, index, color }: { step: Step; index: number; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '3px solid #1A1A2E', boxShadow: open ? `4px 4px 0 ${color}` : '3px 3px 0 #1A1A2E', transition: 'box-shadow 0.2s' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left"
        style={{ background: open ? color + '18' : '#fff' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
          style={{ background: color }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-[#1A1A2E] text-sm leading-tight">{step.title}</p>
          <p className="text-[#4B4B6B] text-xs leading-snug mt-0.5 font-semibold">{step.summary}</p>
        </div>
        <span
          className="flex-shrink-0 text-lg font-black text-[#1A1A2E] transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ⌄
        </span>
      </button>
      {open && (
        <div style={{ borderTop: '2px solid #1A1A2E', background: '#FFFBF0' }}>
          {step.imageUrl && (
            <img
              src={step.imageUrl}
              alt={step.title}
              className="w-full object-cover"
              style={{ maxHeight: '140px', borderBottom: '2px solid #1A1A2E' }}
            />
          )}
          <div className="p-4">
            <p className="text-[#1A1A2E] text-sm leading-relaxed">{step.detail}</p>
          </div>
        </div>
      )}
    </div>
  )
}
