import { playClickSfx } from '@/audio'
import type { ShippingMethod } from '../context/CartContext'

const OPTIONS = [
  {
    id: 'express' as const,
    title: 'Express Holographic Shipping',
    eta: '2-3 Business Days',
    price: '$4.99',
  },
  {
    id: 'standard' as const,
    title: 'Standard Delivery',
    eta: '5-7 Business Days',
    price: 'FREE',
  },
]

export function ShippingMethodPicker({
  value,
  onChange,
}: {
  value: ShippingMethod
  onChange: (method: ShippingMethod) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              playClickSfx()
              onChange(opt.id)
            }}
            className={`rounded-xl border p-4 text-left transition-all ${
              active
                ? 'border-primary bg-primary-3/10 shadow-[0_0_0_1px_rgba(168,85,247,0.35)]'
                : 'border-white/8 bg-panel-2 hover:border-white/15'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                    active ? 'border-primary-3 bg-primary-3' : 'border-white/25'
                  }`}
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{opt.title}</p>
                  <p className="mt-1 text-xs text-muted">{opt.eta}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-ink">{opt.price}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
