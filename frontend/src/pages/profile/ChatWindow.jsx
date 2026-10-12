import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const SendIconFixed = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
const MoreIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);

// how long to wait after the last keystroke before telling the server "stopped typing"
const TYPING_STOP_DELAY = 2000;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// conversationId: mongo _id of the Conversation doc
// currentUserId: logged-in user's id, needed to tell fromMe apart when messages come from the server
// embedded: when true, fills its parent (used inside a drawer) instead of being a sticky side column
export default function ChatWindow({ profileUser, conversationId, currentUserId, onClose, embedded = false }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const scrollRef = useRef(null);
  const socketRef = useRef(null);        // holds the socket instance
  const typingTimeoutRef = useRef(null); // debounce timer for stop_typing

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // load message history when the conversation opens
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${conversationId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
  }, [conversationId]);

  // open socket connection, join the conversation room, listen for messages + typing events
  useEffect(() => {
    if (!conversationId) return;

    const socket = io("http://localhost:5000", {
      withCredentials: true,
    });

    socketRef.current = socket;

    // Join this conversation's room
    socket.emit("join_conversation", conversationId);

    // Receive new real-time messages
    socket.on("new_message", (message) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some((msg) => msg._id === message._id)) {
          return prev;
        }

        return [...prev, message];
      });
    });

    // Typing indicator
    socket.on("user_typing", ({ userId }) => {
      if (userId !== currentUserId) {
        setIsOtherTyping(true);
      }
    });

    socket.on("user_stop_typing", ({ userId }) => {
      if (userId !== currentUserId) {
        setIsOtherTyping(false);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, currentUserId]);

  // fires on every keystroke; emits "typing", then auto-emits "stop_typing" after a pause
  const handleDraftChange = (e) => {
    setDraft(e.target.value);

    if (!socketRef.current || !conversationId) return;

    socketRef.current.emit("typing", { conversationId, userId: currentUserId });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { conversationId, userId: currentUserId });
    }, TYPING_STOP_DELAY);
  };

  const handleSend = () => {
    const text = draft.trim();

    if (!text || !conversationId || !socketRef.current) return;

    // Clear input immediately
    setDraft("");

    // Stop typing indicator
    clearTimeout(typingTimeoutRef.current);

    socketRef.current.emit("stop_typing", {
      conversationId,
      userId: currentUserId,
    });

    // Send message through Socket.IO
    socketRef.current.emit("send_message", {
      conversationId,
      senderId: currentUserId,
      text,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="tt-chat-panel tt-font-body"
      style={{
        width: embedded ? "100%" : 380,
        minWidth: embedded ? 0 : 380,
        height: embedded ? "100%" : "100vh",
        position: embedded ? "relative" : "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--tt-surface)",
        color: "var(--tt-text)",
        fontFamily: "'DM Sans', sans-serif",
        borderLeft: embedded ? "none" : "1px solid var(--tt-border)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        /* Self-contained tokens so the chat looks right on any page */
        .tt-chat-panel {
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
          --tt-radius-md: 14px;
          --tt-radius-sm: 10px;
        }
        .tt-chat-panel .tt-avatar-ring-sm {
          background: linear-gradient(135deg, var(--tt-accent-1), var(--tt-accent-2), var(--tt-accent-3));
          padding: 2px;
          border-radius: 9999px;
          display: inline-block;
        }

        @keyframes tt-chat-slide-in {
          from { transform: translateX(24px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        .tt-chat-panel { animation: tt-chat-slide-in 0.32s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes tt-bubble-in {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .tt-bubble { animation: tt-bubble-in 0.28s cubic-bezier(0.16,1,0.3,1) both; }

        .tt-chat-input::placeholder { color: var(--tt-text-faint); }
        .tt-chat-input:focus { outline: none; }

        /* typing dots */
        @keyframes tt-typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .tt-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: var(--tt-text-faint);
          display: inline-block;
          animation: tt-typing-bounce 1.1s infinite ease-in-out;
        }
        .tt-typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .tt-typing-dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {/* ── HEADER ── */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          height: 64,
          padding: "0 18px",
          borderBottom: "1px solid var(--tt-border-soft)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="tt-avatar-ring-sm">
            <img
              src={profileUser?.avatar || `https://i.pravatar.cc/80?u=${profileUser?._id}`}
              alt={profileUser?.name}
              style={{ width: 38, height: 38, borderRadius: "9999px", objectFit: "cover", display: "block" }}
            />
          </div>

          <div>
            <p className="text-sm font-semibold leading-tight">
              {profileUser?.name || "Traveler"}
            </p>

            {isOtherTyping ? (
              <p
                className="text-xs flex items-center gap-1.5"
                style={{ color: "var(--tt-accent-1)" }}
              >
                typing
                <span className="flex items-center gap-0.5">
                  <span className="tt-typing-dot" />
                  <span className="tt-typing-dot" />
                  <span className="tt-typing-dot" />
                </span>
              </p>
            ) : (
              <p
                className="text-xs"
                style={{ color: "var(--tt-text-faint)" }}
              >
                buddy
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="flex items-center justify-center transition-all"
            style={{ width: 32, height: 32, borderRadius: "var(--tt-radius-sm)", color: "var(--tt-text-dim)", background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <MoreIcon />
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-all"
            style={{ width: 32, height: 32, borderRadius: "var(--tt-radius-sm)", color: "var(--tt-text-dim)", background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--tt-text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--tt-text-dim)"; }}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}
      >
        {messages.length === 0 && (
          <p className="text-xs text-center mt-6" style={{ color: "var(--tt-text-faint)" }}>
            No messages yet. Say hi 👋
          </p>
        )}
        {messages.map(msg => {
          const fromMe = msg.sender === currentUserId;
          return (
            <div
              key={msg._id || msg.id}
              className="tt-bubble"
              style={{
                alignSelf: fromMe ? "flex-end" : "flex-start",
                maxWidth: "78%",
                display: "flex",
                flexDirection: "column",
                alignItems: fromMe ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  padding: "9px 13px",
                  borderRadius: fromMe
                    ? "var(--tt-radius-md) var(--tt-radius-md) 4px var(--tt-radius-md)"
                    : "var(--tt-radius-md) var(--tt-radius-md) var(--tt-radius-md) 4px",
                  background: fromMe
                    ? "linear-gradient(135deg, var(--tt-accent-1), var(--tt-accent-2))"
                    : "var(--tt-surface-2)",
                  border: fromMe ? "none" : "1px solid var(--tt-border)",
                  color: fromMe ? "#0a0a0a" : "var(--tt-text)",
                  fontSize: "0.87rem",
                  lineHeight: 1.45,
                }}
              >
                {msg.text}
              </div>
              <span className="text-xs mt-1" style={{ color: "var(--tt-text-faint)" }}>
                {msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── INPUT ── */}
      <div
        className="shrink-0 flex items-center gap-2"
        style={{ padding: "14px 16px", borderTop: "1px solid var(--tt-border-soft)" }}
      >
        <input
          value={draft}
          onChange={handleDraftChange}
          onKeyDown={handleKeyDown}
          placeholder="Send a message…"
          className="tt-chat-input"
          style={{
            flex: 1,
            background: "var(--tt-surface-2)",
            border: "1px solid var(--tt-border)",
            borderRadius: "var(--tt-radius-sm)",
            padding: "10px 14px",
            fontSize: "0.85rem",
            color: "var(--tt-text)",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          className="flex items-center justify-center shrink-0"
          style={{
            width: 38,
            height: 38,
            borderRadius: "var(--tt-radius-sm)",
            background: draft.trim() ? "linear-gradient(135deg, var(--tt-accent-1), var(--tt-accent-2))" : "rgba(255,255,255,0.05)",
            color: draft.trim() ? "#0a0a0a" : "var(--tt-text-faint)",
            border: "none",
            cursor: draft.trim() ? "pointer" : "default",
            transition: "filter 0.15s ease",
          }}
        >
          <SendIconFixed />
        </button>
      </div>
    </div>
  );
}