import { useEffect, useState, type KeyboardEvent } from 'react'
import { playClickSfx } from '@/audio'
import { useCart, VALID_PROMO } from '../context/CartContext'

export function PromoCodeField({ className = '' }: { className?: string }) {
  const { promoCode, promoApplied, applyPromo, clearPromo } = useCart()
  const [value, setValue] = useState(promoCode ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    setValue(promoCode ?? '')
  }, [promoCode])

  const submit = () => {
    playClickSfx()

    if (promoApplied) {
      clearPromo()
      setValue('')
      setError('')
      return
    }

    const ok = applyPromo(value)
    setError(ok ? '' : 'Invalid promo code')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={onKeyDown}
          disabled={promoApplied}
          autoComplete="off"
          placeholder={`Promo code (try ${VALID_PROMO})`}
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 rounded-lg border border-white/8 bg-panel-3 px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-3/60 disabled:opacity-80"
        />
        <button
          type="button"
          onClick={submit}
          className={`shrink-0 rounded-lg px-3 py-2.5 text-[11px] font-bold tracking-wide uppercase transition-colors ${
            promoApplied
              ? 'bg-primary-3/25 text-primary-2 hover:bg-red-500/20 hover:text-red-300'
              : 'bg-primary-3 text-white hover:bg-primary'
          }`}
        >
          {promoApplied ? 'Remove' : 'Apply'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {promoApplied && (
        <p className="mt-2 text-[11px] text-emerald-400/90">10% off applied to subtotal</p>
      )}
    </div>
  )
}
