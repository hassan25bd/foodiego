"use client";

import React, { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform, type Transition } from "framer-motion";
import {
  User,
  ShoppingBag,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  UtensilsCrossed,
  Bike,
  ShoppingCart,
  Menu,
  X,
  Search,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import LogoText from "./LogoText";
import CartDrawer from "@/components/client/CartDrawer";
import NotificationBell from "@/components/shared/NotificationBell";

const springSlow: Transition = { type: "spring", stiffness: 300, damping: 28 };
const fadeDuration: Transition = { duration: 0.25, ease: "easeOut" };

export interface NavItem {
  label: string;
  href: string;
}

export interface NavbarProps {
  navItems?: NavItem[];
  user?:
    | {
        name?: string;
        email?: string;
        avatarUrl?: string;
        role?: string;
      }
    | null;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
}

const defaultNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Discover restaurants", href: "/restaurants" },
  { label: "Offers", href: "/offers" },
];

export const Navbar: React.FC<NavbarProps> = ({
  navItems = defaultNavItems,
  user: propUser = null,
  onSearch,
  onLogout,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const navY = useTransform(scrollY, [0, 80], [0, -4]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { cart, user: contextUser, logoutUser } = useApp();
  const user = propUser ?? contextUser;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const role = propUser?.role;
  const dashboardHref =
    role === "admin"
      ? "/admin"
      : role === "restaurant"
      ? "/vendor"
      : role === "rider"
      ? "/rider"
      : "/client";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = useCallback(async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    await logoutUser();
  }, [onLogout, logoutUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/vendor") ||
    pathname?.startsWith("/rider") ||
    pathname?.startsWith("/client") ||
    pathname?.startsWith("/auth")
  ) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      router.push(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <motion.div style={{ y: navY }}>
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springSlow, delay: 0.2 }}
          className="sticky top-0 z-50 w-full transition-all duration-300"
          style={{
            background: isScrolled
              ? "rgba(250, 247, 238, 0.88)"
              : "rgba(250, 247, 238, 0.78)",
            backdropFilter: isScrolled
              ? "blur(18px) saturate(1.8)"
              : "blur(14px) saturate(1.5)",
            WebkitBackdropFilter: isScrolled
              ? "blur(18px) saturate(1.8)"
              : "blur(14px) saturate(1.5)",
            borderBottom: isScrolled
              ? "1px solid rgba(18, 71, 52, 0.08)"
              : "1px solid rgba(18, 71, 52, 0.06)",
            boxShadow: isScrolled
              ? "0 12px 30px rgba(18, 71, 52, 0.06)"
              : "0 0 0 rgba(0,0,0,0)",
          }}
        >
          <div className="bg-[#124734]">
            <div className="mx-auto flex h-11 max-w-[1500px] items-center justify-between gap-3 px-4 text-[10px] font-semibold tracking-[0.14em] text-emerald-50/90 uppercase sm:px-6 lg:px-8 xl:px-10">
              <div className="hidden items-center gap-2 sm:flex">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
                <span>Fast delivery in 20–25 min</span>
              </div>

              <div className="flex items-center justify-center gap-2 sm:justify-end">
                <Link
                  href="/auth/register?role=restaurant"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-white/10 sm:px-3"
                >
                  <UtensilsCrossed size={12} />
                  <span>Restaurant</span>
                </Link>
                <Link
                  href="/auth/register?role=rider"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-white/10 sm:px-3"
                >
                  <Bike size={12} />
                  <span>Rider</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_48%)]" />

            <div className="relative mx-auto flex h-20 max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:px-10">
              <div className="flex items-center gap-6 lg:gap-8">
                <motion.div whileHover={{ scale: 1.03 }} transition={{ ...springSlow }}>
                  <LogoText />
                </motion.div>

                <nav className="hidden items-center gap-2 lg:flex">
                  {navItems.map((item, i) => {
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.06, ...springSlow }}
                      >
                        <Link
                          href={item.href}
                          className={`relative rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                            isActive
                              ? "text-[#124734]"
                              : "text-[#3f4a3a] hover:text-[#124734]"
                          }`}
                        >
                          <span>{item.label}</span>
                          <AnimatePresence>
                            {isActive && (
                              <motion.span
                                layoutId="navUnderline"
                                className="absolute inset-x-2 -bottom-1 h-[2px] rounded-full bg-[#F6A429]"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                exit={{ scaleX: 0 }}
                                transition={{ ...springSlow }}
                              />
                            )}
                          </AnimatePresence>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              <motion.form
                onSubmit={handleSearchSubmit}
                className="hidden flex-1 max-w-md md:flex md:mx-2 lg:mx-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, ...springSlow }}
              >
                <div className="relative w-full">
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4"
                    animate={{ color: isSearchFocused ? "#124734" : "#9CA3AF" }}
                    transition={{ duration: 0.2 }}
                  >
                    <Search size={16} strokeWidth={2.2} />
                  </motion.div>

                  <motion.input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search food or restaurants..."
                    animate={{
                      backgroundColor: isSearchFocused ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
                      boxShadow: isSearchFocused
                        ? "0 0 0 4px rgba(18,71,52,0.08)"
                        : "0 0 0 0 rgba(18,71,52,0)",
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-full rounded-full border border-[#d7d1c5] bg-white/60 py-2.5 pl-11 pr-4 text-sm text-[#1F2937] placeholder-[#6b7280] focus:outline-none"
                  />
                </div>
              </motion.form>

              <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                <motion.button
                  onClick={() => setIsCartOpen(true)}
                  className="relative rounded-full border border-[#d9d2c2] bg-[#f6f2eb] p-2.5 text-[#124734] shadow-[0_8px_18px_rgba(18,71,52,0.06)] transition-colors hover:bg-white"
                  whileHover={{ scale: 1.07, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <AnimatePresence>
                    {isMounted && cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#f6a429] text-[9px] font-extrabold text-[#1F2937]"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {user && (
                  <NotificationBell buttonClassName="relative rounded-full border border-[#d9d2c2] bg-[#f6f2eb] p-2.5 text-[#124734] shadow-[0_8px_18px_rgba(18,71,52,0.06)] transition-colors hover:bg-white" />
                )}

                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <motion.button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 rounded-full border border-[#d9d2c2] bg-[#f7f3ec] px-2.5 py-1.5 text-sm font-semibold text-[#124734] shadow-[0_8px_18px_rgba(18,71,52,0.06)] transition-colors hover:bg-white"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-emerald-200 bg-emerald-100">
                        {user.avatarUrl ? (
                          <Image src={user.avatarUrl} alt="User Avatar" fill className="object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-[#124734]">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </span>
                        )}
                      </div>
                      <span className="hidden max-w-[140px] truncate sm:inline-block">{user.name || "Account"}</span>
                      <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
                        <ChevronDown size={14} className="text-gray-500" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.15 } }}
                          transition={{ ...springSlow }}
                          className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-[#E8E2D5] bg-white py-2 shadow-[0_16px_44px_rgba(21,70,45,0.12)]"
                        >
                          <div className="border-b border-[#E8E2D5]/60 px-4 py-3">
                            <p className="truncate text-sm font-semibold text-[#1F2937]">{user.name || "User"}</p>
                            <p className="truncate text-xs text-[#9CA3AF]">{user.email || "user@example.com"}</p>
                          </div>

                          <div className="py-1">
                            {[
                              { href: "/account", icon: <User size={16} className="text-[#124734]" />, label: "Profile" },
                              { href: "/client/cart", icon: <ShoppingBag size={16} className="text-[#124734]" />, label: "My Cart" },
                              { href: dashboardHref, icon: <LayoutDashboard size={16} className="text-[#124734]" />, label: "Dashboard" },
                              { href: "/settings", icon: <Settings size={16} className="text-[#124734]" />, label: "Settings" },
                            ].map((item, i) => (
                              <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04, ...springSlow }}
                              >
                                <Link
                                  href={item.href}
                                  onClick={() => setIsDropdownOpen(false)}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] transition-colors duration-150 hover:bg-[#FAF7EE]"
                                >
                                  {item.icon}
                                  <span className="font-medium">{item.label}</span>
                                </Link>
                              </motion.div>
                            ))}
                          </div>

                          <div className="border-t border-[#E8E2D5]/60 pt-1">
                            <motion.button
                              onClick={async () => {
                                setIsDropdownOpen(false);
                                await handleLogout();
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                            >
                              <LogOut size={16} />
                              <span>Logout</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    className="hidden items-center gap-3 lg:flex"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, ...fadeDuration }}
                  >
                    <Link
                      href="/auth/login"
                      className="px-2 py-1 text-sm font-bold text-[#374151] transition-colors hover:text-[#124734]"
                    >
                      Sign in
                    </Link>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ ...springSlow }}>
                      <Link
                        href="/auth/register"
                        className="inline-flex items-center justify-center rounded-full bg-[#F6A429] px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#1F2937] shadow-[0_10px_20px_rgba(246,164,41,0.25)] transition-colors hover:bg-[#e0931f]"
                      >
                        Order Now
                      </Link>
                    </motion.div>
                  </motion.div>
                )}

                <motion.button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="cursor-pointer rounded-full border border-[#d9d2c2] bg-white/60 p-2 text-[#374151] shadow-[0_8px_18px_rgba(18,71,52,0.06)] lg:hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle menu"
                >
                  <AnimatePresence mode="wait">
                    {isMobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>
      </motion.div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%", transition: { duration: 0.25, ease: "easeInOut" } }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-50 flex w-[320px] flex-col overflow-y-auto border-l border-[#E8E2D5] bg-[#FAF7EE] shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-[#E8E2D5] p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#F6A429]" />
                  <span className="font-bold text-[#124734]">FoodieGo</span>
                </div>

                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full p-2 text-gray-500 transition-colors hover:bg-white hover:text-[#124734]"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="p-4">
                <form onSubmit={handleSearchSubmit} className="pb-2">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search food or restaurants..."
                      className="w-full rounded-full border border-transparent bg-[#ECE7D9] py-2.5 pl-11 pr-4 text-sm text-[#1F2937] placeholder-gray-500 transition-all focus:border-[#124734]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#124734]/20"
                    />
                  </div>
                </form>
              </div>

              <div className="space-y-1 px-4">
                {navItems.map((item, i) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, ...springSlow }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                          isActive ? "bg-[#124734] text-white" : "text-[#374151] hover:bg-white"
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveDot"
                            className="h-1.5 w-1.5 rounded-full bg-[#F6A429]"
                            transition={{ type: "spring", stiffness: 500 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-auto space-y-3 border-t border-[#E8E2D5] p-4">
                {!user ? (
                  <>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ...springSlow }}>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full rounded-full bg-[#F6A429] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#1F2937] shadow-sm transition-colors hover:bg-[#e0931f]"
                      >
                        Order Now
                      </Link>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ...springSlow }}>
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full rounded-full bg-[#124734] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#1a5c3a]"
                      >
                        Sign in
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ...springSlow }} className="space-y-1 pt-3">
                    {[
                      { href: "/profile", label: "Profile" },
                      { href: "/client/cart", label: "My Cart" },
                      { href: dashboardHref, label: "Dashboard" },
                      { href: "/settings", label: "Settings" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2.5 text-sm font-medium text-[#374151] transition-colors hover:text-[#124734]"
                      >
                        {item.label}
                      </Link>
                    ))}

                    <button
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        await handleLogout();
                      }}
                      className="block w-full py-2.5 text-left text-sm font-medium text-red-500"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
