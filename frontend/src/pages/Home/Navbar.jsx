import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const SearchIcon = () => (
  <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function Navbar({ user, buddies = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);

  // Close the dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return buddies
      .filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.username?.toLowerCase().includes(q) ||
          b.location?.toLowerCase().includes(q) ||
          b.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [buddies, query]);

  const goToUser = (id) => {
    navigate(`/user/${id}`);
    setQuery("");
    setOpen(false);
  };

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
        <div className="flex-1 max-w-sm mx-auto relative" ref={searchRef}>
          <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-2.5">
            <SearchIcon />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => query && setOpen(true)}
              placeholder="Search people, places, styles..."
              className="bg-transparent text-sm text-white placeholder:text-white/25 outline-none w-full"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                }}
                className="text-white/30 hover:text-white text-base leading-none shrink-0"
              >
                ×
              </button>
            )}
          </div>

          {open && query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 card p-1.5 max-h-80 overflow-y-auto z-40 shadow-2xl shadow-black/50">
              {results.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-4 px-2">
                  No travellers found for "{query}"
                </p>
              ) : (
                results.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => goToUser(b.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <img src={b.avatar} alt={b.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{b.name}</p>
                      <p className="text-[11px] text-white/35 truncate">
                        @{b.username}
                        {b.location ? ` · ${b.location}` : ""}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right nav */}
        <div className="flex items-center gap-2 shrink-0">
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