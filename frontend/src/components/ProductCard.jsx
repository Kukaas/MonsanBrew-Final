import React from 'react';
import { Button } from './ui/button';

export default function ProductCard({ product }) {
    // Determine image source (base64 or url)
    let imageSrc = '/placeholder.png';
    if (product.image) {
        imageSrc = product.image.startsWith('data:image')
            ? product.image
            : `data:image/jpeg;base64,${product.image}`;
    } else if (product.imageUrl) {
        imageSrc = product.imageUrl;
    }

    return (
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col w-full h-full">
            <div className="flex justify-center mb-3">
                <img
                    src={imageSrc}
                    alt={product.productName}
                    className="w-30 h-30 object-cover bg-white"
                />
            </div>
            <div className="font-bold text-base text-[#232323] text-left mb-1">{product.productName}</div>
            <div className="text-[#232323] text-sm text-left mb-2">₱ {product.price?.toLocaleString()}</div>
            <div className="border-t border-[#E0E0E0] my-2" />
            <Button variant="yellow" className="w-full mt-2">Buy</Button>
        </div>
    );
}
