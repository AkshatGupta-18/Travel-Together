// EditProfilePage.jsx
// Open this in a new tab: window.open("/profile/edit", "_blank")
// Matches the dark glass-morphism aesthetic of ProfileSidebar.jsx

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";



const TRAVEL_STYLE_OPTIONS = [
  "Backpacker", "Luxury", "Solo", "Group", "Adventure",
  "Cultural", "Food & Drink", "Digital Nomad", "Family", "Budget",
];

const LANGUAGE_OPTIONS = [
  "English", "Hindi", "Spanish", "French", "German",
  "Japanese", "Mandarin", "Arabic", "Portuguese", "Italian",
];

/* ─── Tiny icon components ─── */
const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

/* ─── Reusable field components ─── */
function FieldLabel({ children, locked }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-2">
      {children}
      {locked && (
        <span className="flex items-center gap-1 text-white/20 normal-case tracking-normal font-normal text-[10px]">
          <LockIcon /> cannot be changed
        </span>
      )}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, disabled, maxLength }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none
        ${disabled
          ? "bg-white/[0.02] text-white/20 cursor-not-allowed border border-white/[0.04]"
          : "bg-white/[0.05] text-white border border-white/[0.08] hover:border-white/[0.14] focus:border-amber-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(251,191,36,0.07)]"
        } placeholder-white/20`}
    />
  );
}

function TextareaInput({ value, onChange, placeholder, maxLength }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={3}
      className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none resize-none
        bg-white/[0.05] text-white border border-white/[0.08]
        hover:border-white/[0.14] focus:border-amber-400/50 focus:bg-white/[0.07]
        focus:shadow-[0_0_0_3px_rgba(251,191,36,0.07)] placeholder-white/20"
    />
  );
}

/* ─── Multi-select pill component ─── */
function PillSelector({ options, selected, onChange, max = 5 }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else if (selected.length < max) {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active
              ? "bg-amber-400/15 text-amber-400 border border-amber-400/30"
              : "bg-white/[0.04] text-white/40 border border-white/[0.07] hover:border-white/20 hover:text-white/70"
              }`}
          >
            {active && <span className="mr-1">✓</span>}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Save toast ─── */
function Toast({ visible }) {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-3 rounded-2xl
      bg-[#1a1a1a] border border-amber-400/25 text-sm text-white shadow-2xl shadow-black/50
      transition-all duration-500 z-50 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <span className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-black">
        <CheckIcon />
      </span>
      Profile saved successfully
    </div>
  );
}

/* ─── Main Component ─── */
export default function EditProfilePage() {
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/users/me",
        {
          withCredentials: true, // ✅ THIS is the key fix
        }
      );

      const data = res.data;

      setUser({
        name: data.name ?? "",
        username: data.username ?? "",
        email: data.email ?? "",
        location: data.location ?? "",
        bio: data.bio ?? "",
        travelStyles: data.travelStyles ?? [],
        languages: data.languages ?? [],
        dreamPlaces: data.dreamPlaces ?? []
      });

      setAvatarPreview(
        data.avatar ?? "https://i.pravatar.cc/160?img=11"
      );

    } catch (err) {
      console.error(
        "Error fetching user:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);

  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const fileInputRef = useRef(null);

  if (loading || !user) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.3)",
        fontFamily: "DM Sans, sans-serif"
      }}>
        Loading profile…
      </div>
    );
  }

  const set = (key) => (e) => setUser((u) => ({ ...u, [key]: e.target.value }));

  /* Photo handling */
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  /* Save */

