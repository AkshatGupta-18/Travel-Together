import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Stories", href: "#stories" },
];

const HERO_POSTS = [
  {
    id: 1,
    user: "maya_wanders",
    avatar: "https://i.pravatar.cc/150?img=47",
    location: "Santorini, Greece",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500&q=85",
    likes: "12.4k",
    caption: "Golden hour hits different when you find the right people to share it with 🌅",
    verified: true,
  },
  {
    id: 2,
    user: "lucas.explores",
    avatar: "https://i.pravatar.cc/150?img=11",
    location: "Kyoto, Japan",
    img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=500&q=85",
    likes: "8.9k",
    caption: "Found my travel twin at the bamboo forest. Strangers to travel buddies in 24h 🎋",
    verified: false,
  },
  {
    id: 3,
    user: "priya.roams",
    avatar: "https://i.pravatar.cc/150?img=32",
    location: "Bali, Indonesia",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=85",
    likes: "21.1k",
    caption: "Solo no more. Met 3 amazing humans through TravelTogether and now we're inseparable 🌊",
    verified: true,
  },
];

const DESTINATIONS = [
  { city: "Santorini", country: "Greece",    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80", active: "2.4k" },
  { city: "Kyoto",     country: "Japan",     img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80", active: "3.1k" },
  { city: "Amalfi",    country: "Italy",     img: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=600&q=80", active: "1.8k" },
  { city: "Marrakech", country: "Morocco",   img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80", active: "1.2k" },
  { city: "Bali",      country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", active: "4.7k" },
  { city: "Patagonia", country: "Argentina", img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80", active: "987" },
  { city: "Cape Town", country: "S. Africa", img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80", active: "1.5k" },
  { city: "Banff",     country: "Canada",    img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80", active: "2.1k" },
];

const STEPS = [
  {
    n: "01",
    icon: "✦",
    title: "Build your explorer profile",
    desc: "Share your travel style, dream destinations, and what kind of adventure you're looking for. Upload your best shots.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    n: "02",
    icon: "◈",
    title: "Match with travellers",
    desc: "Find people heading to the same destination. Browse by dates, vibe, budget, and travel style.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    n: "03",
    icon: "❋",
    title: "Go & share your story",
    desc: "Travel together. Post photos, stories, and reels. Inspire thousands of explorers worldwide.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    handle: "@priya.roams",
    avatar: "https://i.pravatar.cc/80?img=47",
    trip: "Mumbai → Patagonia",
    text: "I was terrified of solo travel. Found two amazing companions through TravelTogether for my Patagonia trek. We're already planning Thailand.",
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=80",
  },
  {
    name: "Lucas Meyer",
    handle: "@lucas.explores",
    avatar: "https://i.pravatar.cc/80?img=11",
    trip: "Berlin → Bali",
    text: "The photo feed alone is worth joining. Found hidden Bali spots no guidebook mentions—just from following other travellers on here.",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&q=80",
  },
  {
    name: "Yuki Tanaka",
    handle: "@yuki.wanders",
    avatar: "https://i.pravatar.cc/80?img=32",
    trip: "Tokyo → Santorini",
    text: "Met my best travel buddy on this platform. Four trips together across Europe since then. It's Tinder, but for adventures.",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&q=80",
  },
];

const AVATARS_OVERLAP = [
  "https://i.pravatar.cc/40?img=1",
  "https://i.pravatar.cc/40?img=5",
  "https://i.pravatar.cc/40?img=9",
  "https://i.pravatar.cc/40?img=12",
  "https://i.pravatar.cc/40?img=15",
];

// ─── SMALL ICONS ──────────────────────────────────────────────────────────────

const HeartIcon = ({ filled }) => (
  <svg className={`w-5 h-5 ${filled ? "text-rose-500" : "text-white/70"}`} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = () => (
  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const LocationPinIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const VerifiedIcon = () => (
  <svg className="w-3.5 h-3.5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ─── MINI INSTAGRAM POST CARD ─────────────────────────────────────────────────

function PostCard({ post, className = "" }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className={`bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <img src={post.avatar} alt={post.user} className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/60" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{post.user}</p>
          <div className="flex items-center gap-1 text-white/40">
            <LocationPinIcon />
            <p className="text-[10px] truncate">{post.location}</p>
          </div>
        </div>
      </div>
      {/* Image */}
      <div className="relative aspect-square">
        <img src={post.img} alt={post.location} className="w-full h-full object-cover" />
      </div>
      {/* Actions */}
      <div className="px-3.5 py-2.5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setLiked(!liked)} className="transition-transform active:scale-90" aria-label="Like">
            <HeartIcon filled={liked} />
          </button>
          <p className="text-xs font-semibold text-white">{post.likes} likes</p>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2">
          <span className="font-semibold text-white mr-1">{post.user}</span>
          {post.caption}
        </p>
      </div>
    </div>
  );
}

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePost, setActivePost] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cycle through hero posts
  useEffect(() => {
    const id = setInterval(() => setActivePost((p) => (p + 1) % HERO_POSTS.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── GOOGLE FONTS + ANIMATIONS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Fraunces:ital,wght@0,700;0,900;1,500;1,700&display=swap');

        .font-display { font-family: 'Fraunces', Georgia, serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .anim-fade-up  { opacity: 0; animation: fadeUp 0.7s ease forwards; }
        .anim-fade-in  { animation: fadeIn 0.4s ease forwards; }
        .anim-float    { animation: float 5s ease-in-out infinite; }
        .anim-marquee  { animation: marquee 32s linear infinite; }
        .post-enter    { animation: slideIn 0.45s cubic-bezier(0.34, 1.4, 0.64, 1) forwards; }

        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.2s; }
        .d3 { animation-delay: 0.3s; }
        .d4 { animation-delay: 0.4s; }
        .d5 { animation-delay: 0.5s; }

        .gradient-text {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }

        .glow-hover:hover {
          box-shadow: 0 0 0 1px rgba(245,158,11,0.2), 0 20px 60px rgba(0,0,0,0.5);
        }

        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/6" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-black font-black text-xs">T</span>
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              Travel<span className="gradient-text">Together</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href}
                className="text-sm text-white/50 hover:text-white transition-colors duration-200 tracking-wide">
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Log in
            </a>
            <a href="/register"
              className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-amber-400 transition-colors duration-200">
              Join free
            </a>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-white/70" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#111]/95 backdrop-blur-xl border-t border-white/6 px-5 py-6 flex flex-col gap-5 anim-fade-in">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-base text-white/70 hover:text-white">
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-3 border-t border-white/8">
              <a href="/login" className="text-center text-sm border border-white/20 text-white py-2.5 rounded-full">Log in</a>
              <a href="/register" className="text-center text-sm font-medium bg-white text-black py-2.5 rounded-full hover:bg-amber-400">Join free</a>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 pt-16 overflow-hidden">

        {/* LEFT: Copy */}
        <div className="flex flex-col justify-center px-6 md:px-12 lg:px-16 py-20 lg:py-0">

          {/* Live badge */}
          <div className="anim-fade-up inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-medium px-4 py-2 rounded-full w-fit mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            24,000+ explorers connected worldwide
          </div>

          {/* Headline */}
          <h1 className="anim-fade-up d1 font-display text-5xl md:text-6xl xl:text-[4.5rem] font-black leading-[1.06] tracking-tight text-white mb-6">
            Travel the world.
            <br />
            <span className="gradient-text">Never alone.</span>
          </h1>

          {/* Sub */}
          <p className="anim-fade-up d2 text-base md:text-lg text-white/50 leading-relaxed max-w-md mb-10 font-light">
            The social platform built for travellers. Find your travel buddy, share your journey, and connect with explorers heading exactly where you're going.
          </p>

          {/* CTAs */}
          <div className="anim-fade-up d3 flex flex-wrap items-center gap-4 mb-12">
            <a href="/register"
              className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-amber-400 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/25">
              Start for free
              <ArrowRight />
            </a>
            <a href="#how-it-works"
              className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-2">
              <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </span>
              See how it works
            </a>
          </div>

          {/* Social proof avatars */}
          <div className="anim-fade-up d4 flex items-center gap-4 mb-12">
            <div className="flex -space-x-2.5">
              {AVATARS_OVERLAP.map((src, i) => (
                <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-[#0a0a0a] object-cover" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-xs text-white/40">Loved by <span className="text-white/70">24k+ travellers</span></p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="anim-fade-up d5 flex gap-8 pt-8 border-t border-white/6">
            {[["180+", "Countries"], ["2M+", "Trips shared"], ["98%", "Found a buddy"]].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-2xl font-black text-white">{n}</p>
                <p className="text-xs text-white/30 uppercase tracking-widest mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Animated Post Stack */}
        <div className="hidden lg:flex items-center justify-center relative p-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-rose-500/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />

          <div className="relative w-full max-w-[320px]">
            {/* Peeking cards behind */}
            <div className="absolute top-8 -right-16 w-52 opacity-40 rotate-3 z-0">
              <PostCard post={HERO_POSTS[(activePost + 1) % HERO_POSTS.length]} />
            </div>
            <div className="absolute top-12 -left-16 w-48 opacity-25 -rotate-3 z-0">
              <PostCard post={HERO_POSTS[(activePost + 2) % HERO_POSTS.length]} />
            </div>

            {/* Main card */}
            <div className="relative z-10 anim-float">
              <PostCard post={HERO_POSTS[activePost]} className="post-enter shadow-2xl shadow-black/60" key={activePost} />
            </div>

            {/* Floating buddy notification */}
            <div className="absolute -bottom-8 -right-10 z-20 anim-float" style={{ animationDuration: "4s", animationDelay: "1s" }}>
              <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl whitespace-nowrap">
                <img src="https://i.pravatar.cc/40?img=22" className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/50" alt="" />
                <div>
                  <p className="text-[11px] text-white/50 mb-0.5">New buddy match 🎉</p>
                  <p className="text-xs font-semibold text-white">Sarah is heading to Bali!</p>
                </div>
              </div>
            </div>

            {/* Post indicators */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
              {HERO_POSTS.map((_, i) => (
                <button key={i} onClick={() => setActivePost(i)}
                  className={`rounded-full transition-all duration-300 ${i === activePost ? "w-6 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DESTINATIONS MARQUEE
      ══════════════════════════════════════════════════════ */}
      <section id="explore" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-400 mb-3 flex items-center gap-2">
                <span className="h-px w-6 bg-amber-400 inline-block" />
                Trending destinations
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-black text-white">
                Where everyone's <em className="italic text-amber-400">going</em>
              </h2>
            </div>
            <a href="/login" className="hidden md:flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
              View all <ArrowRight />
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-4 anim-marquee hover:[animation-play-state:paused]" style={{ width: "max-content" }}>
            {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
              <div key={i} className="relative w-60 rounded-2xl overflow-hidden flex-shrink-0 group cursor-pointer" style={{ height: "18rem" }}>
                <img src={d.img} alt={d.city}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{d.country}</p>
                  <p className="font-display text-xl font-bold text-white mb-2">{d.city}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs text-white/50">{d.active} active now</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-lg mx-auto mb-20">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400 mb-4 flex items-center justify-center gap-2">
              <span className="h-px w-6 bg-amber-400 inline-block" />
              Simple by design
              <span className="h-px w-6 bg-amber-400 inline-block" />
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white leading-tight">
              From solo to squad in{" "}
              <em className="italic text-amber-400">3 steps</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {STEPS.map((s) => (
              <div key={s.n}
                className="relative bg-white/[0.03] border border-white/8 rounded-3xl p-8 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300 group glow-hover">
                <div className={`${s.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-xl group-hover:scale-110 transition-transform duration-200`}>
                  {s.icon}
                </div>
                <div className="absolute top-8 right-8 font-display text-6xl font-black text-white/[0.04]">{s.n}</div>
                <h3 className={`font-display text-xl font-bold ${s.color} mb-3`}>{s.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LIVE FEED PREVIEW
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400 mb-4 flex items-center justify-center gap-2">
              <span className="h-px w-6 bg-amber-400 inline-block" />
              Live on the platform
              <span className="h-px w-6 bg-amber-400 inline-block" />
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white">
              Real people, real{" "}
              <em className="italic text-amber-400">adventures</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HERO_POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="/login"
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-6 py-3 rounded-full transition-all duration-200">
              Explore more posts <ArrowRight />
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section id="stories" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-lg mx-auto mb-20">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400 mb-4 flex items-center justify-center gap-2">
              <span className="h-px w-6 bg-amber-400 inline-block" />
              Real stories
              <span className="h-px w-6 bg-amber-400 inline-block" />
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white leading-tight">
              Travellers who found their{" "}
              <em className="italic text-amber-400">people</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="bg-white/[0.03] border border-white/8 rounded-3xl overflow-hidden hover:bg-white/[0.05] transition-all duration-300 glow-hover group">
                <div className="relative h-44 overflow-hidden">
                  <img src={t.img} alt={t.trip}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 text-xs text-white/60 flex items-center gap-1">
                    <LocationPinIcon />{t.trip}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-white/40">{t.handle}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <section className="py-10 pb-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/10 border border-amber-400/20 p-12 md:p-16 text-center">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-amber-400/8 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-rose-500/8 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-400 mb-5">Start today — it's free</p>
              <h2 className="font-display text-4xl md:text-6xl font-black text-white leading-tight mb-5">
                Your next trip starts<br />
                <span className="gradient-text">with one click.</span>
              </h2>
              <p className="text-base text-white/50 max-w-md mx-auto mb-10 leading-relaxed">
                Join 24,000+ explorers who've found their travel tribe. No credit card. No catch. Just adventures.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/register"
                  className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-8 py-4 rounded-full hover:bg-amber-400 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-amber-400/30 w-full sm:w-auto justify-center">
                  Create free account <ArrowRight />
                </a>
                <a href="/login"
                  className="text-sm text-white/50 hover:text-white border border-white/15 hover:border-white/35 px-8 py-4 rounded-full w-full sm:w-auto text-center transition-all duration-200">
                  Already a member? Log in
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-white/30">
                {["✓ Free forever", "✓ Verified profiles", "✓ 180+ countries", "✓ Real-time chat"].map(b => (
                  <span key={b}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/6 py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="text-black font-black text-xs">T</span>
                </div>
                <span className="font-display font-bold text-lg text-white">
                  Travel<span className="gradient-text">Together</span>
                </span>
              </div>
              <p className="text-sm text-white/35 leading-relaxed max-w-xs">
                Find your travel companion. Share your journey. Connect with explorers worldwide.
              </p>
            </div>
            {[
              { title: "Product",  links: ["Explore", "Features", "Pricing"] },
              { title: "Company",  links: ["About", "Blog", "Careers"] },
              { title: "Legal",    links: ["Privacy", "Terms", "Contact"] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs uppercase tracking-widest text-white/25 mb-5">{col.title}</p>
                <ul className="flex flex-col gap-3">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-sm text-white/45 hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">© 2025 TravelTogether. All rights reserved.</p>
            <div className="flex gap-5">
              {["Instagram", "Twitter", "LinkedIn"].map(s => (
                <a key={s} href="#" className="text-xs text-white/25 hover:text-white/70 transition-colors">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}