import React, { useState } from "react";

/**
 * OptimizedImage
 *
 * A thin wrapper around <img> that:
 * - Applies loading="lazy" and decoding="async" by default
 * - Requires explicit width/height to prevent Cumulative Layout Shift (CLS)
 * - Falls back to a placeholder or initials avatar when the image fails to load
 *
 * Props
 * -----
 * src        {string}  Image URL
 * alt        {string}  Accessible alt text (required)
 * width      {number}  Intrinsic width in px  (required – prevents CLS)
 * height     {number}  Intrinsic height in px (required – prevents CLS)
 * className  {string}  Additional CSS classes
 * fallback   {string}  Text whose initials are shown when the image errors.
 *                      If omitted a grey placeholder block is shown instead.
 * priority   {boolean} Set true for above-the-fold hero images to skip lazy
 *                      loading (mirrors the Next.js Image priority prop).
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  fallback,
  priority = false,
}) {
  const [errored, setErrored] = useState(false);

  // Derive up-to-two initials from the fallback string
  const initials = fallback
    ? fallback
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("")
    : null;

  if (!src || errored) {
    // Render an inline SVG placeholder that respects the requested dimensions
    if (initials) {
      return (
        <span
          role="img"
          aria-label={alt}
          className={`inline-flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold select-none ${className}`}
          style={{ width, height, fontSize: Math.max(10, Math.floor(Math.min(width, height) * 0.38)) }}
        >
          {initials}
        </span>
      );
    }

    return (
      <span
        role="img"
        aria-label={alt}
        className={`inline-block bg-slate-100 ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      onError={() => setErrored(true)}
    />
  );
}

export default OptimizedImage;
