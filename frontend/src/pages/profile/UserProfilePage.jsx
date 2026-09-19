import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PostsSection from "./PostsSection";
import ChatWindow from "./ChatWindow";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
  </svg>
);
const MessageIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
  </svg>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [showChat, setShowChat] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);   // NEW — logged-in user's id
  const [conversationId, setConversationId] = useState(null); // NEW — active chat thread's id

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:5000/api/users/me", { withCredentials: true }),
      axios.get(`http://localhost:5000/api/users/${userId}`, { withCredentials: true }),
      axios.get(`http://localhost:5000/api/posts/user/${userId}`, { withCredentials: true }),
    ])
      .then(([meRes, userRes, postsRes]) => {
        const currentUserId = meRes.data._id;
        setCurrentUserId(currentUserId); // NEW — persist logged-in user's id to state
        setProfileUser(userRes.data);

        const liked = postsRes.data
          .filter(p => p.likes?.includes(currentUserId))
          .map(p => p._id);
        setLikedPosts(new Set(liked));

        const normalizedPosts = postsRes.data.map(p => ({
          ...p,
          likes: Array.isArray(p.likes) ? p.likes.length : p.likes ?? 0,
        }));
        setPosts(normalizedPosts);
      })
      .catch(err => console.error("Failed to load profile", err))
      .finally(() => setLoading(false));
  }, [userId]);

  // Close chat automatically if the user navigates to a different profile
  useEffect(() => {
    setShowChat(false);
    setConversationId(null); // NEW — clear stale conversation when switching profiles
  }, [userId]);

  // NEW — find or create a conversation with this profile's user, then open the chat panel
  const handleOpenChat = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/conversations/find-or-create",
        { userId: profileUser._id },
        { withCredentials: true }
      );
      setConversationId(res.data._id);
      setShowChat(true);
    } catch (err) {
      console.error("Failed to open conversation", err);
    }
  };

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
      const res = await axios.patch(
        `http://localhost:5000/api/posts/${postId}/like`,
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

  // ─── SHARED DESIGN TOKENS (single source of truth for this page + PostsSection) ───
  const GlobalTokens = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,900&display=swap');

      :root {
        --tt-bg: #080808;
        --tt-surface: #101012;
        --tt-surface-2: #16161a;
        --tt-border: rgba(255,255,255,0.09);
        --tt-border-soft: rgba(255,255,255,0.05);
        --tt-text: #f5f5f4;
        --tt-text-dim: rgba(245,245,244,0.55);
        --tt-text-faint: rgba(245,245,244,0.30);
        --tt-accent-1: #f59e0b;
        --tt-accent-2: #f97316;
        --tt-accent-3: #ef4444;
        --tt-radius-lg: 20px;
        --tt-radius-md: 14px;
        --tt-radius-sm: 10px;
        --tt-content-w: 480px;
        --tt-gutter: 20px;
      }

      .tt-font-display { font-family: 'Fraunces', Georgia, serif; }
      .tt-font-body { font-family: 'DM Sans', sans-serif; }

      .tt-shell {
        width: 100%;
        max-width: var(--tt-content-w);
        margin: 0 auto;
        padding: 0 var(--tt-gutter);
        box-sizing: border-box;
      }

      .tt-gradient-text {
        background: linear-gradient(135deg, var(--tt-accent-1) 0%, var(--tt-accent-2) 50%, var(--tt-accent-3) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      @keyframes tt-fade-up {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .tt-anim { animation: tt-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both; }
      .tt-d1 { animation-delay: 0.05s; }
      .tt-d2 { animation-delay: 0.1s; }
      .tt-d3 { animation-delay: 0.15s; }

      .tt-avatar-ring {
        background: linear-gradient(135deg, var(--tt-accent-1), var(--tt-accent-2), var(--tt-accent-3));
        padding: 3px;
        border-radius: 9999px;
        display: inline-block;
      }
      .tt-avatar-ring-sm {
        background: linear-gradient(135deg, var(--tt-accent-1), var(--tt-accent-2), var(--tt-accent-3));
        padding: 2px;
        border-radius: 9999px;
        display: inline-block;
      }

      /* Boxed stat — same visual language as tt-chip / the compatibility badge,
         so a lone number doesn't just float in empty space next to the avatar. */
      .tt-stat-card {
        background: var(--tt-surface);
        border: 1px solid var(--tt-border);
        border-radius: var(--tt-radius-md);
        padding: 10px 22px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 88px;
      }
      .tt-stat-card .num {
        font-family: 'DM Sans', sans-serif;
        font-variant-numeric: tabular-nums;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--tt-text);
        line-height: 1;
      }
      .tt-stat-card .lbl {
        font-size: 0.68rem;
        color: var(--tt-text-faint);
        margin-top: 3px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .tt-btn {
        font-family: 'DM Sans', sans-serif;
        font-weight: 600;
        font-size: 0.85rem;
        border-radius: var(--tt-radius-sm);
        padding: 10px 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        transition: filter 0.15s ease, transform 0.1s ease;
        cursor: pointer;
        border: none;
      }
      .tt-btn:active { transform: scale(0.98); }
      .tt-btn-secondary {
        background: rgba(255,255,255,0.05);
        color: var(--tt-text-dim);
        border: 1px solid var(--tt-border);
      }
      .tt-btn-secondary:hover { background: rgba(255,255,255,0.08); }
      .tt-btn-secondary.tt-active {
        background: rgba(245,158,11,0.1);
        color: #fbbf24;
        border: 1px solid rgba(245,158,11,0.24);
      }

      .tt-chip {
        font-size: 0.72rem;
        padding: 4px 11px;
        border-radius: 9999px;
        font-weight: 500;
        background: rgba(245,158,11,0.1);
        border: 1px solid rgba(245,158,11,0.22);
        color: #fbbf24;
      }

      .tt-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px var(--tt-gutter) 0;
        max-width: var(--tt-content-w);
        margin: 0 auto;
        box-sizing: border-box;
      }
      .tt-divider .line {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--tt-border), transparent);
      }
      .tt-divider .label {
        font-size: 0.68rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--tt-text-faint);
        white-space: nowrap;
      }

      .tt-main-col {
        flex: 1;
        min-width: 0;
        transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
      }

      ::-webkit-scrollbar { width: 0; height: 0; }
    `}</style>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center tt-font-body" style={{ background: "#080808" }}>
        {GlobalTokens}
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-full animate-spin"
            style={{ width: 36, height: 36, border: "2.5px solid rgba(245,158,11,0.25)", borderTopColor: "#f59e0b" }}
          />
          <p className="text-sm" style={{ color: "var(--tt-text-faint)" }}>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center tt-font-body" style={{ background: "#080808" }}>
        {GlobalTokens}
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--tt-text-dim)" }}>User not found</p>
          <button onClick={() => navigate(-1)} className="text-sm tt-gradient-text font-semibold">← Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen tt-font-body" style={{ background: "var(--tt-bg)", color: "var(--tt-text)", display: "flex" }}>
      {GlobalTokens}

      {/* ── MAIN PROFILE COLUMN (shrinks when chat opens) ── */}
      <div className="tt-main-col">

        {/* ── STICKY TOP BAR ── */}
        <div
          className="sticky top-0 z-30 flex items-center gap-3"
          style={{
            height: 56,
            padding: "0 var(--tt-gutter)",
            background: "rgba(8,8,8,0.88)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--tt-border-soft)",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center transition-all"
            style={{
              width: 34, height: 34, borderRadius: "var(--tt-radius-sm)",
              color: "var(--tt-text-dim)", background: "transparent",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--tt-text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--tt-text-dim)"; }}
          >
            <BackIcon />
          </button>
          <div>
            <p className="text-sm font-semibold leading-tight">{profileUser.name}</p>
            <p className="text-xs" style={{ color: "var(--tt-text-faint)" }}>@{profileUser.username}</p>
          </div>
        </div>

        {/* ── PROFILE HEADER ── */}
        <div className="tt-shell tt-anim" style={{ paddingTop: 32, paddingBottom: 20 }}>

          {/* Avatar + Stat card row */}
          <div className="flex items-center justify-between mb-6">
            <div className="tt-avatar-ring shrink-0">
              <img
                src={profileUser.avatar || `https://i.pravatar.cc/160?u=${profileUser._id}`}
                alt={profileUser.name}
                style={{ width: 84, height: 84, borderRadius: "9999px", objectFit: "cover", display: "block" }}
              />
            </div>

            <div className="tt-stat-card">
              <p className="num">{posts.length}</p>
              <p className="lbl">Posts</p>
            </div>
          </div>

          {/* Name + bio */}
          <div className="mb-5">
            <h1 className="tt-font-display" style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 2 }}>
              {profileUser.name}
            </h1>
            <p className="text-xs mb-2" style={{ color: "var(--tt-text-faint)" }}>@{profileUser.username}</p>

            {profileUser.location && (
              <p className="text-xs flex items-center gap-1.5 mb-2" style={{ color: "var(--tt-text-dim)" }}>
                <span style={{ color: "var(--tt-accent-1)" }}><MapPinIcon /></span>
                {profileUser.location}
              </p>
            )}

            {profileUser.bio && (
              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--tt-text-dim)" }}>
                {profileUser.bio}
              </p>
            )}

            {profileUser.travelStyles?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profileUser.travelStyles.map(tag => (
                  <span key={tag} className="tt-chip">{tag}</span>
                ))}
              </div>
            )}

            {profileUser.dreamDestinations?.length > 0 && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--tt-text-faint)" }}>
                <GlobeIcon />
                Dreams of{" "}
                <span style={{ color: "var(--tt-text-dim)" }}>
                  {profileUser.dreamDestinations.slice(0, 3).join(", ")}
                </span>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 mb-5 tt-anim tt-d1">
            <button
              onClick={handleOpenChat}
              className={`tt-btn tt-btn-secondary flex-1 ${showChat ? "tt-active" : ""}`}
            >
              <MessageIcon /> Message
            </button>
          </div>

          {/* Match badge */}
          <div
            className="flex items-center justify-between tt-anim tt-d2"
            style={{
              padding: "12px 16px",
              borderRadius: "var(--tt-radius-md)",
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.14)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full animate-pulse" style={{ width: 7, height: 7, background: "var(--tt-accent-1)" }} />
              <p className="text-xs" style={{ color: "var(--tt-text-dim)" }}>Travel compatibility</p>
            </div>
            <p className="text-sm font-bold tt-gradient-text">
              {Math.floor(Math.random() * 20) + 75}% match
            </p>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="tt-divider" style={{ marginBottom: 4, marginTop: 8 }}>
          <span className="line" />
          <span className="label tt-font-display" style={{ fontStyle: "italic", letterSpacing: "0.08em" }}>Travel Log</span>
          <span className="line" />
        </div>

        {/* ── POSTS SECTION ── */}
        <PostsSection
          posts={posts}
          profileUser={profileUser}
          likedPosts={likedPosts}
          toggleLike={toggleLike}
        />
      </div>

      {/* ── CHAT PANEL (right side) ── */}
      {showChat && (
        <ChatWindow
          profileUser={profileUser}
          conversationId={conversationId}
          currentUserId={currentUserId}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}