import React, { useRef } from 'react';

export default function ImageUpload({ label = 'Image', value, onChange, disabled, error, variant = 'dark' }) {
    const inputRef = useRef();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        onChange("");
        if (inputRef.current) inputRef.current.value = "";
    };

    // Style for dark variant
    const darkClass = "bg-[#232323] border-[#FFC107]";
    // Style for white variant
    const whiteClass = "bg-white border-[#E0E0E0]";

    return (
        <div className="flex flex-col gap-2">
            <label className={`block text-base font-bold ${variant === 'dark' ? 'text-[#FFC107]' : 'text-yellow-400'} mb-1`}>{label}</label>
            <div className={`flex items-center gap-4 border-2 rounded-lg px-4 py-3 transition-all ${variant === 'dark' ? darkClass : whiteClass} ${error ? 'border-red-500' : ''}`}>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className={`block w-full text-sm ${variant === 'dark' ? 'text-[#BDBDBD] bg-transparent' : 'text-black bg-white'} border-none focus:ring-0 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold ${variant === 'dark' ? 'file:bg-[#FFC107]/10 file:text-[#FFC107]' : 'file:bg-[#FFC107]/10 file:text-[#FFC107]'} file:cursor-pointer`}
                    onChange={handleFileChange}
                    disabled={disabled}
                />
                {value && (
                    <div className="relative group">
                        <img src={value} alt="Preview" className="h-16 w-16 object-cover rounded border border-[#FFC107] shadow-md" />
                        <button
                            type="button"
                            className={`absolute -top-2 -right-2 ${variant === 'dark' ? 'bg-[#232323] border-[#FFC107] text-[#FFC107]' : 'bg-white border-[#FFC107] text-[#FFC107]'} rounded-full p-1 w-7 h-7 flex items-center justify-center shadow hover:bg-[#FFC107] hover:text-[#232323] transition`}
                            onClick={handleRemove}
                            tabIndex={-1}
                            aria-label="Remove image preview"
                        >
                            <span className="text-lg font-bold">&times;</span>
                        </button>
                    </div>
                )}
            </div>
            {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
        </div>
    );
}
