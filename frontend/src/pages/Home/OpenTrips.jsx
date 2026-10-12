import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ChatWindow from "../profile/ChatWindow";

const PAGE_SIZE = 10;
const TRAVEL_STYLES = [
  "All",
  "Adventure",
  "Relaxation",
  "Backpacking",
  "Road Trip",
  "Nature",
  "Culture",
  "Photography",
  "Mixed",
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const PinIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const WalletIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2 2 0 00-2-2H5a2 2 0 00-2 2m18 0v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6m18 0V8a2 2 0 00-2-2H5a2 2 0 00-2 2v4m18 0h-5a2 2 0 100 4h5" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const MessageIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg
    className="w-3.5 h-3.5 transition-transform"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatDate = (d, withYear = false) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(withYear && { year: "numeric" }),
      })
    : "";

const formatDateRange = (start, end) => {
  if (!start || !end) return "";
  return `${formatDate(start)} – ${formatDate(end, true)}`;
};

const tripDuration = (start, end) => {
  if (!start || !end) return null;
  const days = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
  return days > 0 ? days : null;
};

const formatBudget = (n) => (n == null ? "" : `₹${Number(n).toLocaleString("en-IN")}`);

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function TripSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-44 bg-white/[0.04]" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-1/2 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-full rounded-full bg-white/[0.04]" />
        <div className="h-3 w-2/3 rounded-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

