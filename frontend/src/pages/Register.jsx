import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
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

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const AtIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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

// ─── SIDE PANEL COLLAGE ───────────────────────────────────────────────────────

const COLLAGE = [
  { img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80", span: "row-span-2" },
  { img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80", span: "" },
  { img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=500&q=80", span: "" },
  { img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=500&q=80", span: "" },
  { img: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=500&q=80", span: "col-span-2" },
];

const PERKS = [
  "Find travel buddies worldwide",
  "Share your trips & inspire others",
  "Real-time trip planning & chat",
  "Verified explorer profiles",
];

// ─── PASSWORD STRENGTH ────────────────────────────────────────────────────────

function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "", color: "" },
    { label: "Weak", color: "bg-rose-500" },
    { label: "Fair", color: "bg-orange-400" },
    { label: "Good", color: "bg-amber-400" },
    { label: "Strong", color: "bg-green-400" },
  ];
  return { score, ...map[score] };
}

// ─── INPUT FIELD ──────────────────────────────────────────────────────────────

function InputField({ id, label, type = "text", placeholder, value, onChange, icon, rightSlot, error, hint, autoComplete }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-white/50 uppercase tracking-widest">{label}</label>
      <div className={`flex items-center gap-3 bg-white/5 border rounded-xl px-4 py-3 transition-all duration-200 focus-within:border-amber-400/60 focus-within:bg-white/8 focus-within:shadow-lg focus-within:shadow-amber-400/5 ${error ? "border-rose-500/60" : "border-white/10"}`}>
        <span className="text-white/30 shrink-0">{icon}</span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none font-light"
        />
        {rightSlot}
      </div>
      {error && <p id={`${id}-error`} className="text-xs text-rose-400">{error}</p>}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-white/25">{hint}</p>}
    </div>
  );
}

// ─── MAIN REGISTER PAGE ───────────────────────────────────────────────────────

export default function Register() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const strength = getStrength(form.password);
  const navigate = useNavigate();
  const { setUser } = useAuth();


  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.username.trim()) e.username = "Username is required";
    else if (/\s/.test(form.username)) e.username = "No spaces allowed";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords don't match";
    if (!agreed) e.terms = "Please accept the terms";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await api.post("/auth/register", {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
      });


      // optional success action
      setUser(response.data.user); // ← set the user in context first
      navigate("/homepage");
      // reset form
      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        confirm: "",
      });

    } catch (error) {
      console.error(error);

      // backend error message
      if (error.response && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Fraunces:ital,wght@0,700;0,900;1,500;1,700&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes gradientShift { 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
        @keyframes shimmer { 0%{ transform:translateX(-100%); } 100%{ transform:translateX(100%); } }
        .anim-fade-up { opacity:0; animation: fadeUp 0.6s ease forwards; }
        .d1{ animation-delay:0.05s; } .d2{ animation-delay:0.10s; }
        .d3{ animation-delay:0.15s; } .d4{ animation-delay:0.20s; }
        .d5{ animation-delay:0.25s; } .d6{ animation-delay:0.30s; }
        .d7{ animation-delay:0.35s; } .d8{ animation-delay:0.40s; }
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

      {/* ── LEFT: IMAGE COLLAGE PANEL ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col justify-between p-10">
        {/* Collage grid */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-2 p-2 opacity-60">
          {COLLAGE.map((c, i) => (
            <div key={i} className={`relative overflow-hidden rounded-xl ${c.span}`}>
              <img src={c.img} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]" style={{ left: "70%" }} />

        {/* Content over collage */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-black font-black text-xs">T</span>
            </div>
            <span className="font-display font-bold text-lg text-white">
              Travel<span className="gradient-text">Together</span>
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-3xl font-black text-white leading-tight mb-8">
            Join the world's <br />
            <em className="italic gradient-text">fastest-growing</em><br />
            travel community.
          </h2>

          {/* Perks list */}
          <ul className="flex flex-col gap-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
                  <CheckIcon />
                </span>
                <span className="text-sm text-white/70">{p}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/8">
            <div className="flex -space-x-2">
              {["47", "11", "32", "25", "8"].map((n) => (
                <img key={n} src={`https://i.pravatar.cc/40?img=${n}`} alt=""
                  className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] object-cover" />
              ))}
            </div>
            <p className="text-xs text-white/40">
              <span className="text-white/70 font-medium">24,000+</span> explorers already on board
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: FORM PANEL ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-10 overflow-y-auto max-w-xl w-full mx-auto lg:mx-0">

        {/* Mobile logo */}
        <div className="anim-fade-up lg:hidden mb-8">
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
        <div className="anim-fade-up d1 mb-7">
          <h1 className="font-display text-4xl font-black text-white leading-tight mb-2">
            Start your <br />
            <em className="italic gradient-text">adventure.</em>
          </h1>
          <p className="text-sm text-white/40 font-light mt-3">
            Already exploring?{" "}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
              Log in →
            </Link>
          </p>
        </div>

        {/* Google OAuth */}
        <div className="anim-fade-up d2 mb-5">
          <button type="button"
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 text-sm text-white/80 font-medium py-3 rounded-xl transition-all duration-200">
            <GoogleIcon />
            Sign up with Google
          </button>
        </div>

        {/* Divider */}
        <div className="anim-fade-up d2 flex items-center gap-4 mb-5">
          <span className="flex-1 h-px bg-white/8" />
          <span className="text-xs text-white/25 uppercase tracking-widest">or</span>
          <span className="flex-1 h-px bg-white/8" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name + Username row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="anim-fade-up d3">
              <InputField
                id="name"
                label="Full Name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={set("name")}
                icon={<UserIcon />}
                error={errors.name}
                autoComplete="name"
              />
            </div>
            <div className="anim-fade-up d3">
              <InputField
                id="username"
                label="Username"
                placeholder="jane.wanders"
                value={form.username}
                onChange={set("username")}
                icon={<AtIcon />}
                error={errors.username}
                hint="No spaces"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Email */}
          <div className="anim-fade-up d4">
            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              icon={<MailIcon />}
              error={errors.email}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="anim-fade-up d5 flex flex-col gap-1.5">
            <InputField
              id="password"
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set("password")}
              icon={<LockIcon />}
              error={errors.password}
              rightSlot={
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="text-white/30 hover:text-white/70 transition-colors shrink-0" aria-label={showPw ? 'Hide password' : 'Show password'}>
                  <EyeIcon open={showPw} />
                </button>
              }
              autoComplete="new-password"
            />
            {/* Strength bar */}
            {form.password && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-white/10"}`}
                    />
                  ))}
                </div>
                <span className={`text-xs font-medium transition-colors ${strength.score <= 1 ? "text-rose-400" :
                    strength.score === 2 ? "text-orange-400" :
                      strength.score === 3 ? "text-amber-400" : "text-green-400"
                  }`}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="anim-fade-up d6">
            <InputField
              id="confirm"
              label="Confirm Password"
              type={showCp ? "text" : "password"}
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={set("confirm")}
              icon={<LockIcon />}
              error={errors.confirm}
              rightSlot={
                <button type="button" onClick={() => setShowCp(!showCp)}
                  className="text-white/30 hover:text-white/70 transition-colors shrink-0" aria-label={showCp ? 'Hide confirmation' : 'Show confirmation'}>
                  <EyeIcon open={showCp} />
                </button>
              }
              autoComplete="new-password"
            />
          </div>

          {/* Terms */}
          <div className="anim-fade-up d7">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className={`mt-0.5 w-4 h-4 rounded border shrink-0 transition-all duration-200 focus:ring-2 focus:ring-amber-300 ${agreed ? "bg-amber-400 border-amber-400" : "border-white/20 bg-white/5 group-hover:border-white/40"
                  }`}
                aria-required={true}
              />
              <span className="text-xs text-white/40 leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-amber-400 hover:text-amber-300">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-amber-400 hover:text-amber-300">Privacy Policy</a>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-rose-400 mt-1">{errors.terms}</p>}
          </div>

          {/* Submit */}
          <div className="anim-fade-up d8 mt-1">
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
                  Creating your account…
                </>
              ) : (
                <>Create my account <ArrowRight /></>
              )}
            </button>
          </div>
        </form>

        <p className="anim-fade-up text-xs text-white/20 text-center mt-8">
          © 2025 TravelTogether · Free forever · No credit card needed
        </p>
      </div>
    </div>
  );
}