const handleSave = async () => {
  setSaving(true);
  try {
    const fd = new FormData();

    fd.append("name",         user.name);
    fd.append("username",     user.username);
    fd.append("location",     user.location);
    fd.append("bio",          user.bio);
    fd.append("travelStyles", JSON.stringify(user.travelStyles));
    fd.append("languages",    JSON.stringify(user.languages));
    fd.append("dreamPlaces", JSON.stringify(user.dreamPlaces));

    // Attach avatar only if the user picked a new file
    if (fileInputRef.current?.files[0]) {
      fd.append("avatar", fileInputRef.current.files[0]);
    }

    await axios.patch("http://localhost:5000/api/users/me", fd, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  } catch (err) {
    console.error("Save failed:", err.response?.data || err.message);
    // TODO: surface err.response.data.error in a UI error toast
  } finally {
    setSaving(false);
  }
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0a;
          color: white;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        .font-display { font-family: 'Syne', sans-serif; }

        /* Ambient glow */
        .ambient-glow {
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.12;
          z-index: 0;
        }

        /* Card */
        .glass-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          backdrop-filter: blur(12px);
        }

        /* Avatar ring */
        .avatar-glow {
          box-shadow: 0 0 0 2px rgba(251,191,36,0.35), 0 0 30px rgba(251,191,36,0.12);
        }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }

        /* Fade up */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim { animation: fadeUp 0.45s ease both; }
        .d1   { animation-delay: 0.05s; }
        .d2   { animation-delay: 0.1s; }
        .d3   { animation-delay: 0.15s; }
        .d4   { animation-delay: 0.2s; }

        /* Drag zone */
        .drag-active { border-color: rgba(251,191,36,0.5) !important; background: rgba(251,191,36,0.04) !important; }

        /* Save button */
        .btn-save {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-radius: 14px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: #0a0a0a;
          padding: 13px 32px;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          letter-spacing: 0.01em;
        }
        .btn-save:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(245,158,11,0.25);
        }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .btn-back {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-back:hover { color: rgba(255,255,255,0.7); }
      `}</style>

      {/* Ambient bg blobs */}
      <div className="ambient-glow w-[600px] h-[600px] bg-amber-500 top-[-200px] right-[-200px]" style={{ position: 'fixed' }} />
      <div className="ambient-glow w-[400px] h-[400px] bg-indigo-600 bottom-[0px] left-[-150px]" style={{ position: 'fixed' }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '40px 20px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Header */}
          <div className="anim" style={{ marginBottom: 32 }}>
            <button className="btn-back" onClick={() => navigate('/homepage')}>
              <ArrowLeftIcon /> Back
            </button>
            <div style={{ marginTop: 20 }}>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                Edit Profile
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                Changes are visible to your travel buddies
              </p>
            </div>
          </div>

          {/* ── Photo section ── */}
          <div className="glass-card anim d1" style={{ padding: 28, marginBottom: 16 }}>
            <p className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
              Profile Photo
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
              {/* Avatar preview */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="avatar-glow"
                  style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#f59e0b', border: '2px solid #0a0a0a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#0a0a0a', transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <CameraIcon />
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={isDragging ? "drag-active" : ""}
                style={{
                  flex: 1, minWidth: 200,
                  border: '1.5px dashed rgba(255,255,255,0.1)',
                  borderRadius: 14, padding: '20px 24px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                  Drop an image here, or{" "}
                  <span style={{ color: '#f59e0b', textDecoration: 'underline' }}>browse</span>
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                  PNG, JPG or WEBP · max 4 MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* ── Basic info ── */}
          <div className="glass-card anim d2" style={{ padding: 28, marginBottom: 16 }}>
            <p className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>
              Basic Info
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 20px' }}>
              {/* Name */}
              <div>
                <FieldLabel>Display Name</FieldLabel>
                <TextInput value={user.name} onChange={set("name")} placeholder="Your name" maxLength={40} />
              </div>

              {/* Username */}
              <div>
                <FieldLabel>Username</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 14, color: 'rgba(255,255,255,0.25)', pointerEvents: 'none'
                  }}>@</span>
                  <input
                    type="text"
                    value={user.username}
                    onChange={set("username")}
                    placeholder="username"
                    maxLength={30}
                    style={{ paddingLeft: 28 }}
                    className="w-full py-3 pr-4 rounded-xl text-sm transition-all outline-none
                      bg-white/[0.05] text-white border border-white/[0.08]
                      hover:border-white/[0.14] focus:border-amber-400/50 focus:bg-white/[0.07]
                      placeholder-white/20"
                  />
                </div>
              </div>

              {/* Email – locked */}
              <div>
                <FieldLabel locked>Email</FieldLabel>
                <TextInput value={user.email} disabled />
              </div>

              {/* Location */}
              <div>
                <FieldLabel>Location</FieldLabel>
                <TextInput value={user.location} onChange={set("location")} placeholder="City, Country" maxLength={60} />
              </div>
            </div>

            {/* Bio – full width */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FieldLabel>Bio</FieldLabel>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>
                  {user.bio?.length || 0} / 160
                </span>
              </div>
              <TextareaInput
                value={user.bio}
                onChange={set("bio")}
                placeholder="Tell the world how you travel…"
                maxLength={160}
              />
            </div>
          </div>

          {/* ── Travel preferences ── */}
          <div className="glass-card anim d3" style={{ padding: 28, marginBottom: 16 }}>
            <p className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Travel Style
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
              Pick up to 5 that describe how you roll
            </p>
            <PillSelector
              options={TRAVEL_STYLE_OPTIONS}
              selected={user.travelStyles}
              onChange={(v) => setUser((u) => ({ ...u, travelStyles: v }))}
              max={5}
            />
          </div>

          {/* ── Languages ── */}
          <div className="glass-card anim d4" style={{ padding: 28, marginBottom: 32 }}>
            <p className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Languages
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
              Languages you can chat in while travelling
            </p>
            <PillSelector
              options={LANGUAGE_OPTIONS}
              selected={user.languages}
              onChange={(v) => setUser((u) => ({ ...u, languages: v }))}
              max={6}
            />
          </div>

          {/* ── Dream Places ── */}
<div className="glass-card anim d4" style={{ padding: 28, marginBottom: 32 }}>
  <p className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
    Dream Places
  </p>
  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
    Places you dream of visiting someday
  </p>

  {/* Tag input row */}
  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
    <input
      type="text"
      id="dreamPlaceInput"
      placeholder="e.g. Kyoto, Patagonia, Santorini…"
      maxLength={40}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const val = e.target.value.trim();
          if (val && !user.dreamPlaces.includes(val) && user.dreamPlaces.length < 10) {
            setUser(u => ({ ...u, dreamPlaces: [...u.dreamPlaces, val] }));
            e.target.value = '';
          }
        }
      }}
      className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all
        bg-white/[0.05] text-white border border-white/[0.08]
        hover:border-white/[0.14] focus:border-amber-400/50 focus:bg-white/[0.07]
        focus:shadow-[0_0_0_3px_rgba(251,191,36,0.07)] placeholder-white/20"
    />
    <button
      onClick={() => {
        const input = document.getElementById('dreamPlaceInput');
        const val = input.value.trim();
        if (val && !user.dreamPlaces.includes(val) && user.dreamPlaces.length < 10) {
          setUser(u => ({ ...u, dreamPlaces: [...u.dreamPlaces, val] }));
          input.value = '';
        }
      }}
      style={{
        padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600,
        background: 'rgba(251,191,36,0.1)', color: '#f59e0b',
        border: '1px solid rgba(251,191,36,0.2)', cursor: 'pointer',
        transition: 'all 0.2s', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif"
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.18)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}
    >
      + Add
    </button>
  </div>

  {/* Tags */}
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {user.dreamPlaces.map((place) => (
      <span
        key={place}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
          background: 'rgba(251,191,36,0.08)', color: '#fbbf24',
          border: '1px solid rgba(251,191,36,0.2)'
        }}
      >
        ✈ {place}
        <button
          onClick={() => setUser(u => ({ ...u, dreamPlaces: u.dreamPlaces.filter(p => p !== place) }))}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(251,191,36,0.5)', fontSize: 14, lineHeight: 1,
            padding: 0, display: 'flex', alignItems: 'center'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(251,191,36,0.5)'}
        >
          ×
        </button>
      </span>
    ))}
    {user.dreamPlaces.length === 0 && (
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', fontStyle: 'italic' }}>
        No dream places added yet…
      </p>
    )}
  </div>

  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', marginTop: 12 }}>
    {user.dreamPlaces.length} / 10 · Press Enter or comma to add
  </p>
</div>

          {/* ── Action bar ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => window.close()}
              style={{
                fontSize: 13, color: 'rgba(255,255,255,0.3)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              Discard changes
            </button>

            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg className="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                  </svg>
                  Saving…
                </span>
              ) : "Save Changes"}
            </button>
          </div>

        </div>
      </div>

      <Toast visible={toastVisible} />
    </>
  );
}