import { useEffect } from "react";

export default function ImageLightbox({ src, alt = "Trip image", onClose }) {
  useEffect(() => {
    if (!src) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg"
        aria-label="Close image"
      >
        ✕
      </button>

      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-full rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}