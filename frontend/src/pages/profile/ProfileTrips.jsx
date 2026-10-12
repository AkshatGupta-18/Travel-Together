import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ImageLightbox from "../../components/ImageLightbox";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const MapPinIcon = () => (
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 4v-2a4 4 0 00-3-3.87" />
  </svg>
);

const BedIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-7a2 2 0 012-2h14a2 2 0 012 2v7M3 18h18M3 18v2m18-2v2M6 9V6a2 2 0 012-2h1a2 2 0 012 2v3" />
  </svg>
);

const RouteIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 16l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7" />
  </svg>
);

const ChevronDownIcon = ({ open }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9.5 7V5a1.5 1.5 0 011.5-1.5h2a1.5 1.5 0 011.5 1.5v2m-8 0h11l-.7 12.4a2 2 0 01-2 1.85H9.2a2 2 0 01-2-1.85L6.5 7z" />
  </svg>
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDateRange = (start, end) => {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}, ${e.getFullYear()}`;
};

const tripDuration = (start, end) => {
  if (!start || !end) return null;
  const days = Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : null;
};

const formatBudget = (n) => {
  if (n == null) return "";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function TripSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 bg-white/[0.04]" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-2/3 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-1/3 rounded-full bg-white/[0.04]" />
        <div className="h-3 w-full rounded-full bg-white/[0.04]" />
        <div className="flex gap-2 mt-1">
          <div className="h-6 w-20 rounded-full bg-white/[0.04]" />
          <div className="h-6 w-20 rounded-full bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

// ─── META ITEM ────────────────────────────────────────────────────────────────
function MetaItem({ icon, value, label, muted }) {
  return (
    <div className="flex items-center gap-2.5 text-white/50 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-xs truncate ${muted ? "text-white/30" : "text-white/75"}`}>{value}</p>
        <p className="text-[10px] text-white/30">{label}</p>
      </div>
    </div>
  );
}

