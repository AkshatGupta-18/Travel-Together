// ProfileSidebar.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const SETUP_STEPS = [
  { label: "Create account", done: true },
  { label: "Add profile photo", done: false },
  { label: "Set travel preferences", done: false },
  { label: "Find first buddy", done: false },
];

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function ProfileSidebar() {
  const setupDone = SETUP_STEPS.filter((s) => s.done).length;
  const setupTotal = SETUP_STEPS.length;
  const setupProgress = Math.round((setupDone / setupTotal) * 100);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    axios.get("http://localhost:5000/api/users/me", { withCredentials: true })
      .then(res => {
        const d = res.data;
        setUser({
          name: d.name ?? "Traveller",
          username: d.username ?? "",
          avatar: d.avatar ?? "https://i.pravatar.cc/160?img=11",
          location: d.location ?? "",
          // keep these dummy for now:
          tripsCount: 12,
          buddiesCount: 5,
          countriesCount: 8,
        });
      })
      .catch(err => console.error("Failed to load user", err));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <aside className="desktop-sidebar w-60 shrink-0 sticky top-[76px] self-start flex flex-col gap-4 h-[calc(100vh-96px)] overflow-y-auto">

      {/* Profile card */}
      <div className="card p-4 anim-fade-up">
          <div onClick={() => navigate("/profile")} className="flex items-start gap-3 mb-4 group cursor-pointer">
          <div className="avatar-ring anim-float">
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover 
      transition-opacity group-hover:opacity-80" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate group-hover:text-amber-400 transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-white/35 truncate">@{user.username}</p>
            <p className="text-xs text-amber-400/70 mt-0.5 truncate flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              {user.location}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 py-3 border-t border-b border-white/[0.06] mb-4">
          {[
            ["Trips", user.tripsCount],
            ["Buddies", user.buddiesCount],
            ["Countries", user.countriesCount],
          ].map(([label, val]) => (
            <div key={label} className="text-center">
              <p className="font-display font-bold text-white text-base">{val}</p>
              <p className="text-[10px] text-white/25 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        <a href="/profile/edit" className="btn-ghost w-full text-center block text-xs py-2">Edit Profile</a>
      </div>

      {/* Setup checklist */}
      <div className="card p-4 anim-fade-up d1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-white">Profile setup</p>
          <span className="text-[10px] text-amber-400 font-bold">{setupProgress}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-4">
          <div className="progress-bar h-full" style={{ width: `${setupProgress}%` }} />
        </div>
        <div className="flex flex-col gap-2">
          {SETUP_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-amber-400" : "border border-white/15"}`}>
                {step.done && <CheckIcon />}
              </div>
              <p className={`text-xs ${step.done ? "text-white/35 line-through" : "text-white/60"}`}>{step.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nav links */}
      <div className="card p-2 anim-fade-up d2">
        {[
          { icon: "🧭", label: "Discover", href: "/discover" },
          { icon: "🗺️", label: "My Trips", href: "/trips" },
          { icon: "👥", label: "Buddies", href: "/buddies" },
          { icon: "📸", label: "Stories", href: "/stories" },
          { icon: "⚙️", label: "Settings", href: "/settings" },
        ].map((item) => (
          <a key={item.label} href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-all">
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>

      <button className="flex items-center gap-2 px-3 py-2 text-xs text-white/25 hover:text-rose-400 transition-colors w-full">
        <LogoutIcon />
        Log out
      </button>
    </aside>
  );
}