const SOCIALS = [
  { name: 'Discord', href: 'https://discord.com', src: '/assets/landing/social/discord.svg' },
  { name: 'Instagram', href: 'https://instagram.com', src: '/assets/landing/social/instagram.svg' },
  { name: 'TikTok', href: 'https://tiktok.com', src: '/assets/landing/social/tiktok.svg' },
  { name: 'Twitter', href: 'https://x.com', src: '/assets/landing/social/twitter.svg' },
] as const

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-[11px] font-bold tracking-wide text-muted-2 uppercase">Follow Us</span>
      <div className="flex items-center gap-3">
        {SOCIALS.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.name}
            className="flex size-6 items-center justify-center overflow-clip opacity-80 transition-opacity hover:opacity-100"
          >
            <img src={social.src} alt="" width={24} height={24} className="size-6" />
          </a>
        ))}
      </div>
    </div>
  )
}