// ─── ITINERARY DAY ────────────────────────────────────────────────────────────
function ItineraryDay({ day, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-black"
          style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
        >
          {day.day}
        </div>
        {!isLast && <div className="w-px flex-1 bg-white/[0.08] my-1" />}
      </div>

      <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-5"}`}>
        <p className="text-sm font-semibold text-white/85 leading-7">{day.title}</p>

        {day.activities?.length > 0 && (
          <ul className="flex flex-col gap-1 mt-0.5">
            {day.activities.map((act, i) => (
              <li key={i} className="text-xs text-white/45 flex items-start gap-2 leading-relaxed">
                <span className="text-amber-400/60 shrink-0">•</span>
                <span className="whitespace-pre-line">{act}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── TRIP CARD ────────────────────────────────────────────────────────────────
function TripCard({ trip, onDeleted }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showImage, setShowImage] = useState(false);

  const duration = tripDuration(trip.startDate, trip.endDate);
  const sortedItinerary = trip.itinerary ? [...trip.itinerary].sort((a, b) => a.day - b.day) : [];

  // DELETE /api/trips/:tripId — auth via httpOnly JWT cookie
  const handleDeleteClick = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setDeleteError(null);
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await axios.delete(`http://localhost:5000/api/trips/${trip._id}`, { withCredentials: true });
      onDeleted?.(trip._id);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete trip");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="card trip-card overflow-hidden">
      {/* Cover image or gradient fallback */}
      <div
        className={`relative h-48 overflow-hidden ${trip.coverImage ? "cursor-zoom-in" : ""}`}
        onClick={() => trip.coverImage && setShowImage(true)}
      >
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center gap-2"
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
          <h3 className="font-display text-xl font-bold text-white leading-tight truncate">{trip.title}</h3>
          <p className="flex items-center gap-1 text-xs text-amber-300/80 mt-1">
            <MapPinIcon />
            {trip.destination}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {trip.description && (
          <p className="text-sm text-white/50 leading-relaxed mb-5 trip-line-clamp-2">{trip.description}</p>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
          <MetaItem
            icon={<CalendarIcon />}
            value={formatDateRange(trip.startDate, trip.endDate)}
            label={duration ? `${duration} day${duration > 1 ? "s" : ""}` : "dates"}
          />
          <MetaItem icon={<WalletIcon />} value={formatBudget(trip.budget)} label="per person" />
          <MetaItem icon={<UsersIcon />} value={`Up to ${trip.maxTravelers}`} label="travelers" />
          <MetaItem
            icon={<BedIcon />}
            value={trip.accommodation || "Not specified"}
            label="stay"
            muted={!trip.accommodation}
          />
        </div>

        {trip.transportation && (
          <div className="flex flex-wrap gap-1.5">
            <span
              className="text-[11px] px-2.5 py-1 rounded-full text-amber-400/70"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              🚐 {trip.transportation}
            </span>
          </div>
        )}

        {/* Itinerary toggle */}
        {sortedItinerary.length > 0 && (
          <div className="border-t border-white/[0.06] mt-5 pt-4">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full flex items-center justify-between text-xs font-medium text-white/60 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <RouteIcon />
                {expanded
                  ? "Hide itinerary"
                  : `View itinerary (${sortedItinerary.length} day${sortedItinerary.length > 1 ? "s" : ""})`}
              </span>
              <ChevronDownIcon open={expanded} />
            </button>

            {expanded && (
              <div
                className="mt-4 rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {sortedItinerary.map((day, idx) => (
                  <ItineraryDay key={idx} day={day} isLast={idx === sortedItinerary.length - 1} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete action */}
        <div className="border-t border-white/[0.06] mt-5 pt-3 flex items-center justify-between gap-3">
          {deleteError && <span className="text-[11px] text-red-400/80">{deleteError}</span>}

          <div className="flex items-center gap-2.5 ml-auto">
            {!confirmingDelete ? (
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-1.5 text-xs font-medium text-white/35 hover:text-red-400 transition-colors"
              >
                <TrashIcon /> Delete trip
              </button>
            ) : (
              <>
                <span className="text-xs text-white/50">Delete this trip?</span>
                <button
                  onClick={handleDeleteClick}
                  disabled={deleting}
                  className="text-xs font-semibold text-white bg-red-600/90 hover:bg-red-600 transition-colors px-3 py-1.5 rounded-full disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="text-xs font-medium text-white/50 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-colors px-3 py-1.5 rounded-full disabled:opacity-60"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showImage && (
        <ImageLightbox src={trip.coverImage} alt={trip.title} onClose={() => setShowImage(false)} />
      )}
    </div>
  );
}

// ─── PROFILE TRIPS TAB ────────────────────────────────────────────────────────
export default function ProfileTrips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTrips = useCallback(() => {
    setLoading(true);
    setError(null);
    axios
      .get("http://localhost:5000/api/trips/my-trips", { withCredentials: true })
      .then((res) => setTrips(res.data.trips ?? []))
      .catch((err) => {
        console.error("Failed to load trips", err);
        setError("Couldn't load your trips. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleTripDeleted = (tripId) => {
    setTrips((prev) => prev.filter((t) => t._id !== tripId));
  };

  return (
    <div>
      {/* Scoped styles for things the profile page doesn't define */}
      <style>{`
        .trip-card:hover { border-color: rgba(255,255,255,0.14); }
        .trip-line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <TripSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="flex flex-col items-center justify-center py-16 text-center rounded-2xl"
          style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}
        >
          <p className="text-sm text-red-400/70 mb-3">{error}</p>
          <button
            onClick={loadTrips}
            className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <span className="text-4xl">🗺️</span>
          <p className="text-sm text-white/30">You haven't planned any trips yet.</p>
          <button
            onClick={() => navigate("/plan")}
            className="mt-2 text-xs font-semibold text-black bg-white hover:bg-amber-400 transition-colors px-4 py-2 rounded-full"
          >
            Plan your first trip
          </button>
        </div>
      )}

      {/* Trip list */}
      {!loading && !error && trips.length > 0 && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate("/plan")}
              className="flex items-center gap-1.5 text-xs font-semibold text-black bg-white hover:bg-amber-400 transition-colors px-4 py-2.5 rounded-full"
            >
              <PlusIcon /> New Trip
            </button>
          </div>
          <div className="flex flex-col gap-5">
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} onDeleted={handleTripDeleted} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}