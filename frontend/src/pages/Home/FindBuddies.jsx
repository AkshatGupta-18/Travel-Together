import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function FindBuddies() {
  const navigate = useNavigate();

  const [buddies, setBuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [connectedBuddies, setConnectedBuddies] = useState(new Set());

  useEffect(() => {
    api
      .get("/users", { withCredentials: true })
      .then((res) => {
        setBuddies(
          res.data.map((u) => ({
            id: u._id,
            name: u.name ?? "Traveller",
            username: u.username ?? "",
            avatar: u.avatar || `https://i.pravatar.cc/80?u=${u._id}`,
            location: u.location ? `From ${u.location}` : "Somewhere exciting",
            match: Math.floor(Math.random() * 20) + 75,
            tags: u.travelStyles ?? [],
            flag: "🌍",
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to load users", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleConnect = (id, e) => {
    e.stopPropagation();
    setConnectedBuddies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredBuddies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buddies;
    return buddies.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.username.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [buddies, query]);

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,500&display=swap');

        .font-display { font-family: 'Fraunces', Georgia, serif; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.1s;  }

        .gradient-text {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1.25rem;
          transition: all 0.25s ease;
        }
        .card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.12);
        }

        .btn-primary {
          background: white; color: black;
          font-weight: 600; font-size: 0.8125rem;
          border-radius: 9999px; padding: 0.5rem 1.25rem;
          transition: all 0.2s; white-space: nowrap;
        }
        .btn-primary:hover { background: #fbbf24; transform: translateY(-1px); }

        .btn-ghost {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          font-size: 0.8125rem; border-radius: 9999px;
          padding: 0.5rem 1rem; transition: all 0.2s; white-space: nowrap;
          display: inline-flex; align-items: center; gap: 0.4rem;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); color: white; }

        .btn-connected {
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.3);
          color: #fbbf24; font-weight: 600; font-size: 0.8125rem;
          border-radius: 9999px; padding: 0.5rem 1.25rem;
          transition: all 0.2s; white-space: nowrap;
          display: flex; align-items: center; gap: 0.25rem;
        }

        .match-badge {
          background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.15));
          border: 1px solid rgba(245,158,11,0.25);
          color: #fbbf24; font-size: 0.7rem; font-weight: 700;
          padding: 0.2rem 0.5rem; border-radius: 9999px; letter-spacing: 0.05em;
        }

        .avatar-ring {
          background: linear-gradient(135deg, #f59e0b, #f97316, #ef4444);
          padding: 2px; border-radius: 9999px;
        }

        .search-input {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9999px;
          transition: all 0.2s;
        }
        .search-input:focus-within {
          background: rgba(255,255,255,0.05);
          border-color: rgba(245,158,11,0.3);
        }
        .search-input input::placeholder { color: rgba(255,255,255,0.3); }

        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-6 anim-fade-up">
          <button onClick={() => navigate("/homepage")} className="btn-ghost">
            <ArrowLeftIcon />
            Back
          </button>

          <div className="search-input flex items-center gap-2 px-4 py-2 w-56 md:w-72">
            <SearchIcon />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, place, style..."
              className="bg-transparent outline-none text-sm text-white flex-1 min-w-0"
            />
          </div>
        </div>

        {/* ── TITLE ── */}
        <div className="mb-8 anim-fade-up d1">
          <h1 className="font-display text-2xl md:text-3xl font-black text-white mb-1.5">
            Find your next <span className="gradient-text">travel buddy</span>
          </h1>
          <p className="text-sm text-white/45">
            {loading ? "Looking for travellers..." : `${filteredBuddies.length} traveller${filteredBuddies.length === 1 ? "" : "s"} ready to connect`}
          </p>
        </div>

        {/* ── STATES ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 h-[132px] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card p-8 text-center anim-fade-up">
            <p className="text-sm text-white/50">Couldn't load travellers right now. Try again in a moment.</p>
          </div>
        )}

        {!loading && !error && filteredBuddies.length === 0 && (
          <div className="card p-8 text-center anim-fade-up">
            <p className="text-sm text-white/50">No travellers match "{query}".</p>
          </div>
        )}

        {/* ── GRID ── */}
        {!loading && !error && filteredBuddies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 anim-fade-up d2">
            {filteredBuddies.map((buddy) => {
              const connected = connectedBuddies.has(buddy.id);
              return (
                <div
                  key={buddy.id}
                  className="card p-4 flex items-start gap-3.5 group cursor-pointer"
                  onClick={() => navigate(`/user/${buddy.id}`)}
                >
                  <div className={connected ? "avatar-ring" : ""} style={{ borderRadius: "9999px", padding: connected ? "2px" : "0" }}>
                    <img src={buddy.avatar} alt={buddy.name} className="w-12 h-12 rounded-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-white truncate">{buddy.name}</p>
                      <span className="match-badge">{buddy.match}%</span>
                    </div>
                    <p className="text-xs text-white/35 mb-1.5">@{buddy.username}</p>
                    <p className="text-xs text-white/50 flex items-center gap-1 mb-2">{buddy.flag} {buddy.location}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {buddy.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.06]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => toggleConnect(buddy.id, e)}
                      className={connected ? "btn-connected" : "btn-primary text-xs py-1.5 px-4"}
                    >
                      {connected ? (
                        <>
                          <CheckIcon />
                          Connected
                        </>
                      ) : (
                        "Connect"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}