import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  X,
  LogOut,
  Package,
  User,
  Palette,
  Box,
  ShoppingBag,
  Layers,
  Image,
  Info,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { toast } from "@/shared/components";

type NavItem = { label: string; to: string; hash?: string; disabled?: boolean };

const NAV_ICONS: Record<string, typeof Palette> = {
  Customize: Palette,
  Collection: Box,
  Shop: ShoppingBag,
  Bundles: Layers,
  Gallery: Image,
  About: Info,
};

const navListVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.065,
    },
  },
} as const;

const navItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
} as const;

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  onNav: (item: NavItem) => void;
  activeLabel: string;
}

function initialsFromName(name?: string | null) {
  if (!name) return null;
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MobileNavDrawer({
  open,
  onClose,
  navItems,
  onNav,
  activeLabel,
}: MobileNavDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const userInitials = useMemo(
    () => initialsFromName(user?.name),
    [user?.name],
  );

  useEffect(() => {
    if (!open) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [open]);

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
      onClose();
      navigate("/", { replace: true });
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[60] bg-[#050308]/72 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(100vw-1.25rem,340px)] flex-col overflow-hidden border-l border-white/10 bg-[#0a0712]/96 shadow-[-32px_0_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(168,85,247,0.08)] backdrop-blur-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_100%_0%,rgba(124,58,237,0.18),transparent_55%),radial-gradient(ellipse_70%_40%_at_0%_100%,rgba(168,85,247,0.08),transparent_50%)]"
            />

            <div className="relative flex items-start justify-between gap-3 border-b border-white/8 px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
              {isAuthenticated ? (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-3 via-primary to-pink text-sm font-bold text-white shadow-[0_0_24px_rgba(124,58,237,0.45)]">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : userInitials ? (
                      userInitials
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#0a0712] bg-emerald-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-white">
                      {user?.name ?? "Account"}
                    </p>
                    <p className="truncate text-[11px] text-muted">
                      {user?.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold tracking-tight text-white">
                    MODU
                    <span className="text-primary-2">-X</span>
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium tracking-[0.22em] text-muted-2 uppercase">
                    Build · Collect · Connect
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-muted transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <motion.nav
              className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-4 py-4"
              initial={prefersReducedMotion ? false : "hidden"}
              animate={prefersReducedMotion ? undefined : "visible"}
              variants={prefersReducedMotion ? undefined : navListVariants}
            >
              <p className="mb-2 px-2 text-[10px] font-bold tracking-[0.2em] text-muted-2 uppercase">
                Navigate
              </p>

              {navItems.map((item) => {
                const disabled = "disabled" in item;
                const active = !disabled && activeLabel === item.label;
                const Icon = NAV_ICONS[item.label] ?? Sparkles;

                return (
                  <motion.button
                    key={item.label}
                    type="button"
                    disabled={disabled}
                    variants={prefersReducedMotion ? undefined : navItemVariants}
                    onClick={() => {
                      if (disabled) return;
                      onNav(item);
                      onClose();
                    }}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                      disabled
                        ? "cursor-default opacity-50"
                        : active
                          ? "bg-gradient-to-r from-primary-3/25 via-primary/15 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,0.35),0_0_20px_rgba(124,58,237,0.12)]"
                          : "text-muted hover:bg-white/[0.04] hover:text-ink"
                    }`}
                  >
                    <span
                      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                        active && !disabled
                          ? "border-primary-3/40 bg-primary/20 text-primary-2"
                          : "border-white/8 bg-white/[0.03] text-muted group-hover:border-white/15 group-hover:text-ink"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>

                    <span className="relative z-10 min-w-0 flex-1 text-[13px] font-semibold tracking-[0.12em] uppercase">
                      {item.label}
                    </span>

                    {!disabled ? (
                      <span className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center">
                        <ChevronRight
                          className={`h-4 w-4 transition-[opacity,transform,color] duration-200 ${
                            active
                              ? "translate-x-0 text-primary-2 opacity-100"
                              : "opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                          }`}
                        />
                      </span>
                    ) : (
                      <span aria-hidden className="h-4 w-4 shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </motion.nav>

            {isAuthenticated ? (
              <div className="relative border-t border-white/8 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                <p className="mb-3 px-1 text-[10px] font-bold tracking-[0.2em] text-muted-2 uppercase">
                  Account
                </p>

                <Link
                  to="/orders"
                  onClick={onClose}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 transition-all hover:border-primary-3/35 hover:bg-white/[0.06] hover:shadow-[0_0_24px_rgba(124,58,237,0.12)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary-2 transition-colors group-hover:bg-primary/25">
                    <Package className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-ink">
                    Orders
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary-2" />
                </Link>

                <button
                  type="button"
                  disabled={signingOut}
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-red-400/90 transition-colors hover:bg-red-500/[0.08] disabled:opacity-60"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
                    <LogOut className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-left">
                    {signingOut ? "Signing out…" : "Sign out"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="relative flex flex-col gap-2.5 border-t border-white/8 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-white/[0.07]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="rounded-2xl bg-gradient-to-r from-primary-3 to-primary px-4 py-3.5 text-center text-sm font-bold text-white shadow-[0_8px_32px_rgba(124,58,237,0.45)] transition-shadow hover:shadow-[0_8px_40px_rgba(168,85,247,0.55)]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
