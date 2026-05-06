"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  title,
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrent(0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
    },
    [onClose, images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1a0505]/85 backdrop-blur-md animate-[fadeIn_200ms_ease]"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col animate-[modalIn_350ms_cubic-bezier(0.16,1,0.3,1)]">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3
              className="text-lg font-semibold text-white sm:text-xl"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {title}
            </h3>
            <p
              className="text-xs text-white/50"
              style={{ fontFamily: "Inter Tight, sans-serif" }}
            >
              {current + 1} / {images.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image */}
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-black/30">
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
            <Image
              src={images[current]}
              alt={`${title} - ${current + 1}`}
              fill
              unoptimized
              className="object-contain"
            />
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrent((c) => (c + 1) % images.length)}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={[
                  "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-16",
                  current === idx
                    ? "border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                    : "border-transparent opacity-50 hover:opacity-80",
                ].join(" ")}
              >
                <Image
                  src={img}
                  alt={`thumb-${idx}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(12px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </div>
  );
};

export default GalleryModal;