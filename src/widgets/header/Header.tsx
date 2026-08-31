import { useRef, useState, useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useCart } from "@/features/cart";
import { SoundToggle } from "@/shared/components";
import { ProfileMenu } from "./ProfileMenu";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { useScrollHeaderVisibility } from "./useScrollHeaderVisibility";

type NavItem = { label: string; to: string; hash?: string; disabled?: boolean };

const NAV_ITEMS: NavItem[] = [
  { label: "Customize", to: "/customize" },
  { label: "Collection", to: "/collections" },
  { label: "Shop", to: "/" },
  { label: "Bundles", to: "/" },
  { label: "Gallery", to: "/#gallery", hash: "gallery" },
  { label: "About", to: "/#about", hash: "about" },
];

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const hidden = useScrollHeaderVisibility(headerRef);
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const isCustomize = location.pathname.startsWith("/customize");
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(() =>
    location.pathname.startsWith("/customize") ? "Customize" : "",
  );

  useEffect(() => {
    if (location.pathname.startsWith("/customize")) setActive("Customize");
    else if (location.pathname.startsWith("/collections"))
      setActive("Collection");
    else if (location.pathname === "/") setActive("");
  }, [location.pathname]);

  const handleNav = useCallback(
    (item: NavItem) => {
      if ("disabled" in item) return;

      setActive(item.label);
      if (item.to === "/customize" || item.to === "/collections") {
        navigate(item.to);
        return;
      }
      if (location.pathname === "/") {
        if (item.hash) {
          const el = document.getElementById(item.hash);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        navigate(item.to);
      }
    },
    [location.pathname, navigate],
  );

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-abyss/80 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex h-14 w-full items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6 xl:gap-10">
            <Link
              to="/"
              className="group flex shrink-0 flex-col leading-none select-none"
            >
              <span className="font-display text-xl font-bold tracking-tight text-white">
                MODU
                <span className="text-primary-2 transition-all duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_14px_rgba(192,132,252,0.85)]">
                  -X
                </span>
              </span>
              <span className="hidden text-[9px] font-medium tracking-[0.25em] text-muted-2 sm:block">
                BUILD · COLLECT · CONNECT
              </span>
            </Link>

            <nav className="hidden items-center gap-1 min-[1401px]:flex">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={"disabled" in item}
                  onClick={() => handleNav(item)}
                  className={`relative rounded-full px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors ${
                    "disabled" in item
                      ? "cursor-default text-muted-2/70"
                      : active === item.label
                        ? "text-white"
                        : "text-muted hover:text-ink"
                  }`}
                >
                  {active === item.label && !("disabled" in item) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-white/8 shadow-[0_0_0_1px_rgba(168,85,247,0.4),0_0_20px_rgba(168,85,247,0.25)]"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {isAuthenticated ? (
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 xl:gap-3">
              <label className="group relative hidden items-center min-[1401px]:flex">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-2 transition-colors group-focus-within:text-primary-2" />
                <input
                  type="text"
                  placeholder="Search parts..."
                  className="w-36 rounded-full border border-white/8 bg-white/[0.03] py-2 pr-3 pl-9 text-[13px] text-ink placeholder:text-muted-2 outline-none transition-all duration-300 focus:w-56 focus:border-primary-3/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]"
                />
              </label>

              {/* TODO: Add collection progress */}
              {/* <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                <Gem className="h-3.5 w-3.5 text-primary-2" />
                <span className="text-[13px] font-semibold text-ink tabular-nums">2,450</span>
              </div> */}

              {isCustomize ? <SoundToggle /> : null}

              <button
                type="button"
                aria-label="Cart"
                onClick={() => navigate("/cart")}
                className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] transition-colors hover:border-primary-3/60 hover:bg-white/[0.06]"
              >
                <ShoppingBag className="h-4 w-4 text-ink transition-transform group-hover:scale-110" />
                {itemCount > 0 ? (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-[0_0_10px_rgba(168,85,247,0.7)]"
                  >
                    {itemCount}
                  </motion.span>
                ) : null}
              </button>

              <div className="hidden min-[1401px]:block">
                <ProfileMenu />
              </div>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-ink transition-colors hover:border-primary-3/60 min-[1401px]:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 xl:gap-3">
              <Link
                to="/login"
                className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] font-semibold text-ink transition-all hover:border-primary-3/50 hover:bg-white/[0.08] sm:inline-flex"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-primary-3 px-3 py-2 text-[12px] font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] transition-all hover:bg-primary sm:px-4 sm:text-[13px]"
              >
                Sign Up
              </Link>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-ink min-[1401px]:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <div
        aria-hidden
        className="pointer-events-none shrink-0"
        style={{ height: "calc(3.5rem + env(safe-area-inset-top, 0px))" }}
      />

      <MobileNavDrawer
        open={menuOpen}
        onClose={closeMenu}
        navItems={NAV_ITEMS}
        onNav={handleNav}
        activeLabel={active}
      />
    </>
  );
}
