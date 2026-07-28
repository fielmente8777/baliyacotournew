"use client";

import Image from "next/image";
import { MdClose } from "react-icons/md";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useEffect, useCallback } from "react";

import { useWebContext } from "@/context-api/WebContext";

const ImagePopup = () => {
  const {
    closeGallery,
    openImageModal,
    passImagesArray,
    imageCurrentIndex,
    setImageCurrentIndex,
  } = useWebContext();

  const handleNext = useCallback(() => {
    setImageCurrentIndex(
      imageCurrentIndex === passImagesArray.length - 1
        ? 0
        : imageCurrentIndex + 1
    );
  }, [imageCurrentIndex, passImagesArray.length, setImageCurrentIndex]);

  const handlePrev = useCallback(() => {
    setImageCurrentIndex(
      imageCurrentIndex === 0
        ? passImagesArray.length - 1
        : imageCurrentIndex - 1
    );
  }, [imageCurrentIndex, passImagesArray.length, setImageCurrentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!openImageModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") closeGallery();
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [openImageModal, handleNext, handlePrev, closeGallery]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    const activeThumb = document.getElementById(
      `thumb-${imageCurrentIndex}`
    );
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [imageCurrentIndex]);

  const hasMultiple = passImagesArray.length > 1;

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label="Image Gallery"
      className={`fixed inset-0 z-[999] transition-all duration-300 ease-in-out bg-black/85 backdrop-blur-md ${
        openImageModal
          ? "opacity-100 visible pointer-events-auto"
          : "opacity-0 invisible pointer-events-none"
      }`}
    >
      {/* Overlay click to close */}
      <div
        className="absolute inset-0"
        onClick={closeGallery}
        aria-hidden="true"
      />

      <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 p-2 sm:p-4">

        {/* Close Button */}
        <button
          onClick={closeGallery}
          aria-label="Close gallery"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-50 text-white
            bg-black/40 hover:bg-black/70 active:scale-95
            rounded-full p-2 sm:p-2.5
            transition-all duration-200"
        >
          <MdClose className="text-2xl sm:text-3xl" />
        </button>

        {/* Image Counter */}
        {hasMultiple && (
          <span className="absolute top-3 left-3 sm:top-5 sm:left-5 z-50
            text-white/80 text-xs sm:text-sm font-medium
            bg-black/40 rounded-full px-3 py-1">
            {imageCurrentIndex + 1} / {passImagesArray.length}
          </span>
        )}

        {/* Main Image Area */}
        <div className="relative flex items-center justify-center w-full flex-1 min-h-0 px-10 sm:px-16 md:px-20">

          {/* Prev Button */}
          {hasMultiple && (
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-1 sm:left-3 md:left-5 z-50 text-white
                bg-black/40 hover:bg-black/70 active:scale-95
                rounded-full p-2 sm:p-3
                transition-all duration-200 touch-manipulation"
            >
              <FaChevronLeft className="text-base sm:text-xl md:text-2xl" />
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative w-full h-full max-w-6xl rounded-xl sm:rounded-2xl overflow-hidden
              shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {passImagesArray[imageCurrentIndex] && (
              <Image
                src={passImagesArray[imageCurrentIndex]}
                alt={`Gallery Image ${imageCurrentIndex + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                priority
                className="object-contain"
              />
            )}
          </div>

          {/* Next Button */}
          {hasMultiple && (
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-1 sm:right-3 md:right-5 z-50 text-white
                bg-black/40 hover:bg-black/70 active:scale-95
                rounded-full p-2 sm:p-3
                transition-all duration-200 touch-manipulation"
            >
              <FaChevronRight className="text-base sm:text-xl md:text-2xl" />
            </button>
          )}
        </div>

        {/* Thumbnail Strip */}
        {hasMultiple && (
          <div
            className="relative z-10 flex gap-2 sm:gap-3
              overflow-x-auto
              max-w-[calc(100vw-1rem)] sm:max-w-[85vw] md:max-w-3xl
              px-2 pb-1
              scrollbar-none"
            style={{ scrollbarWidth: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {passImagesArray.map((image, index) => (
              <button
                key={index}
                id={`thumb-${index}`}
                onClick={() => setImageCurrentIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={imageCurrentIndex === index ? "true" : undefined}
                className={`relative shrink-0
                  w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20
                  rounded-lg sm:rounded-xl overflow-hidden border-2
                  transition-all duration-200 touch-manipulation
                  ${
                    imageCurrentIndex === index
                      ? "border-white scale-105 opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                style={{
                  width: "clamp(3rem, 8vw, 5rem)",
                  height: "clamp(3rem, 8vw, 5rem)",
                }}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default ImagePopup;
