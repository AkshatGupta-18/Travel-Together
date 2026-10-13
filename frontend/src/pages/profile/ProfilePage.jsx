import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"
import Navbar from "../Home/Navbar";
import PostModal from "./PostModal";
import ProfileTrips from "./ProfileTrips";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg className={`w-4 h-4 ${filled ? "text-rose-400" : "text-white/60"}`} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const CommentIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const LocationPinIcon = () => (
  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const TripIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 16l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ImagesIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ─── MOOD CONFIG ──────────────────────────────────────────────────────────────
const MOOD_CONFIG = {
  adventurous: { emoji: "🧗", color: "from-orange-500/20 to-red-500/20", border: "border-orange-400/30", text: "text-orange-400" },
  relaxed: { emoji: "🌊", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-400/30", text: "text-blue-400" },
  romantic: { emoji: "🌹", color: "from-rose-500/20 to-pink-500/20", border: "border-rose-400/30", text: "text-rose-400" },
  cultural: { emoji: "🏛️", color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-400/30", text: "text-amber-400" },
  foodie: { emoji: "🍜", color: "from-green-500/20 to-emerald-500/20", border: "border-green-400/30", text: "text-green-400" },
  solo: { emoji: "🎒", color: "from-purple-500/20 to-violet-500/20", border: "border-purple-400/30", text: "text-purple-400" },
};



// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPostIdx, setSelectedPostIdx] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());


  useEffect(() => {
    api.get("/users/me", { withCredentials: true })
      .then((res) => {
        const d = res.data;
        setUser({
          name: d.name ?? "Traveller",
          username: d.username ?? "",
          avatar: d.avatar ?? "https://i.pravatar.cc/160?img=11",
          location: d.location ?? "",
          bio: d.bio ?? "",
          travelStyle: d.travelStyles ?? [],
          dreamDestinations: d.dreamDestinations ?? [],
          tripsCount: 12,
          countriesCount: 8,
        });

        // seed which of these posts the logged-in user has already liked
        api.get("/posts/mine", { withCredentials: true })
          .then((postsRes) => {
            const liked = postsRes.data
              .filter(p => p.likes?.includes(d._id))
              .map(p => p._id);
            setLikedPosts(new Set(liked));

            const normalizedPosts = postsRes.data.map(p => ({
              ...p,
              likes: Array.isArray(p.likes) ? p.likes.length : p.likes ?? 0,
            }));
            setPosts(normalizedPosts);
          })
          .catch((err) => console.error("Failed to load posts", err));
      })
      .catch((err) => console.error("Failed to load user", err));
  }, []);

  const toggleLike = async (postId) => {
    const wasLiked = likedPosts.has(postId);

    setLikedPosts(prev => {
      const next = new Set(prev);
      wasLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts(prev => prev.map(p =>
      p._id === postId
        ? { ...p, likes: (p.likes ?? 0) + (wasLiked ? -1 : 1) }
        : p
    ));

    try {
      const res = await api.patch(
        `/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, likes: res.data.likes } : p
      ));
    } catch (err) {
      console.error("Failed to update like", err);
      setLikedPosts(prev => {
        const next = new Set(prev);
        wasLiked ? next.add(postId) : next.delete(postId);
        return next;
      });
      setPosts(prev => prev.map(p =>
        p._id === postId
          ? { ...p, likes: (p.likes ?? 0) + (wasLiked ? 1 : -1) }
          : p
      ));
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const selectedPost = selectedPostIdx !== null ? posts[selectedPostIdx] : null;

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,500&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .anim-fade-up  { animation: fadeUp  0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-modal-in { animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.1s; }

        .gradient-text {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }
        .avatar-ring {
          background: linear-gradient(135deg, #f59e0b, #f97316, #ef4444);
          padding: 3px;
          border-radius: 9999px;
          display: inline-flex;
        }
        .card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1.25rem;
          transition: all 0.25s ease;
        }
        .stat-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .post-thumb {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 0.75rem;
          cursor: pointer;
          background: rgba(255,255,255,0.04);
        }
        .post-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .post-thumb:hover img { transform: scale(1.07); }
        .post-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          opacity: 0;
          transition: opacity 0.25s ease;
          border-radius: 0.75rem;
        }
        .post-thumb:hover .post-thumb-overlay { opacity: 1; }
        .multi-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          border-radius: 6px;
          padding: 3px 6px;
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          color: rgba(255,255,255,0.8);
          font-weight: 600;
        }
        .profile-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          transition: all 0.2s;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .profile-tab:hover { color: rgba(255,255,255,0.7); }
        .profile-tab.active {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.1);
          color: white;
        }
        .tag-pill {
          font-size: 0.75rem;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          color: rgba(245,158,11,0.85);
          font-weight: 500;
        }
        .dream-chip {
          font-size: 0.75rem;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
        }
        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

      <Navbar user={user} />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── PROFILE HEADER ── */}
        <div className="anim-fade-up flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <div className="avatar-ring shrink-0">
            <img src={user.avatar} alt={user.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="font-display text-2xl font-black text-white">{user.name}</h1>
              <button
                onClick={() => navigate("/profile/edit")}
                className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-full transition-all self-center sm:self-auto"
              >
                <EditIcon /> Edit profile
              </button>
            </div>

            <p className="text-sm text-white/35 mb-2">@{user.username}</p>

            {user.location && (
              <p className="inline-flex items-center gap-1 text-xs text-amber-400/70 mb-3">
                <LocationPinIcon /> {user.location}
              </p>
            )}

            {user.bio && (
              <p className="text-sm text-white/55 leading-relaxed mb-4 max-w-sm">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mb-4">
              {[
                { label: "posts", value: posts.length, gradient: false },
              ].map(({ label, value, gradient }, i, arr) => (
                <div key={label} className="flex items-center gap-6">
                  <div className="stat-block">
                    <span className={`text-lg font-bold ${gradient ? "" : "text-white"}`}>
                      {gradient ? <span className="gradient-text">{value}</span> : value}
                    </span>
                    <span className="text-xs text-white/35">{label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-8 bg-white/[0.06]" />}
                </div>
              ))}
            </div>

            {user.travelStyle.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                {user.travelStyle.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
              </div>
            )}

            {user.dreamDestinations.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center">
                <span className="text-xs text-white/20">dreaming of</span>
                {user.dreamDestinations.map(dest => (
                  <span key={dest} className="dream-chip">✦ {dest}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-white/[0.06] mb-6" />

        {/* ── TABS ── */}
        <div className="anim-fade-up d1 flex items-center gap-2 mb-6">
          <button className={`profile-tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
            <GridIcon /> Posts
          </button>
          <button className={`profile-tab ${activeTab === "trips" ? "active" : ""}`} onClick={() => setActiveTab("trips")}>
            <TripIcon /> Trips
          </button>
        </div>

        {/* ── POSTS GRID ── */}
        {activeTab === "posts" && (
          <div className="anim-fade-up d2">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-4xl">📷</span>
                <p className="text-sm text-white/30">No posts yet. Share your first adventure!</p>
                <button
                  onClick={() => navigate("/post")}
                  className="mt-2 text-xs font-semibold text-black bg-white hover:bg-amber-400 transition-colors px-4 py-2 rounded-full"
                >
                  Create post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {posts.map((post, idx) => (
                  <div
                    key={post._id}
                    className="post-thumb"
                    onClick={() => setSelectedPostIdx(idx)}
                  >
                    <img src={post.photos?.[0]} alt={post.location} loading="lazy" />

                    {/* Multi-photo badge */}
                    {post.photos?.length > 1 && (
                      <div className="multi-badge">
                        <ImagesIcon /> {post.photos.length}
                      </div>
                    )}

                    {/* Hover overlay */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(post._id); }}
                      className="flex items-center gap-1.5 text-white font-semibold text-sm"
                    >
                      <HeartIcon filled={likedPosts.has(post._id)} /> {post.likes ?? 0}
                    </button>

                    {/* Location */}
                    {post.location && (
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent rounded-b-[0.75rem]">
                        <p className="text-[10px] text-white/70 flex items-center gap-1 truncate">
                          <LocationPinIcon /> {post.location}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TRIPS TAB ── */}
        {activeTab === "trips" && (
          <div className="anim-fade-up d2">
            <ProfileTrips />
          </div>
        )}
      </div>

      <div className="h-20 md:h-0" />

      {/* ── POST DETAIL MODAL ── */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          user={user}
          onClose={() => setSelectedPostIdx(null)}
          onPrev={() => setSelectedPostIdx(i => Math.max(0, i - 1))}
          onNext={() => setSelectedPostIdx(i => Math.min(posts.length - 1, i + 1))}
          hasPrev={selectedPostIdx > 0}
          hasNext={selectedPostIdx < posts.length - 1}
          liked={likedPosts.has(selectedPost._id)}
          onLike={toggleLike}
          onDeleted={handlePostDeleted}
        />
      )}
    </div>
  );
}