// ─── OPEN TRIP CARD ───────────────────────────────────────────────────────────
function OpenTripCard({ trip, currentUserId, chatOpening, onChat }) {
  const navigate = useNavigate();
  const [showItinerary, setShowItinerary] = useState(true);

  const creator = trip.creator;
  const duration = tripDuration(trip.startDate, trip.endDate);
  const isOwnTrip = creator && currentUserId && creator._id === currentUserId;

  const itinerary = [...(trip.itinerary ?? [])].sort((a, b) => a.day - b.day);

  return (
    <div className="card open-trip-card overflow-hidden">
      {/* Cover */}
      <div className="relative h-44 overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(249,115,22,0.14), rgba(239,68,68,0.12))" }}
          >
            <span className="text-4xl opacity-30">🗺️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {trip.travelStyle && (
          <div
            className="absolute top-3 right-3 text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.75)" }}
          >
            {trip.travelStyle}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-xl font-bold text-white leading-tight">{trip.title}</h3>
          <p className="flex items-center gap-1 text-xs text-amber-300/80 mt-1">
            <PinIcon /> {trip.destination}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4">
        {/* Organizer + posted date */}
        <div className="flex items-center justify-between gap-3">
          {creator ? (
            <button
              onClick={() => navigate(`/user/${creator._id}`)}
              className="flex items-center gap-2 group min-w-0"
            >
              <img
                src={creator.avatar || `https://i.pravatar.cc/40?u=${creator._id}`}
                alt={creator.name}
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
              <span className="text-xs text-white/45 group-hover:text-white transition-colors truncate">
                {creator.name} <span className="text-white/25">@{creator.username}</span>
              </span>
            </button>
          ) : (
            <span />
          )}
          {trip.createdAt && (
            <span className="text-[11px] text-white/25 shrink-0">Posted {formatDate(trip.createdAt, true)}</span>
          )}
        </div>

        {/* Full description */}
        {trip.description && (
          <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">{trip.description}</p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2">
          <span className="meta-chip">
            <CalendarIcon />
            {formatDateRange(trip.startDate, trip.endDate)}
            {duration && <span className="text-white/30">· {duration}d</span>}
          </span>
          <span className="meta-chip">
            <WalletIcon />
            {formatBudget(trip.budget)} <span className="text-white/30">/ person</span>
          </span>
          {trip.maxTravelers != null && (
            <span className="meta-chip">
              <UsersIcon />
              Up to {trip.maxTravelers} travellers
            </span>
          )}
          {trip.accommodation && <span className="meta-chip">🏨 {trip.accommodation}</span>}
          {trip.transportation && <span className="meta-chip">🚐 {trip.transportation}</span>}
        </div>

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <button
              onClick={() => setShowItinerary((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-[0.15em] text-white/40 hover:text-white/70 transition-colors"
            >
              <span>Itinerary · {itinerary.length} day{itinerary.length !== 1 ? "s" : ""}</span>
              <ChevronIcon open={showItinerary} />
            </button>

            {showItinerary && (
              <div className="px-4 pb-4 flex flex-col gap-4">
                {itinerary.map((d, i) => (
                  <div key={d._id ?? `${d.day}-${i}`} className="flex gap-3">
                    <div className="itinerary-day">{d.day}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/80 leading-snug">{d.title}</p>
                      {d.activities?.length > 0 && (
                        <ul className="mt-1.5 flex flex-col gap-1">
                          {d.activities.map((a, j) => (
                            <li key={j} className="text-xs text-white/45 leading-relaxed flex gap-2">
                              <span className="text-amber-400/60">•</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-white/[0.06]">
          {isOwnTrip ? (
            <span className="text-xs text-white/30">This is your trip</span>
          ) : (
            <button
              onClick={() => onChat(trip)}
              disabled={chatOpening || !creator}
              className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 disabled:opacity-50"
            >
              <MessageIcon />
              {chatOpening ? "Opening…" : "Chat"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── OPEN TRIPS TAB ───────────────────────────────────────────────────────────
export default function OpenTrips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [style, setStyle] = useState("All");

  // Chat state (mirrors UserProfilePage)
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chatUser, setChatUser] = useState(null); // the trip creator we're chatting with
  const [conversationId, setConversationId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [openingChatFor, setOpeningChatFor] = useState(null); // trip._id while the request is in flight
  const [chatError, setChatError] = useState(null);

  // Guards against a slow earlier response overwriting a newer filter's results
  const requestId = useRef(0);

  // Logged-in user's id (needed by ChatWindow, and to hide Chat on your own trips)
  useEffect(() => {
    api
      .get("/users/me", { withCredentials: true })
      .then((res) => setCurrentUserId(res.data._id))
      .catch((err) => console.error("Failed to load current user", err));
  }, []);

  const fetchTrips = useCallback(
    async (pageNum, append) => {
      const myRequest = ++requestId.current;
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      try {
        const res = await api.get("/trips/open", {
          withCredentials: true,
          params: {
            page: pageNum,
            limit: PAGE_SIZE,
            ...(style !== "All" && { travelStyle: style }),
          },
        });
        if (myRequest !== requestId.current) return;

        const incoming = res.data.trips ?? [];
        setTrips((prev) => (append ? [...prev, ...incoming] : incoming));
        setPage(pageNum);
        setHasMore(Boolean(res.data.hasMore));
      } catch (err) {
        if (myRequest !== requestId.current) return;
        console.error("Failed to load open trips", err);
        setError("Couldn't load trips. Please try again.");
      } finally {
        if (myRequest === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [style]
  );

  useEffect(() => {
    fetchTrips(1, false);
  }, [fetchTrips]);

  // Find or create a conversation with the trip's organizer, then open the chat drawer
  const handleOpenChat = async (trip) => {
    if (!trip.creator?._id) return;
    setChatError(null);
    setOpeningChatFor(trip._id);
    try {
      const res = await api.post(
        "/conversations/find-or-create",
        { userId: trip.creator._id },
        { withCredentials: true }
      );
      setChatUser(trip.creator);
      setConversationId(res.data._id);
      setShowChat(true);
    } catch (err) {
      console.error("Failed to open conversation", err);
      setChatError("Couldn't open the chat. Please try again.");
    } finally {
      setOpeningChatFor(null);
    }
  };

  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    setConversationId(null);
    setChatUser(null);
  }, []);

  // Esc closes the chat drawer
  useEffect(() => {
    if (!showChat) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleCloseChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showChat, handleCloseChat]);

  return (
    <div className="flex flex-col gap-4">
      <style>{`
        .open-trip-card:hover { border-color: rgba(255,255,255,0.14); }
        .meta-chip {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.6875rem; color: rgba(255,255,255,0.65);
          padding: 0.3rem 0.65rem; border-radius: 9999px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .itinerary-day {
          flex-shrink: 0; height: fit-content;
          font-size: 0.6875rem; font-weight: 600;
          color: #fbbf24; background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.25);
          padding: 0.2rem 0.55rem; border-radius: 9999px;
        }
        .style-chip {
          font-size: 0.75rem; padding: 0.35rem 0.8rem; border-radius: 9999px;
          color: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.08);
          background: transparent; transition: all 0.2s; white-space: nowrap;
        }
        .style-chip:hover { color: white; }
        .style-chip.active {
          color: #fbbf24; background: rgba(245,158,11,0.12);
          border-color: rgba(245,158,11,0.3);
        }

        @keyframes tt-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        .tt-chat-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(3px);
          display: flex; justify-content: flex-end;
          animation: tt-overlay-in 0.2s ease both;
        }
        .tt-chat-drawer {
          width: min(400px, 100vw);
          height: 100%;
          border-left: 1px solid rgba(255,255,255,0.09);
          box-shadow: -16px 0 48px rgba(0,0,0,0.6);
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">
          Trips looking for members
        </p>
        <button
          onClick={() => navigate("/plan")}
          className="flex items-center gap-1.5 text-xs font-semibold text-black bg-white hover:bg-amber-400 transition-colors px-3.5 py-2 rounded-full"
        >
          <PlusIcon /> New Trip
        </button>
      </div>

      {/* Travel style filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TRAVEL_STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`style-chip ${style === s ? "active" : ""}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat error */}
      {chatError && (
        <p className="text-xs text-red-400/80 bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2">
          {chatError}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <TripSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="flex flex-col items-center justify-center py-14 text-center rounded-2xl"
          style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}
        >
          <p className="text-sm text-red-400/70 mb-3">{error}</p>
          <button
            onClick={() => fetchTrips(1, false)}
            className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <span className="text-4xl">🧭</span>
          <p className="text-sm text-white/30">
            {style === "All"
              ? "No open trips from other travellers yet."
              : `No open ${style} trips right now.`}
          </p>
          <button
            onClick={() => navigate("/plan")}
            className="mt-1 text-xs font-semibold text-black bg-white hover:bg-amber-400 transition-colors px-4 py-2 rounded-full"
          >
            Plan a trip and invite others
          </button>
        </div>
      )}

      {/* List */}
      {!loading && !error && trips.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            {trips.map((trip) => (
              <OpenTripCard
                key={trip._id}
                trip={trip}
                currentUserId={currentUserId}
                chatOpening={openingChatFor === trip._id}
                onChat={handleOpenChat}
              />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => fetchTrips(page + 1, true)}
              disabled={loadingMore}
              className="btn-ghost self-center disabled:opacity-60"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}

      {/* Chat drawer (portal → never clipped by parent overflow/transform) */}
      {showChat &&
        chatUser &&
        createPortal(
          <div className="tt-chat-overlay" onClick={handleCloseChat}>
            <div className="tt-chat-drawer" onClick={(e) => e.stopPropagation()}>
              <ChatWindow
                embedded
                profileUser={chatUser}
                conversationId={conversationId}
                currentUserId={currentUserId}
                onClose={handleCloseChat}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}