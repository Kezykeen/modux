import {
  FolderOpen,
  LogIn,
  Magnet,
  Package,
  Palette,
  ShoppingCart,
  Sparkles,
  Trophy,
} from 'lucide-react'

export const CHARACTER = '/assets/Renders/Cyber Character.webp'
export const CHARACTER_ALT = '/assets/Renders/Cyber Moon Character.webp'

export const STEPS = [
  {
    n: '01',
    title: 'Sign In',
    desc: 'Jump back in — your creations are saved and ready.',
    icon: LogIn,
  },
  {
    n: '02',
    title: 'Pick Base',
    desc: 'Browse the collection and choose the one that speaks to you.',
    icon: FolderOpen,
  },
  {
    n: '03',
    title: 'Make It Yours',
    desc: 'Tweak every detail — colors, features, style. If you can imagine it, you can build it.',
    icon: Palette,
  },
  {
    n: '04',
    title: 'Checkout',
    desc: 'Review your design, pay securely, done.',
    icon: ShoppingCart,
  },
  {
    n: '05',
    title: 'We Print & Ship',
    desc: 'Your character comes to life — printed exactly as designed and delivered to your door.',
    icon: Trophy,
  },
] as const

export const GALLERY = [
  {
    name: 'Shadow Ninja',
    rarity: 'Epic',
    by: 'KuroDesign',
    likes: '2,450',
    img: CHARACTER,
  },
  {
    name: 'Neon Warrior',
    rarity: 'Legendary',
    by: 'CypherKat',
    likes: '4,100',
    img: CHARACTER_ALT,
  },
  {
    name: 'Void Hunter',
    rarity: 'Rare',
    by: 'Zenith_Labs',
    likes: '1,850',
    img: CHARACTER,
  },
  {
    name: 'Cyber Ronin',
    rarity: 'Epic',
    by: 'Neo_Edo',
    likes: '2,900',
    img: CHARACTER_ALT,
  },
] as const

export const FEATURES = [
  {
    title: 'Magnetic System',
    desc: 'Swap parts instantly with our neodymium magnet assembly. No glue, no tools. Interchangeable limbs, weapons, and accessories click satisfyingly into place.',
    img: '/assets/landing/magnetic.webp',
    icon: Magnet,
  },
  {
    title: 'Premium Quality',
    desc: 'High-resolution resin printing ensures zero visible print lines. Hand-painted details, clear matte varnishes, and solid internal weight make them true centerpieces.',
    img: '/assets/landing/premium-quality.webp',
    icon: Sparkles,
  },
  {
    title: 'Your Design, Forever',
    desc: 'Every creation is saved to your secure collection profile. Reorder configurations in physical form, remix parts with new drops, or share interactive links with your friends.',
    img: '/assets/landing/design-forever.webp',
    icon: Package,
  },
] as const

export const TESTIMONIALS = [
  {
    name: 'Marcus V.',
    role: 'Collector & Gamer',
    quote:
      'The modular system is insane. I designed a customized ninja figure for my desk, and it looks better than any commercial designer toy I own. Clicking the magnets is so addictive.',
    hue: 'from-primary-3 to-pink',
  },
  {
    name: 'Sienna K.',
    role: 'Character Animator',
    quote:
      'I was skeptical about physical print lines, but there are literally none. The matte top-finish makes it feel like sculpted vinyl rather than a 3D print. Outstanding craft.',
    hue: 'from-cyan to-primary',
  },
  {
    name: 'Leo Fletcher',
    role: 'Toy Reviewer',
    quote:
      'Awesome packaging experience! The figure arrived in a custom high-tech blister pack with serial number tags. Feels like a real high-end art toy launch.',
    hue: 'from-pink to-primary-3',
  },
] as const

export const PLANS = [
  {
    name: 'Standard',
    badge: 'ESSENTIAL',
    popular: false,
    blurb: 'Base figure, 1 accessory set, standard shipping',
    price: '29.99',
    features: [
      '1x 120mm Solid Resin Chassis',
      '1x Standard Accessory Set',
      'Matte Protective Finish',
      'Standard Shipping (7 Days)',
    ],
  },
  {
    name: 'Pro',
    badge: 'POPULAR CHOICE',
    popular: true,
    blurb: 'Premium figure, 3 accessory sets, magnetic system, express shipping',
    price: '49.99',
    features: [
      '1x 150mm Neo-magnetic Chassis',
      '3x Premium Accessory Sets',
      'Dual-tone Hand Painting',
      'Collector Serial Hologram',
      'Express Shipping (3 Days)',
    ],
  },
  {
    name: 'Collector',
    badge: 'ULTIMATE ART PIECE',
    popular: false,
    blurb: 'Large-format figure, full accessory library, display base, priority shipping',
    price: '79.99',
    features: [
      '1x 200mm Large Neo-magnetic Chassis',
      'Unlimited Base Accessory Library',
      'Premium Display Base',
      'Acrylic Protective Dust Case',
      'Priority Overnight Delivery',
    ],
  },
] as const

export const PRESS = ['TechCrunch', 'Wired', 'Kotaku', 'Polygon', 'Engadget'] as const

export const rarityClass: Record<string, string> = {
  Epic: 'text-rarity-epic',
  Legendary: 'text-rarity-legendary',
  Rare: 'text-rarity-rare',
}
