import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSidebar from "./ProfileSidebar";
import Navbar from "./Navbar";
import axios from "axios";
import TrendingPosts from "./TrendingPosts";

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const FEED_POSTS = [
  {
    id: 1,
    user: "maya_wanders",
    avatar: "https://i.pravatar.cc/80?img=47",
    location: "Santorini, Greece",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=85",
    likes: 1240,
    comments: 48,
    caption: "Golden hour hits different when you find the right people to share it with 🌅",
    time: "2h",
    verified: true,
  },
  {
    id: 2,
    user: "lucas.explores",
    avatar: "https://i.pravatar.cc/80?img=11",
    location: "Kyoto, Japan",
    img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=85",
    likes: 892,
    comments: 31,
    caption: "Found my travel twin at the bamboo forest. Strangers to travel buddies in 24h 🎋",
    time: "4h",
    verified: false,
  },
  {
    id: 3,
    user: "priya.roams",
    avatar: "https://i.pravatar.cc/80?img=32",
    location: "Bali, Indonesia",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=85",
    likes: 2110,
    comments: 76,
    caption: "Solo no more. Met 3 amazing humans and now we're inseparable 🌊",
    time: "6h",
    verified: true,
  },
];

const POPULAR_TRIPS = [
  {
    id: 1,
    destination: "Bali",
    country: "Indonesia",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
    dates: "Mar 15 – Mar 28",
    spots: 2,
    organizer: "maya_wanders",
    orgAvatar: "https://i.pravatar.cc/40?img=47",
    members: 3,
    flag: "🇮🇩",
  },
  {
    id: 2,
    destination: "Kyoto",
    country: "Japan",
    img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=80",
    dates: "Apr 2 – Apr 14",
    spots: 1,
    organizer: "yuki.wanders",
    orgAvatar: "https://i.pravatar.cc/40?img=25",
    members: 4,
    flag: "🇯🇵",
  },
];

