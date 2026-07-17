import { useState } from "react";
import { useNavigate } from "react-router-dom";


const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
export default function Navbar({ user }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-15 flex items-center gap-4" style={{ height: "60px" }}>

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/20">
              <span className="text-black font-black text-xs">T</span>
            </div>
            <span className="font-display font-bold text-base text-white hidden sm:block">
              Travel<span className="gradient-text">Together</span>
            </span>
          </a>

          {/* Search */}
          <div className="flex-1 max-w-sm mx-auto">
            <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-2.5">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search destinations, people, trips..."
                className="bg-transparent text-sm text-white placeholder:text-white/25 outline-none w-full"
              />
            </div>
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Notif */}
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
              <BellIcon />
              <span className="notification-dot" />
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-white/[0.06] transition-all group"
            >
              <div className="avatar-ring">
                <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">{user?.name?.split(" ")[0]}</p>
                <p className="text-[10px] text-white/30">@{user?.username}</p>
              </div>
            </button>
          </div>
        </div>
      </header>
  );
}