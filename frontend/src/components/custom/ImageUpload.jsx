import React, { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Image compression utility
const compressImage = (file, maxSizeMB = 5, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions while maintaining aspect ratio
            let { width, height } = img;
            const maxDimension = 1920; // Max width/height
            
            if (width > height && width > maxDimension) {
                height = (height * maxDimension) / width;
                width = maxDimension;
            } else if (height > maxDimension) {
                width = (width * maxDimension) / height;
                height = maxDimension;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob with compression
            canvas.toBlob((blob) => {
                // If still too large, compress more
                if (blob.size > maxSizeMB * 1024 * 1024) {
                    canvas.toBlob((compressedBlob) => {
                        resolve(compressedBlob);
                    }, 'image/jpeg', quality * 0.5); // Further reduce quality
                } else {
                    resolve(blob);
                }
            }, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
};

export default function ImageUpload({ label = 'Image', value, onChange, disabled, error, variant = 'dark' }) {
    const inputRef = useRef();
    const cameraInputRef = useRef();
    const [showCamera, setShowCamera] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Check file size first
                if (file.size > 5 * 1024 * 1024) {
                    // Compress the image
                    const compressedBlob = await compressImage(file, 5, 0.8);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        onChange(reader.result);
                    };
                    reader.readAsDataURL(compressedBlob);
                } else {
                    // File is small enough, use as is
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        onChange(reader.result);
                    };
                    reader.readAsDataURL(file);
                }
            } catch (error) {
                console.error('Error processing image:', error);
                // Fallback to original file
                const reader = new FileReader();
                reader.onloadend = () => {
                    onChange(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleCameraCapture = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Check file size first
                if (file.size > 5 * 1024 * 1024) {
                    // Compress the image
                    const compressedBlob = await compressImage(file, 5, 0.8);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        onChange(reader.result);
                        setShowCamera(false);
                    };
                    reader.readAsDataURL(compressedBlob);
                } else {
                    // File is small enough, use as is
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        onChange(reader.result);
                        setShowCamera(false);
                    };
                    reader.readAsDataURL(file);
                }
            } catch (error) {
                console.error('Error processing camera image:', error);
                // Fallback to original file
                const reader = new FileReader();
                reader.onloadend = () => {
                    onChange(reader.result);
                    setShowCamera(false);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleRemove = () => {
        onChange("");
        if (inputRef.current) inputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
    };

    // Style for dark variant
    const darkClass = "bg-[#232323] border-[#FFC107]";
    // Style for white variant
    const whiteClass = "bg-white border-[#E0E0E0]";

    return (
        <div className="flex flex-col gap-2">
            <label className={`block text-base font-bold ${variant === 'dark' ? 'text-[#FFC107]' : 'text-yellow-400'} mb-1`}>{label}</label>
            
            {!value ? (
                <div className={`border-2 border-dashed rounded-lg p-6 transition-all ${variant === 'dark' ? 'border-[#444] bg-[#2A2A2A]' : 'border-gray-300 bg-gray-50'} ${error ? 'border-red-500' : ''} ${variant === 'dark' ? 'hover:border-[#FFC107]' : 'hover:border-yellow-400'}`}>
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Camera Option */}
                        <div className="flex-1">
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleCameraCapture}
                                disabled={disabled}
                            />
                            <Button
                                type="button"
                                variant="yellow-outline"
                                className="w-full h-14 font-medium text-base"
                                onClick={() => cameraInputRef.current?.click()}
                                disabled={disabled}
                            >
                                <Camera className="w-5 h-5 mr-3" />
                                Use Camera
                            </Button>
                        </div>

                        {/* File Upload Option */}
                        <div className="flex-1">
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={disabled}
                            />
                            <Button
                                type="button"
                                variant="yellow-outline"
                                className="w-full h-14 font-medium text-base"
                                onClick={() => inputRef.current?.click()}
                                disabled={disabled}
                            >
                                <Upload className="w-5 h-5 mr-3" />
                                Choose File
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`flex items-center gap-4 border-2 rounded-lg px-6 py-4 transition-all border-[#444] bg-[#2A2A2A] ${error ? 'border-red-500' : ''}`}>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-[#BDBDBD]">
                                Image uploaded successfully
                            </span>
                        </div>
                    </div>
                    <div className="relative group">
                        <img src={value} alt="Preview" className="h-20 w-20 object-cover rounded-lg border-2 border-[#FFC107] shadow-lg" />
                        <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-[#232323] border-[#FFC107] text-[#FFC107] rounded-full p-1.5 w-8 h-8 flex items-center justify-center shadow-lg hover:bg-[#FFC107] hover:text-[#232323] transition-all duration-200"
                            onClick={handleRemove}
                            tabIndex={-1}
                            aria-label="Remove image preview"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
        </div>
    );
}
