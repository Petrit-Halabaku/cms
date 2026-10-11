import assert from "node:assert/strict";
import test from "node:test";

import { buildProductGalleryImages } from "./product-gallery-images.ts";

test("puts the featured product image first in gallery mode", () => {
  const featured = {
    storage_path: "products/s77/featured.webp",
    alt_en: "Featured view",
    alt_sq: "Pamja kryesore",
  };
  const gallery = [
    {
      storage_path: "products/s77/gallery-1.webp",
      alt_en: "Detail view",
      alt_sq: "Pamje detaji",
    },
  ];

  const toSrc = (path: string) => `https://cdn.example.com/${path}`;

  assert.deepEqual(buildProductGalleryImages(featured, gallery, "en", toSrc), [
    {
      src: "https://cdn.example.com/products/s77/featured.webp",
      alt: "Featured view",
    },
    {
      src: "https://cdn.example.com/products/s77/gallery-1.webp",
      alt: "Detail view",
    },
  ]);
});
