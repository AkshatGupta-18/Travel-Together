import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";





// ─── ICONS ────────────────────────────────────────────────────────────────────

const EyeIcon = ({ open }) =>
  open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ArrowRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ─── TRAVEL IMAGES FOR SIDE PANEL ────────────────────────────────────────────

const SIDE_IMAGES = [
  {
    img: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&q=85",
    user: "marco.travels",
    avatar: "https://i.pravatar.cc/60?img=11",
    location: "Amalfi Coast, Italy",
    caption: "Some roads were made to be taken twice 🛵",
    likes: "9.2k",
  },
  {
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=85",
    user: "sofia.wanders",
    avatar: "https://i.pravatar.cc/60?img=47",
    location: "Santorini, Greece",
    caption: "Found my travel buddy on the first day here ✨",
    likes: "14.8k",
  },
  {
    img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=85",
    user: "kenji.roams",
    avatar: "https://i.pravatar.cc/60?img=32",
    location: "Kyoto, Japan",
    caption: "Bamboo forests hit different at sunrise 🎋",
    likes: "11.3k",
  },
];

// ─── INPUT FIELD ──────────────────────────────────────────────────────────────

function InputField({ label, type = "text", placeholder, value, onChange, icon, rightSlot, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-widest">{label}</label>
      <div className={`flex items-center gap-3 bg-white/5 border rounded-xl px-4 py-3 transition-all duration-200 focus-within:border-amber-400/60 focus-within:bg-white/8 focus-within:shadow-lg focus-within:shadow-amber-400/5 ${error ? "border-rose-500/60" : "border-white/10"}`}>
        <span className="text-white/30 shrink-0">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none font-light"
        />
        {rightSlot}
      </div>
      {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
    </div>
  );
}

// ─── MAIN LOGIN PAGE ──────────────────────────────────────────────────────────

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeImg] = useState(0);
  const { setUser } = useAuth();  // ← add this line


  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    return e;
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setErrors({});
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      setUser(response.data);   // ← tells AuthContext the user is now logged in
      navigate("/homepage");
    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "Login failed. Try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const post = SIDE_IMAGES[activeImg];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Fraunces:ital,wght@0,700;0,900;1,500;1,700&display=swap');
          .font-display { font-family: 'Fraunces', Georgia, serif; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          @keyframes gradientShift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
          @keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
          .anim-fade-up { opacity:0; animation: fadeUp 0.6s ease forwards; }
          .d1 { animation-delay:0.05s; } .d2 { animation-delay:0.12s; }
          .d3 { animation-delay:0.19s; } .d4 { animation-delay:0.26s; }
          .d5 { animation-delay:0.33s; } .d6 { animation-delay:0.40s; }
          .gradient-text {
            background: linear-gradient(135deg,#f59e0b 0%,#f97316 50%,#ef4444 100%);
            background-size:200% 200%;
            -webkit-background-clip:text; -webkit-text-fill-color:transparent;
            background-clip:text; animation: gradientShift 4s ease infinite;
          }
          .btn-shimmer { position:relative; overflow:hidden; }
          .btn-shimmer::after {
            content:''; position:absolute; inset:0;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
            transform:translateX(-100%);
          }
          .btn-shimmer:hover::after { animation: shimmer 0.6s ease; }
          ::-webkit-scrollbar { width:0; }
        `}</style>

      {/* ── LEFT: FORM PANEL ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-14 lg:px-20 py-12 max-w-xl w-full mx-auto lg:mx-0">

        {/* Logo */}
        <div className="anim-fade-up mb-12">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-black font-black text-xs">T</span>
            </div>
            <span className="font-display font-bold text-lg text-white">
              Travel<span className="gradient-text">Together</span>
            </span>
          </Link>
        </div>

        {/* Heading */}
        <div className="anim-fade-up d1 mb-8">
          <h1 className="font-display text-4xl font-black text-white leading-tight mb-2">
            Welcome back, <br />
            <em className="italic gradient-text">explorer.</em>
          </h1>
          <p className="text-sm text-white/40 font-light mt-3">
            New here?{" "}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
              Create a free account →
            </Link>
          </p>
        </div>

        {/* Google OAuth */}
        <div className="anim-fade-up d2 mb-6">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 text-sm text-white/80 font-medium py-3 rounded-xl transition-all duration-200"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="anim-fade-up d2 flex items-center gap-4 mb-6">
          <span className="flex-1 h-px bg-white/8" />
          <span className="text-xs text-white/25 uppercase tracking-widest">or</span>
          <span className="flex-1 h-px bg-white/8" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="anim-fade-up d3">
            <InputField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<MailIcon />}
              error={errors.email}
            />
          </div>

          <div className="anim-fade-up d4">
            <InputField
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<LockIcon />}
              error={errors.password}
              rightSlot={
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="text-white/30 hover:text-white/70 transition-colors shrink-0">
                  <EyeIcon open={showPw} />
                </button>
              }
            />
          </div>

          {/* Forgot */}
          <div className="anim-fade-up d4 flex justify-end -mt-1">
            <a href="#" className="text-xs text-white/35 hover:text-amber-400 transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <div className="anim-fade-up d5 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-sm py-3.5 rounded-xl hover:bg-amber-400 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Log in <ArrowRight /></>
              )}
            </button>
          </div>
        </form>

        {/* Footer note */}
        <p className="anim-fade-up d6 text-xs text-white/20 text-center mt-10">
          By continuing you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-white/50">Terms</a>{" "}
          &amp;{" "}
          <a href="#" className="underline underline-offset-2 hover:text-white/50">Privacy Policy</a>
        </p>
      </div>

      {/* ── RIGHT: IMAGE PANEL ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Full bleed photo */}
        <img
          src={post.img}
          alt={post.location}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" style={{ width: "30%" }} />

        {/* Top tag */}
        <div className="absolute top-8 right-8">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 text-white/70 text-xs px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {Math.floor(Math.random() * 300 + 100)} travellers online now
          </div>
        </div>

        {/* Post card overlay */}
        <div className="absolute bottom-12 right-8 left-8 max-w-xs ml-auto">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
              <img src={post.avatar} className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/50" alt="" />
              <div>
                <p className="text-xs font-semibold text-white">{post.user}</p>
                <p className="text-[10px] text-white/40">{post.location}</p>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-white/70 leading-relaxed">{post.caption}</p>
              <div className="flex items-center gap-1 mt-2">
                <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 0112 5.09 5.5 5.5 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="text-xs text-white/40">{post.likes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="absolute top-1/2 -translate-y-1/2 right-8 left-8 text-center px-4">
          <p className="font-display text-2xl font-bold text-white/80 italic leading-snug">
            "The world is a book, and those who do not travel read only one page."
          </p>
          <p className="text-xs text-white/30 mt-3 uppercase tracking-widest">— Saint Augustine</p>
        </div>
      </div>
    </div>
  );
}