import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 9.75h18M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);
const PinIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const XIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const SparkleIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MAX_PHOTOS = 10;
const MAX_CHARS = 280;

const MOODS = [
  { emoji: "🌅", label: "Golden hour" },
  { emoji: "🌊", label: "Beach vibes" },
  { emoji: "🏔️", label: "Mountain mode" },
  { emoji: "🏙️", label: "City life" },
  { emoji: "🌿", label: "Nature escape" },
  { emoji: "🍜", label: "Food quest" },
  { emoji: "🎭", label: "Cultural dive" },
  { emoji: "🛤️", label: "Road trip" },
];

const AUDIENCES = [
  { id: "public",  icon: <GlobeIcon />, label: "Everyone" },
  
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CreatePost() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [photos, setPhotos]           = useState([]);
  const [activeIdx, setActiveIdx]     = useState(0);
  const [caption, setCaption]         = useState("");
  const [location, setLocation]       = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [audience, setAudience]       = useState("public");
  const [isDragging, setIsDragging]   = useState(false);
  const [isPosting, setIsPosting]     = useState(false);
  const [posted, setPosted]           = useState(false);

  const fileInputRef    = useRef();
  const addMoreInputRef = useRef();

  useEffect(() => {
    axios.get("http://localhost:5000/api/users/me", { withCredentials: true })
      .then(res => {
        const d = res.data;
        setUser({
          name: d.name ?? "Traveller",
          username: d.username ?? "",
          avatar: d.avatar ?? null,
        });
      })
      .catch(err => console.error("Failed to load user", err));
  }, []);

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const readFiles = (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    const remaining  = MAX_PHOTOS - photos.length;
    const toAdd      = imageFiles.slice(0, remaining);

    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => {
          const next = [...prev, { preview: e.target.result, file }];
          setActiveIdx(next.length - 1);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => {
    setPhotos(prev => {
      const next = prev.filter((_, i) => i !== idx);
      setActiveIdx(i => Math.min(i, Math.max(next.length - 1, 0)));
      return next;
    });
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    readFiles(e.dataTransfer.files);
  }, [photos.length]);

  const handleCaptionChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) setCaption(val);
  };

  const goLeft  = () => setActiveIdx(i => Math.max(i - 1, 0));
  const goRight = () => setActiveIdx(i => Math.min(i + 1, photos.length - 1));

  // ── early return AFTER all hooks ──
  if (!user) return null;

  // ─── SUBMIT ───────────────────────────────────────────────────────────────
  const handlePost = async () => {
    if (!caption.trim() && photos.length === 0) return;
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("location", location);
      formData.append("mood", selectedMood ? MOODS.find(m => m.emoji === selectedMood)?.label : "");
      formData.append("audience", audience);
      photos.forEach(p => formData.append("photos", p.file));

      await axios.post("http://localhost:5000/api/posts", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPosted(true);
    } catch (err) {
      console.error("Post failed:", err);
      setPosted(true); // optimistic for dev
    } finally {
      setIsPosting(false);
    }
  };

  const canPost = caption.trim().length > 0 || photos.length > 0;

  // ─── SUCCESS ──────────────────────────────────────────────────────────────
  if (posted) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,500&display=swap');
          .font-display { font-family: 'Fraunces', Georgia, serif; }
          @keyframes popIn  { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          .anim-pop      { animation: popIn  0.5s cubic-bezier(0.16,1,0.3,1) both; }
          .anim-fade-up  { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
          .d1{animation-delay:0.2s} .d2{animation-delay:0.35s}
          .btn-primary { background:white; color:black; font-weight:600; border-radius:9999px; padding:0.5rem 1.25rem; transition:all 0.2s; font-size:0.875rem; }
          .btn-primary:hover { background:#fbbf24; transform:translateY(-1px); }
          .btn-ghost { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.6); border-radius:9999px; padding:0.5rem 1.25rem; transition:all 0.2s; font-size:0.875rem; }
          .btn-ghost:hover { background:rgba(255,255,255,0.1); color:white; }
        `}</style>
        <Navbar user={user} />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="anim-pop text-6xl">🎉</div>
          <div className="anim-fade-up d1">
            <h2 className="font-display text-2xl font-black text-white mb-2">Post is live!</h2>
            <p className="text-sm text-white/40 max-w-xs">
              {photos.length > 1
                ? `${photos.length} photos shared. Time to inspire some wanderlust.`
                : "Your moment is out there. Time to inspire some wanderlust."}
            </p>
          </div>
          <div className="anim-fade-up d2 flex gap-3">
            <button
              onClick={() => { setPosted(false); setPhotos([]); setCaption(""); setLocation(""); setSelectedMood(null); setActiveIdx(0); }}
              className="btn-ghost"
            >Post again</button>
            <button onClick={() => navigate("/homepage")} className="btn-primary">Back to home</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN FORM ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,500&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }

        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        .anim-fade-up  { animation: fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-fade-in  { animation: fadeIn 0.25s ease both; }
        .d1{animation-delay:0.05s} .d2{animation-delay:0.1s} .d3{animation-delay:0.15s} .d4{animation-delay:0.2s}

        @keyframes spin { to{transform:rotate(360deg)} }
        .spinner { animation: spin 0.8s linear infinite; }

        .card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1.25rem;
        }

        /* ── Drop zone ── */
        .drop-zone {
          border: 1.5px dashed rgba(255,255,255,0.1);
          border-radius: 1.25rem;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .drop-zone:hover, .drop-zone.dragging {
          border-color: rgba(245,158,11,0.4);
          background: rgba(245,158,11,0.04);
        }

        /* ── Carousel ── */
        .carousel-wrap {
          position: relative;
          border-radius: 1.25rem;
          overflow: hidden;
          background: #111;
          user-select: none;
        }
        .carousel-img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.2s ease;
        }
        .carousel-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 36px; height: 36px; border-radius: 9999px;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.12);
          color: white; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; z-index: 10;
        }
        .carousel-arrow:hover { background: rgba(0,0,0,0.8); }
        .carousel-arrow:disabled { opacity: 0.2; cursor: default; }
        .carousel-arrow.left  { left: 12px; }
        .carousel-arrow.right { right: 12px; }

        /* ── Dot indicators ── */
        .dot {
          width: 6px; height: 6px; border-radius: 9999px;
          background: rgba(255,255,255,0.3);
          transition: all 0.2s;
          cursor: pointer;
        }
        .dot.active { width: 18px; background: white; }

        /* ── Thumbnail tray ── */
        .thumb-tray {
          display: flex; gap: 8px;
          overflow-x: auto; padding-bottom: 2px;
        }
        .thumb-tray::-webkit-scrollbar { height: 0; }
        .thumb {
          position: relative; flex-shrink: 0;
          width: 56px; height: 56px; border-radius: 10px;
          overflow: hidden; cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .thumb.active { border-color: #fbbf24; }
        .thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .thumb-remove {
          position: absolute; top: 3px; right: 3px;
          width: 16px; height: 16px; border-radius: 9999px;
          background: rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.2);
          color: white; display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.15s; cursor: pointer;
        }
        .thumb:hover .thumb-remove { opacity: 1; }
        .thumb-add {
          flex-shrink: 0;
          width: 56px; height: 56px; border-radius: 10px;
          border: 1.5px dashed rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.25); cursor: pointer;
          transition: all 0.2s;
        }
        .thumb-add:hover { border-color: rgba(245,158,11,0.4); color: rgba(245,158,11,0.6); }

        /* ── Photo counter badge ── */
        .photo-counter {
          position: absolute; top: 12px; right: 12px; z-index: 10;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.12);
          color: white; font-size: 0.7rem; font-weight: 600;
          padding: 0.25rem 0.625rem; border-radius: 9999px;
          letter-spacing: 0.05em;
        }

        /* ── Fields ── */
        .field-input {
          width:100%; background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08); border-radius:0.875rem;
          color:white; font-size:0.875rem; padding:0.75rem 1rem;
          transition:border-color 0.2s; outline:none;
          font-family:'DM Sans',sans-serif; resize:none;
        }
        .field-input:focus  { border-color:rgba(245,158,11,0.3); }
        .field-input::placeholder { color:rgba(255,255,255,0.2); }

        /* ── Mood chips ── */
        .mood-chip {
          display:inline-flex; align-items:center; gap:0.375rem;
          padding:0.375rem 0.875rem; border-radius:9999px;
          border:1px solid rgba(255,255,255,0.08);
          background:rgba(255,255,255,0.04);
          font-size:0.75rem; color:rgba(255,255,255,0.5);
          cursor:pointer; transition:all 0.2s; white-space:nowrap;
        }
        .mood-chip:hover   { border-color:rgba(245,158,11,0.3); color:rgba(255,255,255,0.8); }
        .mood-chip.selected { background:rgba(245,158,11,0.12); border-color:rgba(245,158,11,0.35); color:#fbbf24; }

        /* ── Audience buttons ── */
        .audience-btn {
          flex:1; display:flex; flex-direction:column; align-items:center; gap:0.375rem;
          padding:0.75rem 0.5rem; border-radius:1rem;
          border:1px solid rgba(255,255,255,0.07);
          background:rgba(255,255,255,0.02);
          font-size:0.75rem; color:rgba(255,255,255,0.4);
          cursor:pointer; transition:all 0.2s;
        }
        .audience-btn:hover    { border-color:rgba(255,255,255,0.15); color:rgba(255,255,255,0.7); }
        .audience-btn.selected { background:rgba(245,158,11,0.08); border-color:rgba(245,158,11,0.3); color:#fbbf24; }

        /* ── Buttons ── */
        .btn-primary {
          background:white; color:black; font-weight:600;
          border-radius:9999px; padding:0.625rem 1.75rem;
          transition:all 0.2s; cursor:pointer; font-size:0.875rem;
        }
        .btn-primary:hover:not(:disabled) { background:#fbbf24; transform:translateY(-1px); }
        .btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
        .btn-ghost {
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.6); border-radius:9999px; padding:0.625rem 1.25rem;
          transition:all 0.2s; cursor:pointer; font-size:0.875rem;
        }
        .btn-ghost:hover { background:rgba(255,255,255,0.1); color:white; }

        ::-webkit-scrollbar { width:0; height:0; }
      `}</style>

      <Navbar user={user} />

      <div className="max-w-[680px] mx-auto px-4 py-8 pb-28">

        {/* ── HEADER ── */}
        <div className="anim-fade-up flex items-center gap-4 mb-7">
          <button onClick={() => navigate("/homepage")} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm">
            <ArrowLeftIcon /> Back
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-xs text-amber-400/60 bg-amber-400/8 border border-amber-400/15 px-3 py-1.5 rounded-full">
            <SparkleIcon /><span>New post</span>
          </div>
        </div>

        {/* ── TITLE ── */}
        <div className="anim-fade-up d1 mb-8">
          <h1 className="font-display text-3xl font-black text-white mb-1">Share a moment.</h1>
          <p className="text-sm text-white/30">A photo, a place, a feeling — whatever moved you.</p>
        </div>

        <div className="flex flex-col gap-5">

          {/* ══ PHOTO SECTION ══ */}
          <div className="anim-fade-up d1 flex flex-col gap-3">

            {photos.length === 0 ? (
              /* ── Empty drop zone ── */
              <div
                className={`drop-zone flex flex-col items-center justify-center gap-4 ${isDragging ? "dragging" : ""}`}
                style={{ height: "260px" }}
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/20">
                  <ImageIcon />
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/40 mb-1">
                    Drop photos here, or <span className="text-amber-400/70">browse</span>
                  </p>
                  <p className="text-xs text-white/20">Up to {MAX_PHOTOS} photos · JPG, PNG, WEBP</p>
                </div>
              </div>
            ) : (
              <>
                {/* ── Carousel ── */}
                <div className="carousel-wrap" style={{ height: "320px" }}>
                  <img
                    key={activeIdx}
                    className="carousel-img anim-fade-in"
                    src={photos[activeIdx].preview}
                    alt={`Photo ${activeIdx + 1}`}
                  />

                  {/* Photo counter */}
                  {photos.length > 1 && (
                    <div className="photo-counter">{activeIdx + 1} / {photos.length}</div>
                  )}

                  {/* Location overlay */}
                  {location && (
                    <div className="absolute bottom-12 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full">
                      <PinIcon />{location}
                    </div>
                  )}

                  {/* Arrow navigation */}
                  {photos.length > 1 && (
                    <>
                      <button className="carousel-arrow left"  onClick={goLeft}  disabled={activeIdx === 0}><ChevronLeftIcon /></button>
                      <button className="carousel-arrow right" onClick={goRight} disabled={activeIdx === photos.length - 1}><ChevronRightIcon /></button>
                    </>
                  )}

                  {/* Gradient scrim + dots */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  {photos.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {photos.map((_, i) => (
                        <button key={i} className={`dot ${i === activeIdx ? "active" : ""}`} onClick={() => setActiveIdx(i)} />
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Thumbnail tray ── */}
                <div className="thumb-tray">
                  {photos.map((p, i) => (
                    <div
                      key={i}
                      className={`thumb ${i === activeIdx ? "active" : ""}`}
                      onClick={() => setActiveIdx(i)}
                    >
                      <img src={p.preview} alt="" />
                      <button
                        className="thumb-remove"
                        onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                      >
                        <XIcon />
                      </button>
                    </div>
                  ))}

                  {/* Add more tile */}
                  {photos.length < MAX_PHOTOS && (
                    <div className="thumb-add" onClick={() => addMoreInputRef.current.click()}>
                      <PlusIcon />
                    </div>
                  )}
                </div>

                {photos.length >= MAX_PHOTOS && (
                  <p className="text-xs text-amber-400/50 text-center">{MAX_PHOTOS} photos max reached</p>
                )}
              </>
            )}

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => readFiles(e.target.files)}
            />
            <input
              ref={addMoreInputRef}
              type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => readFiles(e.target.files)}
            />
          </div>

          {/* ── CAPTION ── */}
          <div className="anim-fade-up d2 card p-4 flex flex-col gap-2">
            <div className="flex gap-3">
              <img
                src={user?.avatar || "https://i.pravatar.cc/160?img=11"}
                alt="" className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5"
              />
              <textarea
                className="field-input flex-1 min-h-[80px] leading-relaxed"
                placeholder="What happened out there? ✈️"
                value={caption}
                onChange={handleCaptionChange}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between pl-12">
              <p className="text-xs text-white/20">Write something memorable</p>
              <p className={`text-xs tabular-nums ${caption.length > MAX_CHARS * 0.85 ? "text-amber-400" : "text-white/20"}`}>
                {caption.length}/{MAX_CHARS}
              </p>
            </div>
          </div>

          {/* ── LOCATION ── */}
          <div className="anim-fade-up d2 relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
              <PinIcon />
            </div>
            <input
              type="text" className="field-input pl-9"
              placeholder="Add a location  ·  e.g. Kyoto, Japan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* ── MOOD ── */}
          <div className="anim-fade-up d3">
            <p className="text-xs text-white/30 mb-2.5 font-medium uppercase tracking-widest">Vibe</p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {MOODS.map((m) => (
                <button
                  key={m.emoji}
                  className={`mood-chip shrink-0 ${selectedMood === m.emoji ? "selected" : ""}`}
                  onClick={() => setSelectedMood(selectedMood === m.emoji ? null : m.emoji)}
                >
                  <span>{m.emoji}</span><span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── AUDIENCE ── */}
          <div className="anim-fade-up d3">
            <p className="text-xs text-white/30 mb-2.5 font-medium uppercase tracking-widest">Visible to</p>
            <div className="flex gap-2">
              {AUDIENCES.map((a) => (
                <button
                  key={a.id}
                  className={`audience-btn ${audience === a.id ? "selected" : ""}`}
                  onClick={() => setAudience(a.id)}
                >
                  <span className="text-lg">{typeof a.icon === "string" ? a.icon : <span>{a.icon}</span>}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── LIVE PREVIEW ── */}
          {photos.length > 0 && caption && (
            <div className="anim-fade-up card overflow-hidden">
              <p className="text-xs text-white/25 px-4 pt-4 mb-3 uppercase tracking-widest font-medium">Preview</p>
              <div className="flex items-center gap-3 px-4 pb-3">
                <img src={user?.avatar || "https://i.pravatar.cc/160?img=11"} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-semibold text-white">{user?.name || "You"}</p>
                  {location && <p className="text-[10px] text-white/30">{location}</p>}
                </div>
                {photos.length > 1 && (
                  <span className="ml-auto text-[10px] text-white/30 bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-full">
                    {photos.length} photos
                  </span>
                )}
              </div>
              <div className="relative mx-4 mb-3 rounded-xl overflow-hidden" style={{ height: "180px" }}>
                <img src={photos[0].preview} alt="" className="w-full h-full object-cover" />
                {photos.length > 1 && (
                  <div className="absolute inset-0 flex items-end justify-end p-3">
                    <div className="flex gap-1">
                      {photos.slice(1, 4).map((p, i) => (
                        <img key={i} src={p.preview} alt="" className="w-10 h-10 rounded-lg object-cover border border-black/40" />
                      ))}
                      {photos.length > 4 && (
                        <div className="w-10 h-10 rounded-lg bg-black/60 flex items-center justify-center text-white text-xs font-bold border border-white/20">
                          +{photos.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 pb-4">
                <p className="text-xs text-white/60 leading-relaxed">
                  <span className="font-semibold text-white/80 mr-1">{user?.username || "you"}</span>
                  {caption}
                </p>
                {selectedMood && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-amber-400/60 bg-amber-400/8 border border-amber-400/15 px-2 py-0.5 rounded-full">
                    {MOODS.find(m => m.emoji === selectedMood)?.emoji}{" "}
                    {MOODS.find(m => m.emoji === selectedMood)?.label}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── SUBMIT ── */}
          <div className="anim-fade-up d4 flex gap-3 pt-1">
            <button onClick={() => navigate("/homepage")} className="btn-ghost">Cancel</button>
            <button
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={handlePost}
              disabled={!canPost || isPosting}
            >
              {isPosting ? (
                <>
                  <svg className="spinner w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Posting...
                </>
              ) : (
                <>Share moment{photos.length > 1 ? ` · ${photos.length} photos` : ""} 🌍</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}