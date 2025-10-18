import type { CollectionImageSet } from "shared/types";
import imageCompression from "browser-image-compression";

const MAX_FILE_SIZE_MB = 2; // 2MB

export class CollectionImageProcessor {
  // Process banner image
  static async processBanner(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<CollectionImageSet> {
    let percent = 0;

    const bannerBlob = await imageCompression(file, {
      maxSizeMB: MAX_FILE_SIZE_MB,
      fileType: "image/webp",
      initialQuality: 0.85,
      onProgress: (p) => {
        percent = Math.round(p * 60);
        onProgress?.(percent);
      },
    });

    onProgress?.(100);

    const bannerURL = URL.createObjectURL(bannerBlob);
    return {
      id: "",
      banner: bannerURL,
      preview: "",
      thumbnail: "",
    };
  }

  // Process preview image
  static async processPreview(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<CollectionImageSet> {
    let percent = 0;

    const previewBlob = await imageCompression(file, {
      maxSizeMB: MAX_FILE_SIZE_MB,
      fileType: "image/webp",
      initialQuality: 0.85,
      onProgress: (p) => {
        percent = Math.round(p * 60);
        onProgress?.(percent);
      },
    });

    onProgress?.(100);

    const previewURL = URL.createObjectURL(previewBlob);
    return {
      id: "",
      banner: "",
      preview: previewURL,
      thumbnail: "",
    };
  }
}

export default CollectionImageProcessor;
