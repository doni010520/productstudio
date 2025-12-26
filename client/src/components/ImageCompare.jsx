import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

const ImageCompare = ({ originalImage, generatedImage, onDownload }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [viewMode, setViewMode] = useState('slider'); // 'slider' or 'sidebyside'
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    const handleTouchStart = () => setIsDragging(true);
    const handleTouchEnd = () => setIsDragging(false);
    
    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    return (
        <div className="space-y-4">
            {/* Toggle View Mode */}
            <div className="flex gap-2 justify-center">
                <button
                    onClick={() => setViewMode('slider')}
                    className={`px-6 py-2 rounded-lg transition-all font-medium ${
                        viewMode === 'slider' 
                            ? 'bg-primary-500 text-white' 
                            : 'glass text-gray-300'
                    }`}
                >
                    ⟷ Slider
                </button>
                <button
                    onClick={() => setViewMode('sidebyside')}
                    className={`px-6 py-2 rounded-lg transition-all font-medium ${
                        viewMode === 'sidebyside' 
                            ? 'bg-primary-500 text-white' 
                            : 'glass text-gray-300'
                    }`}
                >
                    ‖ Comparar
                </button>
            </div>

            {viewMode === 'slider' ? (
                /* Slider Mode */
                <div
                    className="relative aspect-video rounded-xl overflow-hidden cursor-ew-resize select-none"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                >
                    {/* Original Image (Background) */}
                    <img
                        src={originalImage}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                    />
                    
                    {/* Generated Image (Clipped) */}
                    <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <img
                            src={generatedImage}
                            alt="Melhorada"
                            className="absolute inset-0 w-full h-full object-cover"
                            draggable={false}
                        />
                    </div>

                    {/* Slider Handle */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-glow-blue pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-800">
                                <path d="M7 10L3 10M17 10L13 10M10 3L10 7M10 17L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M7 6L3 10L7 14M13 6L17 10L13 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-lg text-xs font-medium">
                        Original
                    </div>
                    <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-lg text-xs font-medium">
                        Melhorada
                    </div>
                </div>
            ) : (
                /* Side by Side Mode */
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-300 text-center">Original</div>
                        <div className="glass p-2 rounded-xl">
                            <img
                                src={originalImage}
                                alt="Original"
                                className="w-full rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-300 text-center">Melhorada</div>
                        <div className="glass p-2 rounded-xl">
                            <img
                                src={generatedImage}
                                alt="Melhorada"
                                className="w-full rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Download Button */}
            <motion.button
                onClick={onDownload}
                className="btn-primary w-full flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Download className="w-5 h-5 mr-2" />
                Baixar Imagem
            </motion.button>
        </div>
    );
};

export default ImageCompare;
