import type { SVGProps } from 'react'

export function PantsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 2h12l.9 8.6a4 4 0 0 1-.03.9L17.5 22h-2.8l-1.9-10.4L10.9 22H8.1L6.63 11.5a4 4 0 0 1-.03-.9z" />
      <path d="M6 6h12" />
    </svg>
  )
}
