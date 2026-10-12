import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import ImageLightbox from '../components/ImageLightbox';

export default function CreateTrip() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    maxTravelers: '',
    travelStyle: 'Adventure',
    accommodation: '',
    transportation: '',
    itinerary: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Clean up the temporary preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Cover image must be under 5MB');
      e.target.value = '';
      return;
    }

    setError('');
    setCoverImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("destination", form.destination);
      formData.append("description", form.description);
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);
      formData.append("budget", Number(form.budget));
      formData.append("maxTravelers", Number(form.maxTravelers));
      formData.append("travelStyle", form.travelStyle);
      formData.append("accommodation", form.accommodation);
      formData.append("transportation", form.transportation);

      // Convert itinerary textarea into the structure expected by backend
      const itinerary = form.itinerary
        ? [
          {
            day: 1,
            title: "Trip Plan",
            activities: [form.itinerary],
          },
        ]
        : [];

      formData.append("itinerary", JSON.stringify(itinerary));

      // Add cover image if user selected one
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const response = await axios.post(
        "http://localhost:5000/api/trips",
        formData,
        {
          withCredentials: true,
        }
      );

      console.log("Trip created:", response.data);

      navigate("/trips");
    } catch (err) {
      console.error("Trip creation failed:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create trip"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,500&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }

        .anim-fade-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.1s; }
        .d3 { animation-delay: 0.15s; }

        .gradient-text {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }
        .card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1.25rem;
        }
        .field-input {
          margin-top: 0.5rem;
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.25); }
        .field-input:focus {
          border-color: rgba(245,158,11,0.5);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
        }
        .field-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
        }
        .field-hint {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
          margin-top: 0.25rem;
        }
        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
        }
        .section-sub {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
          margin-top: 0.25rem;
        }
        .dropzone {
          margin-top: 0.5rem;
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          background: rgba(255,255,255,0.02);
          transition: border-color 0.2s;
        }
        .dropzone:hover { border-color: rgba(245,158,11,0.4); }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="anim-fade-up text-center mb-8">
          <h1 className="font-display text-3xl font-black">
            <span className="gradient-text">Create a Trip</span>
          </h1>

          <p className="text-sm text-white/40 mt-2">
            Share your travel plans and find people to explore with.
          </p>
        </div>

        {/* Form Card */}
        <div className="anim-fade-up d1 card p-8">

          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Basic Information */}
            <div>
              <h2 className="section-title">
                Trip Details
              </h2>

              <p className="section-sub">
                Tell people what your trip is about.
              </p>
            </div>

            {/* Trip Title */}
            <div>
              <label className="field-label">
                Trip Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="eg. Manali Winter Escape"
                className="field-input"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="field-label">
                Destination
              </label>

              <input
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                required
                placeholder="eg. Manali, Himachal Pradesh"
                className="field-input"
              />
            </div>

            {/* Description */}
            <div>
              <label className="field-label">
                About the Trip
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your trip, what you plan to do, and what kind of travelers you're looking for..."
                className="field-input resize-y"
              />
            </div>

            {/* Dates */}
            <div>
              <h2 className="section-title">
                Schedule
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">

                <div>
                  <label className="field-label">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="field-input [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="field-label">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="field-input [color-scheme:dark]"
                  />
                </div>

              </div>
            </div>

            {/* Travel Information */}
            <div>
              <h2 className="section-title">
                Travel Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">

                {/* Budget */}
                <div>
                  <label className="field-label">
                    Estimated Budget (₹)
                  </label>

                  <input
                    type="number"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="eg. 12000"
                    className="field-input"
                  />

                  <p className="field-hint">
                    Approximate cost per person.
                  </p>
                </div>

                {/* Max Travelers */}
                <div>
                  <label className="field-label">
                    Maximum Travelers
                  </label>

                  <input
                    type="number"
                    name="maxTravelers"
                    value={form.maxTravelers}
                    onChange={handleChange}
                    min="2"
                    max="50"
                    required
                    placeholder="eg. 5"
                    className="field-input"
                  />
                </div>

                {/* Travel Style */}
                <div>
                  <label className="field-label">
                    Travel Style
                  </label>

                  <select
                    name="travelStyle"
                    value={form.travelStyle}
                    onChange={handleChange}
                    className="field-input [color-scheme:dark]"
                  >
                    <option>Adventure</option>
                    <option>Relaxation</option>
                    <option>Backpacking</option>
                    <option>Road Trip</option>
                    <option>Nature</option>
                    <option>Culture</option>
                    <option>Photography</option>
                    <option>Mixed</option>
                  </select>
                </div>

                {/* Accommodation */}
                <div>
                  <label className="field-label">
                    Accommodation
                  </label>

                  <input
                    type="text"
                    name="accommodation"
                    value={form.accommodation}
                    onChange={handleChange}
                    placeholder="eg. Hostel / Hotel / Airbnb"
                    className="field-input"
                  />
                </div>

              </div>
            </div>

            {/* Transportation */}
            <div>
              <label className="field-label">
                Transportation
              </label>

              <input
                type="text"
                name="transportation"
                value={form.transportation}
                onChange={handleChange}
                placeholder="eg. Train + Local Bus / Car / Flight"
                className="field-input"
              />
            </div>

            {/* Itinerary */}
            <div>
              <label className="field-label">
                Planned Itinerary
              </label>

              <textarea
                name="itinerary"
                value={form.itinerary}
                onChange={handleChange}
                rows={6}
                placeholder={`Day 1 - Arrive in Manali, check-in and explore Mall Road
Day 2 - Solang Valley and trekking
Day 3 - Kasol day trip
Day 4 - Local sightseeing
Day 5 - Return journey`}
                className="field-input resize-y"
              />

              <p className="field-hint">
                Give potential travelers an idea of what the trip will look like.
              </p>
            </div>

            {/* Trip Cover Image */}
            <div>
              <label className="field-label">
                Trip Cover Image
              </label>

              <div className="dropzone">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Cover preview"
                    onClick={() => setShowPreview(true)}
                    className="mx-auto max-h-48 rounded-xl object-cover cursor-pointer"
                  />
                ) : (
                  <div className="text-3xl mb-2">
                    📷
                  </div>
                )}

                <p className="text-sm text-white/50 mt-2">
                  {coverImage ? coverImage.name : 'Upload a cover image for your trip'}
                </p>

                <p className="text-xs text-white/25 mt-1">
                  JPG, PNG, WEBP up to 5MB
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  id="trip-cover-image"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <label
                  htmlFor="trip-cover-image"
                  className="inline-block mt-4 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-amber-400 text-sm font-medium hover:bg-white/10 hover:border-amber-400/30 transition cursor-pointer"
                >
                  {coverImage ? 'Change Image' : 'Choose Image'}
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-5 border-t border-white/[0.06]">

              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full text-black font-semibold bg-white hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating Trip...' : 'Create Trip'}
              </button>

            </div>

          </form>
        </div>
      </div>

      {showPreview && (
        <ImageLightbox
          src={previewUrl}
          alt="Cover preview"
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="h-20 md:h-0" />
    </div>
  );
}