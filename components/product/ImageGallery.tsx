"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  url: string;
  altText?: string | null;
}

export function ImageGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div style={{
        aspectRatio: "3/4",
        background: "var(--color-cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-gray-400)",
      }}>
        No image
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Main image */}
      <div style={{
        position: "relative",
        aspectRatio: "3/4",
        overflow: "hidden",
        background: "var(--color-cream)",
      }}>
        <Image
          src={images[active].url}
          alt={images[active].altText ?? productName}
          fill
          priority
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto" }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                width: "72px",
                height: "88px",
                position: "relative",
                overflow: "hidden",
                background: "var(--color-cream)",
                border: i === active
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                transition: "border-color 150ms ease",
              }}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} ${i + 1}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
