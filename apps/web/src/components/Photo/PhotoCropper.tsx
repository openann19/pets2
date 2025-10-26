'use client';
import React, { useState, useCallback, useRef } from 'react';
import { logger } from '@pawfectmatch/core';
;
import Cropper, { Area } from 'react-easy-crop';
import { XMarkIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
export const PhotoCropper = ({ image, onCropComplete, onCancel, aspectRatio = 1, cropShape = 'rect', }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const onCropChange = useCallback((location) => {
        setCrop(location);
    }, []);
    const onZoomChange = useCallback((newZoom) => {
        setZoom(newZoom);
    }, []);
    const onCropAreaChange = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);
    const handleRotate = useCallback(() => {
        setRotation((prev) => (prev + 90) % 360);
    }, []);
    const createImage = (url) => new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => { resolve(image); });
        image.addEventListener('error', (error) => { reject(error); });
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
    const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('No 2d context');
        }
        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
        canvas.width = safeArea;
        canvas.height = safeArea;
        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);
        ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);
        const data = ctx.getImageData(0, 0, safeArea, safeArea);
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        ctx.putImageData(data, Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x), Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y));
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                }
            }, 'image/jpeg', 0.95);
        });
    };
    const handleSave = async () => {
        if (!croppedAreaPixels)
            return;
        setIsProcessing(true);
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
            onCropComplete(croppedImage);
        }
        catch (error) {
            logger.error('Error cropping image:', { error });
        }
        finally {
            setIsProcessing(false);
        }
    };
    return (<div className="fixed inset-0 z-50 bg-black">
      {/* Cropper Area */}
      <div className="absolute inset-0">
        <Cropper image={image} crop={crop} zoom={zoom} rotation={rotation} aspect={aspectRatio} cropShape={cropShape} onCropChange={onCropChange} onZoomChange={onZoomChange} onCropComplete={onCropAreaChange} showGrid={true} objectFit="contain"/>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pb-8">
        {/* Zoom Slider */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">Zoom</label>
          <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"/>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Cancel */}
          <button onClick={onCancel} className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Cancel">
            <XMarkIcon className="w-6 h-6 text-white"/>
          </button>

          {/* Rotate */}
          <button onClick={handleRotate} className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Rotate">
            <ArrowPathIcon className="w-6 h-6 text-white"/>
          </button>

          {/* Save */}
          <button onClick={handleSave} disabled={isProcessing} className="flex items-center justify-center px-8 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Save">
            {isProcessing ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>) : (<>
                <CheckIcon className="w-5 h-5 text-white mr-2"/>
                <span className="text-white font-semibold">Save</span>
              </>)}
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>);
};
export default PhotoCropper;
//# sourceMappingURL=PhotoCropper.jsx.map