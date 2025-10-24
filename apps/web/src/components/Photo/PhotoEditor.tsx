'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XMarkIcon, CheckIcon, SparklesIcon, AdjustmentsHorizontalIcon, } from '@heroicons/react/24/outline';
export const PhotoEditor = ({ image, onSave, onCancel }) => {
    const canvasRef = useRef(null);
    const [adjustments, setAdjustments] = useState({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        sharpen: 0,
        warmth: 0,
    });
    const [activeTab, setActiveTab] = useState('adjust');
    const [isProcessing, setIsProcessing] = useState(false);
    const [originalImage, setOriginalImage] = useState(null);
    const adjustmentsRef = useRef(adjustments);
    const applySharpen = useCallback((imageData, amount) => {
        const { data, width, height } = imageData;
        const output = new ImageData(width, height);
        output.data.set(data);
        const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            const kernelIdx = (ky + 1) * 3 + (kx + 1);
                            const src = data[idx] ?? 0;
                            const kv = kernel[kernelIdx] ?? 0;
                            sum += src * kv;
                        }
                    }
                    const outIdx = (y * width + x) * 4 + c;
                    output.data[outIdx] = Math.max(0, Math.min(255, sum));
                }
                const alphaIdx = (y * width + x) * 4 + 3;
                const alpha = data[alphaIdx] ?? 255;
                output.data[alphaIdx] = alpha;
            }
        }
        return output;
    }, []);
    const drawImage = useCallback((img, adj) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = `
        brightness(${adj.brightness}%)
        contrast(${adj.contrast}%)
        saturate(${adj.saturation}%)
        blur(${adj.blur}px)
      `;
        ctx.drawImage(img, 0, 0);
        if (adj.warmth !== 0) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const warmthFactor = adj.warmth / 100;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i] ?? 0;
                const g = data[i + 1] ?? 0;
                data[i] = Math.max(0, Math.min(255, r + warmthFactor * 30));
                data[i + 1] = Math.max(0, Math.min(255, g + warmthFactor * 15));
            }
            ctx.putImageData(imageData, 0, 0);
        }
        if (adj.sharpen > 0) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const sharpened = applySharpen(imageData, adj.sharpen / 100);
            ctx.putImageData(sharpened, 0, 0);
        }
    }, [applySharpen]);
    useEffect(() => {
        adjustmentsRef.current = adjustments;
    }, [adjustments]);
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setOriginalImage(img);
            drawImage(img, adjustmentsRef.current);
        };
        img.src = image;
    }, [image, drawImage]);
    useEffect(() => {
        if (originalImage) {
            drawImage(originalImage, adjustments);
        }
    }, [originalImage, adjustments, drawImage]);
    const applyFilter = useCallback((filterName) => {
        const filters = {
            vivid: { saturation: 130, contrast: 110, brightness: 105 },
            warm: { warmth: 30, brightness: 105, saturation: 110 },
            cool: { warmth: -20, saturation: 90, brightness: 100 },
            bw: { saturation: 0, contrast: 120 },
            vintage: { saturation: 80, warmth: 20, contrast: 90, brightness: 95 },
            dramatic: { contrast: 140, saturation: 120, brightness: 90 },
        };
        const filterAdjustments = filters[filterName];
        if (filterAdjustments) {
            setAdjustments((prev) => ({ ...prev, ...filterAdjustments }));
        }
    }, []);
    const resetAdjustments = useCallback(() => {
        setAdjustments({
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            sharpen: 0,
            warmth: 0,
        });
    }, []);
    const handleSave = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        setIsProcessing(true);
        canvas.toBlob((blob) => {
            if (blob) {
                onSave(blob);
            }
            setIsProcessing(false);
        }, 'image/jpeg', 0.95);
    }, [onSave]);
    return (<div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <button onClick={onCancel} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors" aria-label="Cancel">
          <XMarkIcon className="w-6 h-6 text-white"/>
        </button>

        <h2 className="text-white font-semibold text-lg">Edit Photo</h2>

        <button onClick={handleSave} disabled={isProcessing} className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 transition-colors disabled:opacity-50" aria-label="Save">
          {isProcessing ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>) : (<CheckIcon className="w-5 h-5 text-white"/>)}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain"/>
      </div>

      <div className="bg-black/90 backdrop-blur-sm">
        <div className="flex border-b border-white/10">
          <button onClick={() => setActiveTab('adjust')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'adjust' ? 'text-white border-b-2 border-pink-500' : 'text-white/60'}`}>
            <AdjustmentsHorizontalIcon className="w-5 h-5 mx-auto mb-1"/>
            Adjust
          </button>
          <button onClick={() => setActiveTab('filters')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'filters' ? 'text-white border-b-2 border-pink-500' : 'text-white/60'}`}>
            <SparklesIcon className="w-5 h-5 mx-auto mb-1"/>
            Filters
          </button>
        </div>

        <div className="p-4 max-h-64 overflow-y-auto">
          {activeTab === 'adjust' ? (<div className="space-y-4">
              <AdjustmentSlider label="Brightness" value={`${adjustments.brightness}%`} min={50} max={150} currentValue={adjustments.brightness} onChange={(value) => setAdjustments((prev) => ({ ...prev, brightness: value }))}/>
              <AdjustmentSlider label="Contrast" value={`${adjustments.contrast}%`} min={50} max={150} currentValue={adjustments.contrast} onChange={(value) => setAdjustments((prev) => ({ ...prev, contrast: value }))}/>
              <AdjustmentSlider label="Saturation" value={`${adjustments.saturation}%`} min={0} max={200} currentValue={adjustments.saturation} onChange={(value) => setAdjustments((prev) => ({ ...prev, saturation: value }))}/>
              <AdjustmentSlider label="Warmth" value={`${adjustments.warmth}`} min={-50} max={50} currentValue={adjustments.warmth} onChange={(value) => setAdjustments((prev) => ({ ...prev, warmth: value }))}/>
              <AdjustmentSlider label="Sharpen" value={`${adjustments.sharpen}`} min={0} max={100} currentValue={adjustments.sharpen} onChange={(value) => setAdjustments((prev) => ({ ...prev, sharpen: value }))}/>

              <button onClick={resetAdjustments} className="w-full py-2 text-white/60 hover:text-white text-sm transition-colors">
                Reset All
              </button>
            </div>) : (<div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Vivid', key: 'vivid' },
                { name: 'Warm', key: 'warm' },
                { name: 'Cool', key: 'cool' },
                { name: 'B&W', key: 'bw' },
                { name: 'Vintage', key: 'vintage' },
                { name: 'Dramatic', key: 'dramatic' },
            ].map((filter) => (<button key={filter.key} onClick={() => applyFilter(filter.key)} className="aspect-square rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-sm font-medium">
                  {filter.name}
                </button>))}
            </div>)}
        </div>
      </div>
    </div>);
};
const AdjustmentSlider = ({ label, value, min, max, currentValue, onChange }) => (<div>
    <div className="flex justify-between mb-2">
      <label className="text-white text-sm">{label}</label>
      <span className="text-white/60 text-sm">{value}</span>
    </div>
    <input type="range" min={min} max={max} value={currentValue} onChange={(event) => onChange(Number(event.target.value))} className="w-full"/>
  </div>);
export default PhotoEditor;
//# sourceMappingURL=PhotoEditor.jsx.map