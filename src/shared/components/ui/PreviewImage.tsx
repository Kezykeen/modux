interface PreviewImageProps {
  src: string
  alt?: string
  className?: string
  /** Eager + high fetch priority for equipped / above-the-fold thumbnails. */
  priority?: boolean
}

export function PreviewImage({ src, alt = '', className, priority = false }: PreviewImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  )
}
