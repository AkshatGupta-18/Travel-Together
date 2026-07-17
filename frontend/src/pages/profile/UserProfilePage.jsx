import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const MessageIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const GlobeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg className={`w-5 h-5 transition-all ${filled ? "text-rose-500 scale-110" : "text-white/60"}`} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

// ─── POST MODAL ───────────────────────────────────────────────────────────────
function PostModal({ post, onClose, onLike, liked }) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = post.photos ?? [];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setImgIndex(i => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft") setImgIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl flex rounded-2xl overflow-hidden"
        style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Image side */}
        <div className="relative flex-1 bg-black flex items-center justify-center" style={{ minHeight: "400px" }}>
          {images.length > 0 ? (
            <img
              src={images[imgIndex]}
              alt="post"
              className="w-full h-full object-cover"
              style={{ maxHeight: "90vh" }}
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center text-white/20 text-sm">No image</div>
          )}

          {/* Carousel nav */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex(i => Math.max(i - 1, 0))}
                disabled={imgIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: "rgba(0,0,0,0.5)", opacity: imgIndex === 0 ? 0.3 : 1 }}
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={() => setImgIndex(i => Math.min(i + 1, images.length - 1))}
                disabled={imgIndex === images.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: "rgba(0,0,0,0.5)", opacity: imgIndex === images.length - 1 ? 0.3 : 1 }}
              >
                <ChevronRightIcon />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className="rounded-full transition-all"
                    style={{ width: i === imgIndex ? "16px" : "6px", height: "6px", background: i === imgIndex ? "#f59e0b" : "rgba(255,255,255,0.4)" }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info side */}
        <div className="w-72 flex flex-col" style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Header */}
          <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="avatar-ring-sm">
              <img src={post.user?.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{post.user?.name}</p>
              {post.location && <p className="text-xs text-white/35 flex items-center gap-1"><MapPinIcon />{post.location}</p>}
            </div>
          </div>

          {/* Caption */}
          <div className="flex-1 p-4 overflow-y-auto">
            {post.caption && (
              <p className="text-sm text-white/70 leading-relaxed mb-4">{post.caption}</p>
            )}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full text-amber-400/70" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>#{tag}</span>
                ))}
              </div>
            )}
            <p className="text-xs text-white/20">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
            </p>
          </div>

          {/* Actions */}
          <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <button onClick={() => onLike(post._id)} className="flex items-center gap-2 mb-1">
              <HeartIcon filled={liked} />
              <span className={`text-sm font-medium ${liked ? "text-rose-400" : "text-white/50"}`}>
                {(post.likes || 0) + (liked ? 1 : 0)} likes
              </span>
            </button>
          </div>
        </div>

        {/* Close btn */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`http://localhost:5000/api/users/${userId}`, { withCredentials: true }),
      axios.get(`http://localhost:5000/api/posts/user/${userId}`, { withCredentials: true }),
    ])
      .then(([userRes, postsRes]) => {
        setProfileUser(userRes.data);
        setPosts(postsRes.data);
      })
      .catch(err => console.error("Failed to load profile", err))
      .finally(() => setLoading(false));
  }, [userId]);

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080808" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
          <p className="text-sm text-white/30">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080808" }}>
        <div className="text-center">
          <p className="text-white/40 mb-4">User not found</p>
          <button onClick={() => navigate(-1)} className="text-amber-400 text-sm">← Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "#080808", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .gradient-text {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.1s; }
        .d3 { animation-delay: 0.15s; }

        .avatar-ring {
          background: linear-gradient(135deg, #f59e0b, #f97316, #ef4444);
          padding: 2.5px;
          border-radius: 9999px;
          display: inline-block;
        }
        .avatar-ring-sm {
          background: linear-gradient(135deg, #f59e0b, #f97316, #ef4444);
          padding: 2px;
          border-radius: 9999px;
          display: inline-block;
        }
        .post-tile {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          aspect-ratio: 1;
        }
        .post-tile img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .post-tile:hover img { transform: scale(1.07); }
        .post-tile-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          transition: background 0.3s ease;
        }
        .post-tile:hover .post-tile-overlay { background: rgba(0,0,0,0.45); }
        .post-tile-overlay span {
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.25s, transform 0.25s;
        }
        .post-tile:hover .post-tile-overlay span { opacity: 1; transform: translateY(0); }
        .stat-item { text-align: center; }
        .stat-item .num { font-size: 1.25rem; font-weight: 700; color: white; line-height: 1; }
        .stat-item .lbl { font-size: 0.7rem; color: rgba(255,255,255,0.35); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.08em; }
        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

      {/* ── STICKY TOP BAR ── */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 h-14"
        style={{ background: "rgba(8,8,8,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <BackIcon />
        </button>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">{profileUser.name}</p>
          <p className="text-xs text-white/30">@{profileUser.username}</p>
        </div>
      </div>

      {/* ── PROFILE HEADER ── */}
      <div className="max-w-[640px] mx-auto px-4 pt-8 pb-4 anim-up">

        {/* Avatar + Stats row */}
        <div className="flex items-center gap-6 mb-6">
          <div className="avatar-ring shrink-0">
            <img
              src={profileUser.avatar || `https://i.pravatar.cc/160?u=${profileUser._id}`}
              alt={profileUser.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
            />
          </div>

          {/* Stats */}
          <div className="flex gap-6 flex-1 justify-around">
            <div className="stat-item">
              <p className="num">{posts.length}</p>
              <p className="lbl">Posts</p>
            </div>
            <div className="stat-item">
              <p className="num">{profileUser.buddiesCount ?? 0}</p>
              <p className="lbl">Buddies</p>
            </div>
            <div className="stat-item">
              <p className="num">{profileUser.countriesCount ?? 0}</p>
              <p className="lbl">Countries</p>
            </div>
          </div>
        </div>

        {/* Name + bio */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-base font-bold text-white">{profileUser.name}</h1>
          </div>
          <p className="text-xs text-white/35 mb-2">@{profileUser.username}</p>

          {profileUser.location && (
            <p className="text-xs text-white/45 flex items-center gap-1.5 mb-2">
              <span className="text-amber-400/60"><MapPinIcon /></span>
              {profileUser.location}
            </p>
          )}

          {profileUser.bio && (
            <p className="text-sm text-white/65 leading-relaxed mb-3">{profileUser.bio}</p>
          )}

          {/* Travel styles */}
          {profileUser.travelStyles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {profileUser.travelStyles.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Dream destinations */}
          {profileUser.dreamDestinations?.length > 0 && (
            <p className="text-xs text-white/35 flex items-center gap-1.5">
              <GlobeIcon />
              Dreams of:{" "}
              <span className="text-white/55">
                {profileUser.dreamDestinations.slice(0, 3).join(", ")}
              </span>
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5 mb-6 anim-up d1">
          <button
            onClick={() => setConnected(c => !c)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={connected
              ? { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }
              : { background: "white", color: "black" }
            }
          >
            {connected ? <><CheckIcon /> Connected</> : "Connect"}
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
          >
            <MessageIcon /> Message
          </button>
        </div>

        {/* Match badge */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl mb-6 anim-up d2"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs text-white/50">Travel compatibility</p>
          </div>
          <p className="text-sm font-bold" style={{ color: "#fbbf24" }}>
            {Math.floor(Math.random() * 20) + 75}% match
          </p>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

      {/* ── POSTS GRID ── */}
      <div className="max-w-[640px] mx-auto px-4 pt-4 anim-up d3">
        <div className="flex items-center gap-2 mb-4">
          <GridIcon />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">Posts</span>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              📸
            </div>
            <p className="text-sm text-white/30">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map(post => {
              const thumb = post.photos?.[0];

              return (
                <div
                  key={post._id}
                  className="post-tile"
                  onClick={() => setSelectedPost(post)}
                >
                  {thumb ? (
                    <img src={thumb} alt={post.caption} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10 text-xs" style={{ background: "#111" }}>
                      No img
                    </div>
                  )}
                  {/* Multi-image indicator */}
                  {post.images?.length > 1 && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 16V4a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14a2 2 0 002 2h14v-2H4V6H2z" />
                      </svg>
                    </div>
                  )}
                  <div className="post-tile-overlay">
                    <span>❤️ {post.likes || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Bottom padding for mobile nav */}
        <div className="h-24 md:h-8" />
      </div>

      {/* ── POST MODAL ── */}
      {selectedPost && (
        <PostModal
          post={{ ...selectedPost, user: profileUser }}
          onClose={() => setSelectedPost(null)}
          onLike={toggleLike}
          liked={likedPosts.has(selectedPost._id)}
        />
      )}
    </div>
  );
}