import { useState } from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const MapPinIcon = () => (
  <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg
    width="21" height="21"
    fill={filled ? "#f43f5e" : "none"}
    viewBox="0 0 24 24"
    stroke={filled ? "#f43f5e" : "currentColor"}
    strokeWidth={2}
    style={{ transition: "transform 0.15s ease", transform: filled ? "scale(1.08)" : "scale(1)" }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const BookmarkIcon = () => (
  <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

// ─── LIKE COUNT FORMAT ─────────────────────────────────────────────────────────
function formatLikes(n) {
  const num = n ?? 0;
  if (num < 1000) return `${num.toLocaleString()} ${num === 1 ? "like" : "likes"}`;
  if (num < 1_000_000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K likes`;
  return `${(num / 1_000_000).toFixed(1)}M likes`;
}

// ─── SINGLE POST CARD ───────────────────────────────────────────────────────────
function PostCard({ post, profileUser, liked, onLike }) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = post.photos ?? [];

  return (
    <article
      style={{
        background: "var(--tt-surface)",
        border: "1px solid var(--tt-border)",
        borderRadius: "var(--tt-radius-md)",
        overflow: "hidden",
        marginBottom: 18,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5" style={{ padding: "12px 16px" }}>
        <div className="tt-avatar-ring-sm">
          <img
            src={profileUser.avatar || `https://i.pravatar.cc/80?u=${profileUser._id}`}
            alt=""
            style={{ width: 28, height: 28, borderRadius: "9999px", objectFit: "cover", display: "block" }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: "var(--tt-text)" }}>{profileUser.name}</p>
          {post.location && (
            <p className="flex items-center gap-1" style={{ fontSize: 10.5, color: "var(--tt-text-faint)" }}>
              <MapPinIcon />
              {post.location}
            </p>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="relative w-full" style={{ background: "#000", height: 380 }}>
        {images.length > 0 ? (
          <img
            src={images[imgIndex]}
            alt={post.caption || "post"}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--tt-text-faint)" }}>
            No image
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={() => setImgIndex(i => Math.max(i - 1, 0))}
              disabled={imgIndex === 0}
              className="absolute flex items-center justify-center"
              style={{
                left: 8, top: "50%", transform: "translateY(-50%)",
                width: 30, height: 30, borderRadius: "9999px",
                background: "rgba(0,0,0,0.55)", color: "#fff",
                opacity: imgIndex === 0 ? 0.3 : 1,
              }}
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={() => setImgIndex(i => Math.min(i + 1, images.length - 1))}
              disabled={imgIndex === images.length - 1}
              className="absolute flex items-center justify-center"
              style={{
                right: 8, top: "50%", transform: "translateY(-50%)",
                width: 30, height: 30, borderRadius: "9999px",
                background: "rgba(0,0,0,0.55)", color: "#fff",
                opacity: imgIndex === images.length - 1 ? 0.3 : 1,
              }}
            >
              <ChevronRightIcon />
            </button>
            <div
              className="absolute"
              style={{
                top: 10, right: 10, fontSize: 10.5, padding: "2px 8px",
                borderRadius: "9999px", background: "rgba(0,0,0,0.55)", color: "#fff",
              }}
            >
              {imgIndex + 1}/{images.length}
            </div>
            <div className="absolute flex gap-1.5" style={{ bottom: 10, left: "50%", transform: "translateX(-50%)" }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  style={{
                    width: i === imgIndex ? 14 : 5, height: 5, borderRadius: "9999px",
                    background: i === imgIndex ? "var(--tt-accent-1)" : "rgba(255,255,255,0.4)",
                    transition: "width 0.2s ease",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between" style={{ padding: "12px 16px 0" }}>
        <button onClick={() => onLike(post._id)} style={{ color: "var(--tt-text-dim)" }} className="active:scale-90 transition-transform">
          <HeartIcon filled={liked} />
        </button>
        <button style={{ color: "var(--tt-text-dim)" }} className="active:scale-90 transition-transform">
          <BookmarkIcon />
        </button>
      </div>

      {/* Real like count */}
      <p
        className="text-xs font-semibold"
        style={{ padding: "8px 16px 0", color: liked ? "#f43f5e" : "var(--tt-text)" }}
      >
        {formatLikes(post.likes)}
      </p>

      {/* Caption */}
      {post.caption && (
        <p className="text-xs leading-snug" style={{ padding: "4px 16px 0", color: "var(--tt-text-dim)" }}>
          <span className="font-semibold" style={{ color: "var(--tt-text)", marginRight: 6 }}>{profileUser.name}</span>
          {post.caption}
        </p>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5" style={{ padding: "8px 16px 0" }}>
          {post.tags.map(tag => (
            <span key={tag} className="tt-chip" style={{ fontSize: 10.5, padding: "2px 9px" }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <p
        className="uppercase"
        style={{ padding: "10px 16px 14px", fontSize: 10, letterSpacing: "0.06em", color: "var(--tt-text-faint)" }}
      >
        {post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : ""}
      </p>
    </article>
  );
}

// ─── POSTS SECTION ────────────────────────────────────────────────────────────
// Props:
//   posts        - array of post objects (post.likes is the real, current count)
//   profileUser  - the profile owner
//   likedPosts   - Set of liked post ids
//   toggleLike   - fn(postId) => void
export default function PostsSection({ posts, profileUser, likedPosts, toggleLike }) {
  return (
    <div className="tt-shell" style={{ paddingTop: 20 }}>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: "64px 0" }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 56, height: 56, borderRadius: "var(--tt-radius-md)", fontSize: 24,
              background: "var(--tt-surface)", border: "1px solid var(--tt-border)", marginBottom: 16,
            }}
          >
            📸
          </div>
          <p className="text-sm" style={{ color: "var(--tt-text-faint)" }}>No posts yet</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            profileUser={profileUser}
            liked={likedPosts.has(post._id)}
            onLike={toggleLike}
          />
        ))
      )}

      {/* Bottom padding for mobile nav */}
      <div style={{ height: 32 }} />
    </div>
  );
}