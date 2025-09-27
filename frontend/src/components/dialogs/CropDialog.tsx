import { AnimatedDialog } from "@components/controls/AnimatedDialog";
import React, { useState } from "react";
import Cropper from "react-easy-crop";

interface CropDialogProps {
  open: boolean;
  file: File | null;
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void;
  onCancel: () => void;
  ratio?: number; // default 1 (square)
}

const CropDialog: React.FC<CropDialogProps> = ({
  open,
  file,
  onCropComplete,
  onCancel,
  ratio = 1,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  React.useEffect(() => {
    if (!file) {
      setImageUrl("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  const onCropCompleteInternal = (_: any, croppedPixels: any) =>
    setCroppedAreaPixels(croppedPixels);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", reject);
      img.crossOrigin = "anonymous";
      img.src = url;
    });

  const getCroppedImg = async (imageSrc: string, cropPixels: any) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const size = Math.max(cropPixels.width, cropPixels.height);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      size,
      size
    );
    return new Promise<{ blob: Blob; url: string }>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Canvas is empty");
        resolve({ blob, url: URL.createObjectURL(blob) });
      }, "image/webp");
    });
  };

  const handleCrop = async () => {
    if (!imageUrl || !croppedAreaPixels) return;
    const { blob, url } = await getCroppedImg(imageUrl, croppedAreaPixels);
    onCropComplete(blob, url); // close dialog immediately
  };

  return (
    <AnimatedDialog
      title="Crop Image"
      open={open}
      onClose={onCancel}
      className="dialog-box p-md flex flex-col w-[360px] sm:w-[400px] max-h-[90vh] overflow-hidden"
    >
      <div className="dialog-box p-md flex flex-col w-[360px] sm:w-[400px] max-h-[90vh] overflow-hidden">
        <div className="relative w-full h-80 mb-sm border-2 border-border rounded-md overflow-hidden bg-background">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteInternal}
              cropShape="rect"
              showGrid={true}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  position: "relative",
                },
                cropAreaStyle: {
                  border: "2px solid white",
                  borderRadius: "0.5rem",
                },
              }}
            />
          )}
        </div>

        <div className="flex justify-center gap-md">
          <button
            type="button"
            className="btn-cancel w-full"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary w-full"
            onClick={handleCrop}
          >
            Crop Image
          </button>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default CropDialog;
