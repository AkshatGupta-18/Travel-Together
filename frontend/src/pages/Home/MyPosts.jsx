import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"
// ─── ICONS ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg
    className={`w-4 h-4 transition-all ${filled ? "text-rose-500 scale-110" : "text-white/40"}`}
    fill={filled ? "currentColor" : "none"}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = () => (
  <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
  </svg>
);

const MultiImageIcon = () => (
  <svg className="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 16V4a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14a2 2 0 002 2h14v-2H4V6H2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
  </svg>
);

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-9 h-9 rounded-full bg-white/[0.06]" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-3 w-28 rounded-full bg-white/[0.06]" />
          <div className="h-2.5 w-20 rounded-full bg-white/[0.04]" />
        </div>
      </div>
      <div className="mx-4 mb-3 h-56 rounded-xl bg-white/[0.04]" />
      <div className="px-4 pb-4 flex flex-col gap-2">
        <div className="h-2.5 w-16 rounded-full bg-white/[0.04]" />
        <div className="h-3 w-3/4 rounded-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// Note: /api/posts/mine does NOT populate `user` (every post already belongs
// to the logged-in user), so we take the current user's name/avatar as a prop
// instead of reading it off each post like TrendingPosts does.
export default function MyPosts({ currentUser }) {
  const navigate = useNavigate();

  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  // Track optimistic like counts: { [postId]: delta }
  const [likeDelta, setLikeDelta] = useState({});

  useEffect(() => {
    api
      .get("/posts/mine", { withCredentials: true })
      .then((res) => {
        // Already sorted newest-first by the backend (createdAt: -1)
        setPosts(res.data);
      })
      .catch((err) => {
        console.error("Failed to load your posts", err);
        setError("Couldn't load your posts. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleLike = async (postId) => {
    const alreadyLiked = likedPosts.has(postId);

    // Optimistic UI update
    setLikedPosts((prev) => {
      const next = new Set(prev);
      alreadyLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setLikeDelta((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) + (alreadyLiked ? -1 : 1),
    }));

    try {
      await api.post(
        `/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );
    } catch {
      // Roll back on failure
      setLikedPosts((prev) => {
        const next = new Set(prev);
        alreadyLiked ? next.add(postId) : next.delete(postId);
        return next;
      });
      setLikeDelta((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? 0) + (alreadyLiked ? 1 : -1),
      }));
    }
  };

  const formatCount = (n) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60)   return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // ── LOADING ──
  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  // ── ERROR ──
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center rounded-2xl"
        style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}
      >
        <p className="text-sm text-red-400/70 mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2"
        >
          Refresh page
        </button>
      </div>
    );
  }

  // ── EMPTY ──
if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          📸
        </div>
        <p className="text-sm text-white/30">You haven't posted anything yet.</p>
        <a href="/post" className="text-xs text-amber-400/70 hover:text-amber-400 mt-2 underline underline-offset-2">
          Create your first post
        </a>
      </div>
    );
  }

  // ── POSTS ──
  return (
    <div className="flex flex-col gap-5">
      {posts.map((post) => {
        const liked       = likedPosts.has(post._id);
        const baseCount   = post.likes?.length ?? 0;
        const likeCount   = baseCount + (likeDelta[post._id] ?? 0);
        const thumb       = post.photos?.[0];
        const hasMultiple = post.photos?.length > 1;

        return (
          <div key={post._id} className="card overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 pb-3">
              <div
                className="rounded-full shrink-0"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444)",
                  padding: "2px",
                }}
              >
                <img
                  src={currentUser?.avatar || `https://i.pravatar.cc/80?u=${post.user}`}
                  alt={currentUser?.name}
                  className="w-9 h-9 rounded-full object-cover block"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {currentUser?.name ?? "You"}
                </p>
                <p className="text-xs text-white/35 flex items-center gap-1">
                  {post.location && (
                    <>
                      <MapPinIcon />
                      <span>{post.location}</span>
                      <span className="text-white/20">·</span>
                    </>
                  )}
                  {timeAgo(post.createdAt)}
                </p>
              </div>

              <button
                title="Delete post"
                className="text-xs text-white/30 hover:text-red-400 border border-white/10 hover:border-red-400/40 p-2 rounded-full transition-all shrink-0"
              >
                <TrashIcon />
              </button>
            </div>

            {/* Image */}
            {thumb && (
              <div
                className="relative mx-4 mb-3 overflow-hidden rounded-xl"
                style={{ height: "240px" }}
              >
                <img
                  src={thumb}
                  alt={post.caption || post.location || "post"}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                {hasMultiple && (
                  <div className="absolute top-2.5 right-2.5">
                    <MultiImageIcon />
                  </div>
                )}
                {post.mood && (
                  <div
                    className="absolute bottom-2.5 left-2.5 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.75)" }}
                  >
                    {post.mood}
                  </div>
                )}
              </div>
            )}

            {/* Actions + caption */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-4 mb-2.5">
                <button
                  onClick={() => toggleLike(post._id)}
                  className="flex items-center gap-1.5 focus:outline-none"
                >
                  <HeartIcon filled={liked} />
                  <span className={`text-xs transition-colors ${liked ? "text-rose-400" : "text-white/40"}`}>
                    {formatCount(likeCount)}
                  </span>
                </button>

                <button className="flex items-center gap-1.5 focus:outline-none">
                  <CommentIcon />
                  <span className="text-xs text-white/40">{post.comments?.length ?? 0}</span>
                </button>
              </div>

              {post.caption && (
                <p className="text-xs text-white/55 leading-relaxed">
                  <span className="font-semibold text-white/80 mr-1">
                    {currentUser?.username ? `@${currentUser.username}` : currentUser?.name}
                  </span>
                  {post.caption}
                </p>
              )}

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full text-amber-400/60"
                      style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}