const QUICK_ACTIONS = [
  { label: "Find Buddy", icon: "◈", color: "from-amber-400 to-orange-500", href: "/match" },
  { label: "Plan Trip", icon: "✦", color: "from-sky-400 to-blue-600", href: "/plan" },
  { label: "Make a Post", icon: "❋", color: "from-rose-400 to-pink-600", href: "/post" },
  { label: "Google Maps", icon: "⊕", color: "from-green-400 to-emerald-600", href: "https://www.google.com/maps" },
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg className={`w-4 h-4 transition-all ${filled ? "text-rose-500 scale-110" : "text-white/40"}`} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const CommentIcon = () => (
  <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();

  const [likedPosts, setLikedPosts] = useState(new Set());
  const [connectedBuddies, setConnectedBuddies] = useState(new Set());
  const [activeTab, setActiveTab] = useState("discover");
  const [showWelcome, setShowWelcome] = useState(true);
  const [user, setUser] = useState(null);
  const [suggestedBuddies, setSuggestedBuddies] = useState([]);

  // Setup progress — static steps, derived once
  const SETUP_STEPS = [
    { label: "Create account", done: true },
    { label: "Add profile photo", done: false },
    { label: "Set travel preferences", done: false },
    { label: "Find first buddy", done: false },
  ];
  const setupProgress = Math.round((SETUP_STEPS.filter(s => s.done).length / SETUP_STEPS.length) * 100);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users/me", { withCredentials: true })
      .then(res => {
        const d = res.data;
        setUser({
          name: d.name ?? "Traveller",
          username: d.username ?? "",
          avatar: d.avatar ?? "https://i.pravatar.cc/160?img=11",
          location: d.location ?? "",
          travelStyle: d.travelStyles ?? [],
          dreamDestinations: d.dreamDestinations ?? [],
          tripsCount: 12,
          buddiesCount: 5,
          countriesCount: 8,
        });
      })
      .catch(err => console.error("Failed to load user", err));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users", { withCredentials: true })
      .then(res => {
        setSuggestedBuddies(res.data.map(u => ({
          id: u._id,
          name: u.name ?? "Traveller",
          username: u.username ?? "",
          avatar: u.avatar ?? `https://i.pravatar.cc/80?u=${u._id}`,
          location: u.location ? `From ${u.location}` : "Somewhere exciting",
          match: Math.floor(Math.random() * 20) + 75,
          tags: u.travelStyles ?? [],
          flag: "🌍",
        })));
      })
      .catch(err => console.error("Failed to load users", err));
  }, []);

  if (!user) return <p>Loading...</p>;

  const toggleLike = (id) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleConnect = (id, e) => {
    e.stopPropagation(); // prevent card click from firing
    setConnectedBuddies(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,500&display=swap');

        .font-display { font-family: 'Fraunces', Georgia, serif; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }
        @keyframes welcomeSlide {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .anim-fade-up  { animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-welcome  { animation: welcomeSlide 0.5s cubic-bezier(0.16,1,0.3,1) both; }

        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.1s;  }
        .d3 { animation-delay: 0.15s; }
        .d4 { animation-delay: 0.2s;  }
        .d5 { animation-delay: 0.25s; }

        .gradient-text {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
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
          color: rgba(255,255,255,0.6);
          font-size: 0.8125rem; border-radius: 9999px;
          padding: 0.5rem 1.25rem; transition: all 0.2s; white-space: nowrap;
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

        .tab {
          padding: 0.5rem 1rem; border-radius: 9999px;
          font-size: 0.8125rem; font-weight: 500;
          color: rgba(255,255,255,0.35); transition: all 0.2s;
          cursor: pointer; white-space: nowrap;
        }
        .tab:hover { color: rgba(255,255,255,0.7); }
        .tab.active { background: rgba(255,255,255,0.08); color: white; }

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

        .notification-dot {
          width: 8px; height: 8px; background: #f59e0b;
          border-radius: 9999px; position: absolute;
          top: 0; right: 0; border: 2px solid #080808;
        }

        .post-img-container { position: relative; overflow: hidden; border-radius: 1rem; }
        .post-img-container img { transition: transform 0.5s ease; }
        .post-img-container:hover img { transform: scale(1.04); }

        ::-webkit-scrollbar { width: 0; height: 0; }

        @media (max-width: 768px) {
          .desktop-sidebar { display: none; }
          .desktop-right   { display: none; }
        }
      `}</style>

      {/* ── WELCOME TOAST ── */}
      {showWelcome && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] anim-welcome">
          <div className="flex items-center gap-3 bg-zinc-900/95 border border-amber-400/25 backdrop-blur-xl px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black text-sm">🎉</div>
            <div>
              <p className="text-sm font-semibold text-white">Welcome aboard, {user.name.split(" ")[0]}!</p>
              <p className="text-xs text-white/40">Your adventure starts now 🌍</p>
            </div>
            <button onClick={() => setShowWelcome(false)} className="ml-3 text-white/30 hover:text-white text-lg leading-none">×</button>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <Navbar user={user} />

      {/* ── LAYOUT ── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 flex gap-6">

        {/* LEFT SIDEBAR */}
        <ProfileSidebar user={user} />

        {/* MAIN FEED */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Hero banner */}
          <div className="anim-fade-up relative overflow-hidden card p-6 md:p-8 border-amber-400/15" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(249,115,22,0.05) 50%, rgba(239,68,68,0.04) 100%)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-medium mb-3 bg-amber-400/10 border border-amber-400/15 px-3 py-1.5 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                  </span>
                  Just joined · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-black text-white mb-1.5">
                  Hey {user.name.split(" ")[0]}, ready to <span className="gradient-text">explore?</span> 🌍
                </h1>
                <p className="text-sm text-white/45 max-w-md">
                  Your profile is {setupProgress}% complete. Find travel buddies heading to{" "}
                  <span className="text-amber-400/80">{user.dreamDestinations[0]}</span> and start your first trip.
                </p>
              </div>
              <div className="flex gap-2.5 shrink-0">
                <a href="/match" className="btn-primary text-sm">Find a Buddy</a>
                <a href="/plan" className="btn-ghost text-sm">Plan a Trip</a>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 anim-fade-up d1">
            {QUICK_ACTIONS.map((a, i) => (
              <a
                key={i} href={a.href}
                target={a.href.startsWith("http") ? "_blank" : "_self"}
                rel={a.href.startsWith("http") ? "noopener noreferrer" : ""}
                className="card p-4 flex flex-col items-center gap-2 group hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="text-base">{a.icon}</span>
                </div>
                <p className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">{a.label}</p>
              </a>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 anim-fade-up d2">
            {[
              { id: "discover", label: "Discover" },
              { id: "trending", label: "All Posts" },
              { id: "trips", label: "Open Trips" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab ${activeTab === t.id ? "active" : ""}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ─ DISCOVER ─ */}
          {activeTab === "discover" && (
            <div className="flex flex-col gap-4 anim-scale-in">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Find Travellers</p>
                <a href="/match" className="text-xs text-amber-400/70 hover:text-amber-400 flex items-center gap-1">See all <ChevronRightIcon /></a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestedBuddies.length === 0 ? (
                  <p className="text-sm text-white/30 col-span-2 text-center py-6">Loading buddies...</p>
                ) : suggestedBuddies.map(buddy => {
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
                          {buddy.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.06]">{tag}</span>
                          ))}
                        </div>
                        <button
                          onClick={(e) => toggleConnect(buddy.id, e)}
                          className={connected ? "btn-connected" : "btn-primary text-xs py-1.5 px-4"}
                        >
                          {connected ? <><CheckIcon />Connected</> : "Connect"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─ TRENDING POSTS ─ */}
          {activeTab === "trending" && (
            <div className="anim-scale-in">
              <TrendingPosts />
            </div>
          )}

          {/* ─ OPEN TRIPS ─ */}
          {activeTab === "trips" && (
            <div className="flex flex-col gap-4 anim-scale-in">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Trips looking for members</p>
                <a href="/trips" className="text-xs text-amber-400/70 hover:text-amber-400 flex items-center gap-1">Browse all <ChevronRightIcon /></a>
              </div>
              {POPULAR_TRIPS.map(trip => (
                <div key={trip.id} className="card overflow-hidden flex group hover:scale-[1.01] transition-transform">
                  <div className="w-32 md:w-44 h-32 shrink-0 overflow-hidden">
                    <img src={trip.img} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-white text-lg">{trip.destination}</h3>
                        <span className="text-lg">{trip.flag}</span>
                      </div>
                      <p className="text-xs text-white/35 mb-2">{trip.country} · {trip.dates}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <img src={trip.orgAvatar} alt="" className="w-5 h-5 rounded-full" />
                        <span className="text-xs text-white/40">@{trip.organizer} · {trip.members} members</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
                        {trip.spots} spot{trip.spots > 1 ? "s" : ""} left
                      </span>
                      <button className="btn-primary text-xs py-1.5 px-4">Request to Join</button>
                    </div>
                  </div>
                </div>
              ))}
              <a href="/trips/create" className="card p-5 flex items-center justify-center gap-3 border-dashed border-white/10 hover:border-amber-400/25 transition-all group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center group-hover:bg-amber-400/20 transition-all">
                  <PlusIcon />
                </div>
                <p className="text-sm text-white/35 group-hover:text-white/70 transition-colors">Plan a new trip and invite others</p>
              </a>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="desktop-right w-64 shrink-0 sticky top-[76px] self-start flex flex-col gap-4 h-[calc(100vh-96px)] overflow-y-auto">

          <div className="card p-4 anim-fade-up d2">
            <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">Your dream list <span className="text-white/20">✦</span></p>
            <div className="flex flex-col gap-2">
              {user.dreamDestinations.map((dest, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] rounded-xl px-2 py-1.5 transition-all -mx-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-display font-bold text-white/20">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">{dest}</span>
                  </div>
                  <ChevronRightIcon />
                </div>
              ))}
              <a href="/profile/edit" className="text-xs text-amber-400/50 hover:text-amber-400 transition-colors mt-1 flex items-center gap-1">
                <PlusIcon /> Add destination
              </a>
            </div>
          </div>

          <div className="card p-4 anim-fade-up d3">
            <p className="text-xs font-semibold text-white mb-3">Travel style</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {user.travelStyle.map(tag => (
                <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400/80 font-medium">{tag}</span>
              ))}
            </div>
            <a href="/profile/edit" className="text-xs text-white/25 hover:text-white/60 transition-colors">+ Add more styles</a>
          </div>

          <div className="card p-4 anim-fade-up d4">
            <p className="text-xs font-semibold text-white mb-3">Live now 🟢</p>
            <div className="flex flex-col gap-3">
              {[
                { avatar: "https://i.pravatar.cc/32?img=5", name: "Alex K.", action: "joined Bali trip", time: "2m" },
                { avatar: "https://i.pravatar.cc/32?img=9", name: "Lena M.", action: "posted from Tokyo", time: "5m" },
                { avatar: "https://i.pravatar.cc/32?img=12", name: "Dev P.", action: "matched with 3 buddies", time: "8m" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <img src={item.avatar} alt={item.name} className="w-7 h-7 rounded-full shrink-0" />
                  <p className="text-xs text-white/40 leading-snug">
                    <span className="text-white/70 font-medium">{item.name}</span> {item.action}
                  </p>
                  <span className="text-[10px] text-white/20 ml-auto shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 anim-fade-up d5" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.07), rgba(239,68,68,0.05))", borderColor: "rgba(245,158,11,0.15)" }}>
            <p className="text-xs font-semibold text-amber-400 mb-1">📱 Get the app</p>
            <p className="text-xs text-white/40 mb-3">Real-time buddy matching on the go</p>
            <a href="/app" className="btn-primary text-xs py-2 block text-center">Download free</a>
          </div>
        </aside>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#080808]/95 backdrop-blur-xl border-t border-white/[0.06]">
        <div className="flex items-center justify-around px-2 py-3">
          {[
            { icon: "🧭", label: "Discover", href: "/" },
            { icon: "🗺️", label: "Trips", href: "/trips" },
            { icon: "➕", label: "", href: "/post", special: true },
            { icon: "👥", label: "Buddies", href: "/buddies" },
            { icon: "👤", label: "Profile", href: "/profile" },
          ].map((item, i) =>
            item.special ? (
              <a key={i} href={item.href} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black shadow-lg shadow-amber-400/25 text-xl -mt-5">
                {item.icon}
              </a>
            ) : (
              <a key={i} href={item.href} className="flex flex-col items-center gap-1 px-3 py-1 text-white/40 hover:text-white transition-colors">
                <span className="text-lg">{item.icon}</span>
                <span className="text-[9px]">{item.label}</span>
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
}