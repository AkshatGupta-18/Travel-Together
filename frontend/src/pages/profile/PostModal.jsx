import { useState, useEffect, useCallback } from "react";
import axios from "axios"

// ─── ICONS ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg className={`w-5 h-5 ${filled ? "text-rose-400" : "text-white/50"}`} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9.5 7V5a1.5 1.5 0 011.5-1.5h2a1.5 1.5 0 011.5 1.5v2m-8 0h11l-.7 12.4a2 2 0 01-2 1.85H9.2a2 2 0 01-2-1.85L6.5 7z" />
  </svg>
);
const LocationPinIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ImagesIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ─── MOOD CONFIG ──────────────────────────────────────────────────────────────
const MOOD_CONFIG = {
  adventurous: { emoji: "🧗", color: "from-orange-500/20 to-red-500/20", border: "border-orange-400/30", text: "text-orange-300" },
  relaxed: { emoji: "🌊", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-400/30", text: "text-blue-300" },
  romantic: { emoji: "🌹", color: "from-rose-500/20 to-pink-500/20", border: "border-rose-400/30", text: "text-rose-300" },
  cultural: { emoji: "🏛️", color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-400/30", text: "text-amber-300" },
  foodie: { emoji: "🍜", color: "from-green-500/20 to-emerald-500/20", border: "border-green-400/30", text: "text-green-300" },
  solo: { emoji: "🎒", color: "from-purple-500/20 to-violet-500/20", border: "border-purple-400/30", text: "text-purple-300" },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function PostModal({ post, user, onClose, onPrev, onNext, hasPrev, hasNext, liked, onLike, onDeleted }) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const photos = post.photos ?? [];
  const mood = MOOD_CONFIG[post.mood?.toLowerCase()] ?? null;

  const handleKey = useCallback((e) => {
    if (e.key === "Escape") {
      if (confirmingDelete) setConfirmingDelete(false);
      else onClose();
    }
    if (e.key === "ArrowRight") {
      if (currentPhoto < photos.length - 1) setCurrentPhoto(p => p + 1);
      else if (hasNext) onNext();
    }
    if (e.key === "ArrowLeft") {
      if (currentPhoto > 0) setCurrentPhoto(p => p - 1);
      else if (hasPrev) onPrev();
    }
  }, [currentPhoto, photos.length, onClose, onNext, onPrev, hasPrev, hasNext, confirmingDelete]);

  useEffect(() => {
    setCurrentPhoto(0);
    setConfirmingDelete(false);
    setDeleteError(null);
  }, [post._id]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  
  async function handleDeleteClick() {
  if (!confirmingDelete) {
    setConfirmingDelete(true);
    setDeleteError(null);
    return;
  }

  setDeleting(true);
  setDeleteError(null);

  try {
    await axios.delete(
      `http://localhost:5000/api/posts/${post._id}`,
      {
        withCredentials: true
      }
    );

    onDeleted?.(post._id);
    onClose();

  } catch (err) {
    setDeleteError(
      err.response?.data?.message || "Failed to delete post"
    );

    setDeleting(false);
    setConfirmingDelete(false);
  }
}

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .modal-in { animation: modalIn 0.28s cubic-bezier(0.16,1,0.3,1) both; }
        .photo-fade { animation: fadeIn 0.18s ease both; }

        /* Shared nav-arrow style — used by both the in-photo carousel arrows
           and the between-post arrows outside the modal, so they read as
           one consistent visual language instead of two different button styles. */
        .nav-circle {
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          background: rgba(15,15,15,0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.75);
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
          padding: 0;
        }
        .nav-circle:hover {
          background: rgba(15,15,15,0.92);
          border-color: rgba(255,255,255,0.32);
          color: #fff;
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        }
        .carousel-nav:hover { transform: translateY(-50%) scale(1.06); }
        .carousel-nav.left  { left: 12px; }
        .carousel-nav.right { right: 12px; }

        .post-nav {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 60;
        }
        .post-nav:hover { transform: translateY(-50%) scale(1.06); }
        .post-nav.left  { left: calc(50% - 340px); }
        .post-nav.right { right: calc(50% - 340px); }

        .thumb-btn {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          cursor: pointer;
          transition: opacity 0.2s, border-color 0.2s;
        }
        .thumb-btn img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>

      {/* ── BACKDROP ── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(16px)" }}
        onClick={onClose}
      >
        {/* Between-post nav — outside modal so they float freely */}
        {hasPrev && (
          <button className="nav-circle post-nav left" onClick={e => { e.stopPropagation(); onPrev(); }}>
            <ChevronLeftIcon />
          </button>
        )}
        {hasNext && (
          <button className="nav-circle post-nav right" onClick={e => { e.stopPropagation(); onNext(); }}>
            <ChevronRightIcon />
          </button>
        )}

        {/* ── MODAL ── */}
        <div
          className="modal-in relative flex w-full overflow-hidden"
          style={{
            maxWidth: "900px",
            maxHeight: "92vh",
            margin: "0 60px",
            background: "#111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "1.75rem",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── LEFT: IMAGE ── */}
          <div
            className="relative bg-black flex items-center justify-center"
            style={{
              width: "58%",
              minWidth: "58%",
              minHeight: "520px",
              maxHeight: "92vh",
              overflow: "hidden",
              borderRadius: "1.75rem 0 0 1.75rem",
            }}
          >
            <img
              key={currentPhoto}
              src={photos[currentPhoto]}
              alt={`photo ${currentPhoto + 1}`}
              className="photo-fade"
              style={{ width: "100%", height: "100%", objectFit: "cover", maxHeight: "92vh" }}
            />

            {/* Soft vignette */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%, transparent 70%, rgba(0,0,0,0.2) 100%)",
              pointerEvents: "none",
            }} />

            {/* Photo count pill */}
            {photos.length > 1 && (
              <div style={{
                position: "absolute", top: 14, left: 14,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "9999px",
                padding: "4px 10px",
                display: "flex", alignItems: "center", gap: "5px",
                fontSize: "11px", color: "rgba(255,255,255,0.85)", fontWeight: 600,
              }}>
                <ImagesIcon /> {currentPhoto + 1} / {photos.length}
              </div>
            )}

            {/* Carousel arrows — same visual language as the post-nav arrows */}
            {photos.length > 1 && currentPhoto > 0 && (
              <button className="nav-circle carousel-nav left" onClick={() => setCurrentPhoto(p => p - 1)}>
                <ChevronLeftIcon />
              </button>
            )}
            {photos.length > 1 && currentPhoto < photos.length - 1 && (
              <button className="nav-circle carousel-nav right" onClick={() => setCurrentPhoto(p => p + 1)}>
                <ChevronRightIcon />
              </button>
            )}

            {/* Dot indicators */}
            {photos.length > 1 && (
              <div style={{
                position: "absolute", bottom: 16,
                left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: "6px", alignItems: "center",
              }}>
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    style={{
                      width: i === currentPhoto ? "20px" : "6px",
                      height: "6px",
                      borderRadius: "9999px",
                      background: i === currentPhoto ? "#f59e0b" : "rgba(255,255,255,0.3)",
                      transition: "all 0.25s",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: INFO ── */}
          <div
            className="flex flex-col overflow-y-auto"
            style={{
              flex: 1,
              maxHeight: "92vh",
              padding: "24px",
              gap: "20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close btn */}
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 14, right: 14, zIndex: 20,
                width: "32px", height: "32px",
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >
              <CloseIcon />
            </button>

            {/* User row */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ background: "linear-gradient(135deg,#f59e0b,#f97316,#ef4444)", padding: "2px", borderRadius: "9999px", display: "inline-flex", flexShrink: 0 }}>
                <img src={user.avatar} alt={user.name} style={{ width: "42px", height: "42px", borderRadius: "9999px", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "white", marginBottom: "1px" }}>{user.name}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>@{user.username}</p>
              </div>
              {formattedDate && (
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>{formattedDate}</p>
              )}
            </div>

            {/* Location */}
            {post.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(245,158,11,0.8)" }}>
                <LocationPinIcon />
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{post.location}</span>
              </div>
            )}

            {/* Mood */}
            {post.mood && mood && (
              <div className={`inline-flex items-center gap-2 self-start px-3 py-2 rounded-xl bg-gradient-to-r ${mood.color} border ${mood.border}`}
                style={{ fontSize: "12px" }}>
                <span style={{ fontSize: "16px" }}>{mood.emoji}</span>
                <span className={`font-semibold capitalize ${mood.text}`}>{post.mood} vibes</span>
              </div>
            )}

            {/* Caption */}
            {post.caption && (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "14px 16px",
              }}>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
                  {post.caption}
                </p>
              </div>
            )}

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div>
                <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.2)", marginBottom: "10px" }}>
                  All photos
                </p>
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      className="thumb-btn"
                      onClick={() => setCurrentPhoto(i)}
                      style={{
                        border: i === currentPhoto ? "2px solid #f59e0b" : "2px solid rgba(255,255,255,0.08)",
                        opacity: i === currentPhoto ? 1 : 0.5,
                      }}
                    >
                      <img src={photo} alt="" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Actions */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <button
                onClick={() => onLike(post._id)}
                style={{ display: "flex", alignItems: "center", gap: "7px", color: liked ? "#fb7185" : "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fb7185"}
                onMouseLeave={e => e.currentTarget.style.color = liked ? "#fb7185" : "rgba(255,255,255,0.4)"}
              >
                <HeartIcon filled={liked} />
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{post.likes ?? 0}</span>
              </button>

              {!confirmingDelete ? (
                <button
                  onClick={handleDeleteClick}
                  title="Delete post"
                  style={{ display: "flex", alignItems: "center", gap: "7px", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                >
                  <TrashIcon />
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {deleteError && (
                    <span style={{ fontSize: "11px", color: "#f87171" }}>{deleteError}</span>
                  )}
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Delete this post?</span>
                  <button
                    onClick={handleDeleteClick}
                    disabled={deleting}
                    style={{
                      fontSize: "12px", fontWeight: 600,
                      color: "#fff", background: "#dc2626",
                      border: "none", borderRadius: "8px",
                      padding: "6px 12px", cursor: deleting ? "default" : "pointer",
                      opacity: deleting ? 0.7 : 1,
                    }}
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                    style={{
                      fontSize: "12px", fontWeight: 500,
                      color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                      padding: "6px 12px", cursor: deleting ? "default" : "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}