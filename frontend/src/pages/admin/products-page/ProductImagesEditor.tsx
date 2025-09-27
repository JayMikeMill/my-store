import React, { useRef, useState, useEffect } from "react";

// Lightbox
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Zoom } from "yet-another-react-lightbox/plugins";

//  Types
import type { ProductImageSet } from "@shared/types/Product";

// Components
import CropDialog from "@components/dialogs/CropDialog";

// Image processing
import ProductImagesProcessor from "./ProductImagesProcessor";

interface ImageListEditorProps {
  className?: string;
  images: ProductImageSet[];
  onImagesChange: (images: ProductImageSet[]) => void;
  setIsProcessingImages: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductImagesEditor: React.FC<ImageListEditorProps> = ({
  className,
  images,
  onImagesChange,
  setIsProcessingImages,
}) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [pendingCropFiles, setPendingCropFiles] = useState<File[]>([]);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const [processingIndexes, setProcessingIndexes] = useState<number[]>([]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      setPendingCropFile(pendingCropFiles[0]);
      setPendingCropFiles((prev) => prev.slice(1));
    }
  }, [pendingCropFile, pendingCropFiles]);

  const handleCropComplete = async (
    croppedBlob: Blob,
    previewUrl: string,
    originalName?: string
  ) => {
    const index = images.length;

    // Add placeholder preview immediately
    const newImage: ProductImageSet = {
      main: previewUrl,
      preview: previewUrl,
      thumbnail: previewUrl,
    };
    onImagesChange([...images, newImage]);
    setProcessingIndexes((prev) => [...prev, index]);
    setPendingCropFile(null);
    setIsProcessingImages(true);

    try {
      const croppedFile = new File(
        [croppedBlob],
        originalName || "cropped.webp",
        {
          type: "image/webp",
        }
      );

      const { mainBlob, previewBlob, thumbBlob } =
        await ProductImagesProcessor.process(croppedFile);

      // Replace placeholder with fully processed image
      const fullyProcessed: ProductImageSet = {
        main: URL.createObjectURL(mainBlob),
        preview: URL.createObjectURL(previewBlob),
        thumbnail: URL.createObjectURL(thumbBlob),
      };

      const updatedImages = [...images];
      updatedImages[index] = fullyProcessed;
      onImagesChange(updatedImages);
    } catch (err: any) {
      alert(err?.message || "Error processing cropped image");
      onImagesChange(images.filter((_, i) => i !== index));
    } finally {
      setProcessingIndexes((prev) => prev.filter((i) => i !== index));
      setIsProcessingImages(false);
    }
  };

  const handleCropCancel = () => setPendingCropFile(null);

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
    setProcessingIndexes((prev) => prev.filter((i) => i !== index));
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      setIsDragging(false);
      return;
    }

    const newImages = [...images];
    const dragged = newImages.splice(dragItem.current!, 1)[0];
    newImages.splice(dragOverItem.current!, 0, dragged);
    onImagesChange(newImages);

    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(false);
  };

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`input-box flex gap-2 p-2 overflow-x-auto h-[120px] 
      flex-nowrap items-center sm:grid sm:grid-cols-2 sm:auto-rows-min 
      sm:h-full sm:overflow-y-auto ${className}`}
    >
      {pendingCropFile && (
        <CropDialog
          file={pendingCropFile}
          onCropComplete={(blob, url) =>
            handleCropComplete(blob, url, pendingCropFile?.name)
          }
          onCancel={handleCropCancel}
        />
      )}

      {lightboxIndex !== null && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.preventDefault()} // stops pointer-based form triggers
          style={{ position: "fixed", inset: 0, zIndex: 9999 }}
        >
          <Lightbox
            open
            close={() => setLightboxIndex(null)}
            slides={images.map((img) => ({ src: img.main }))}
            index={lightboxIndex ?? 0}
            plugins={[Zoom]}
            styles={{ container: { backgroundColor: "rgba(0,0,0,0.5)" } }}
            controller={{ closeOnBackdropClick: true }}
            portal={{ root: document.body }}
          />
        </div>
      )}

      {images.map((img, index) => (
        <div
          key={img.preview + index}
          data-index={index}
          className={[
            "relative rounded-lg overflow-hidden flex-shrink-0 cursor-grab select-none",
            isDragging && dragItem.current === index ? "cursor-grabbing" : "",
            "w-[100px] h-[100px] md:w-full md:h-[100px]",
          ].join(" ")}
          draggable
          onDragStart={() => {
            dragItem.current = index;
            setIsDragging(true);
          }}
          onDragEnter={() => {
            if (isDragging) dragOverItem.current = index;
          }}
          onDragEnd={handleSort}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => setLightboxIndex(index)}
        >
          {index === 0 && (
            <span className="absolute top-1 left-1 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none">
              Main
            </span>
          )}
          <img
            src={img.preview || img.main}
            alt="Product preview"
            className="w-full h-full object-cover block pointer-events-none"
          />

          <button
            type="button"
            className="btn-circle-x absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full cursor-pointer z-10 bg-black/50 text-white p-0 text-md font-mono"
            onClick={(e) => {
              e.stopPropagation();
              removeImage(index);
            }}
          >
            X
          </button>

          {processingIndexes.includes(index) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      ))}

      <div
        className="w-[100px] h-[100px] md:w-full md:h-[100px] flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-100 transition"
        onClick={handleAddImageClick}
      >
        <span className="text-center text-sm font-medium">
          + Add <br /> Image
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          multiple
        />
      </div>
    </div>
  );
};

export default ProductImagesEditor;
