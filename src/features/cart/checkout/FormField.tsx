import type { InputHTMLAttributes, ReactNode } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { FieldLabel, TextInput } from '@/features/auth'

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  transform?: (value: string) => string
  errorOverride?: boolean
  className?: string
  children?: never
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'value' | 'onChange'>

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  transform,
  errorOverride,
  className,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <TextInput
            {...inputProps}
            id={name}
            name={field.name}
            ref={field.ref}
            value={field.value ?? ''}
            error={Boolean(fieldState.error) || errorOverride}
            onBlur={field.onBlur}
            onChange={(e) => {
              const next = transform ? transform(e.target.value) : e.target.value
              field.onChange(next)
            }}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1.5 text-[11px] font-medium text-red-400" role="alert">
      {message}
    </p>
  )
}

export function SectionCard({
  step,
  title,
  children,
}: {
  step: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/8 bg-panel p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-3 text-xs font-bold text-white">
          {step}
        </span>
        <h2 className="text-sm font-bold tracking-wide text-white uppercase">{title}</h2>
      </div>
      {children}
    </section>
  )
}

/** Keep Chrome from treating demo card inputs as a secure payment form over HTTP. */
export const antifillProps = {
  autoComplete: 'off' as const,
  'data-1p-ignore': true,
  'data-lpignore': 'true',
  'data-form-type': 'other',
}
