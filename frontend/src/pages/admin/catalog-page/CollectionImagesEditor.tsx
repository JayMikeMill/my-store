import React, { useRef, useState, useEffect } from "react";

// Lightbox
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Zoom } from "yet-another-react-lightbox/plugins";

// Types
import type { CollectionImageSet } from "./CollectionDialog";

// Components
import CropDialog from "@components/dialogs/CropDialog";

// Image processing
import CollectionImagesProcessor from "./CollectionImagesProcessor";
import { XButton } from "@components/controls/CustomControls";

interface ImageEditorProps {
  className?: string;
  images: CollectionImageSet | null;
  onImagesChange: (images: CollectionImageSet | null) => void;
  setIsProcessingImages: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductImagesEditor: React.FC<ImageEditorProps> = ({
  className,
  images,
  onImagesChange,
  setIsProcessingImages,
}) => {
  const [isCropping, setIsCropping] = useState(false);
  const [pendingCropFiles, setPendingCropFiles] = useState<File[]>([]);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [lightboxType, setLightboxType] = useState<"banner" | "preview" | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileTypeRef = useRef<"banner" | "preview">("banner");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPendingCropFiles((prev) => [...prev, ...files]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Queue crop files
  useEffect(() => {
    if (!pendingCropFile && pendingCropFiles.length > 0) {
      setIsCropping(true);
      setPendingCropFile(pendingCropFiles[0]);
      setPendingCropFiles((prev) => prev.slice(1));
    } else if (pendingCropFiles.length === 0) {
      setIsCropping(false);
    }
  }, [pendingCropFile, pendingCropFiles]);

  const handleCropComplete = async (
    croppedBlob: Blob,
    previewUrl: string,
    originalName?: string
  ) => {
    setPendingCropFile(null);
    setProcessing(true);
    setIsProcessingImages(true);

    try {
      const croppedFile = new File(
        [croppedBlob],
        originalName || "cropped.webp",
        {
          type: "image/webp",
        }
      );

      const { mainBlob, previewBlob } =
        await CollectionImagesProcessor.process(croppedFile);

      if (!mainBlob || !previewBlob) {
        throw new Error("Image processing failed: missing blob(s)");
      }

      const newImageSet: CollectionImageSet = {
        banner: images?.banner || "",
        preview: images?.preview || "",
      };

      if (fileTypeRef.current === "banner") {
        newImageSet.banner = URL.createObjectURL(mainBlob);
      } else {
        newImageSet.preview = URL.createObjectURL(previewBlob);
      }

      onImagesChange(newImageSet);
    } catch (err: any) {
      alert(err?.message || "Error processing cropped image");
    } finally {
      setProcessing(false);
      setIsProcessingImages(false);
    }
  };

  const handleCropCancel = () => setPendingCropFile(null);

  const handleAddImageClick = (type: "banner" | "preview") => {
    fileTypeRef.current = type;
    fileInputRef.current?.click();
  };

  const removeImage = (type: "banner" | "preview") => {
    if (!images) return;
    const newImageSet: CollectionImageSet = { ...images };
    newImageSet[type] = "";
    onImagesChange(newImageSet);
  };

  return (
    <div className={`input-box flex p-2 gap-2 ${className}`}>
      <CropDialog
        open={isCropping}
        file={pendingCropFile}
        onCropComplete={(blob, url) =>
          handleCropComplete(blob, url, pendingCropFile?.name)
        }
        onCancel={handleCropCancel}
      />

      {lightboxType && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.preventDefault()}
          style={{ position: "fixed", inset: 0, zIndex: 9999 }}
        >
          <Lightbox
            open
            close={() => setLightboxType(null)}
            slides={[
              {
                src:
                  lightboxType === "banner"
                    ? images?.banner || ""
                    : images?.preview || "",
              },
            ]}
            index={0}
            plugins={[Zoom]}
            styles={{ container: { backgroundColor: "rgba(0,0,0,0.5)" } }}
            controller={{ closeOnBackdropClick: true }}
            portal={{ root: document.body }}
          />
        </div>
      )}

      {/* Banner image */}
      <div className="flex-1 relative rounded-lg overflow-hidden">
        {images?.banner ? (
          <>
            <img
              src={images.banner}
              alt="Banner"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightboxType("banner")}
            />
            <button
              type="button"
              className="btn-circle-x absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full cursor-pointer z-10 bg-black/50 text-white"
              onClick={(e) => {
                e.stopPropagation();
                removeImage("banner");
              }}
            >
              X
            </button>
          </>
        ) : (
          <div
            className="w-full h-full flex items-center 
            justify-center border-2 border-dashed border-gray-300 
            rounded-lg text-gray-500 cursor-pointer hover:bg-gray-100"
            onClick={() => handleAddImageClick("banner")}
          >
            + Add Banner
          </div>
        )}
      </div>

      {/* Preview image (square) */}
      <div className="h-full aspect-square relative rounded-lg overflow-hidden">
        {images?.preview ? (
          <>
            <img
              src={images.preview}
              alt="Preview"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightboxType("preview")}
            />
            <XButton
              className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center z-10"
              onClick={(e) => {
                e.stopPropagation();
                removeImage("preview");
              }}
            />
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500 cursor-pointer hover:bg-gray-100"
            onClick={() => handleAddImageClick("preview")}
          >
            + Add Preview
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </div>
  );
};

export default ProductImagesEditor;
