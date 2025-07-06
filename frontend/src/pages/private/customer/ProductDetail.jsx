import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productAPI, addonsAPI, cartAPI } from '../../../services/api';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { Heart, Share2 } from 'lucide-react';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await productAPI.getById(id);
            return res.data || res;
        }
    });
    // Placeholder favorite state
    const [favorite, setFavorite] = useState(false);
    // Placeholder for image gallery
    const images = product?.images && product.images.length > 0
        ? product.images
        : [product?.image || product?.imageUrl || '/placeholder.png'];
    const [selectedImage, setSelectedImage] = useState(images[0]);
    useEffect(() => {
        if (images[0]) setSelectedImage(images[0]);
    }, [product]);
    // Placeholder for variants
    const variants = product?.variants || [];
    const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
    // Quantity
    const [quantity, setQuantity] = useState(1);
    const maxQty = product?.stock || 99;

    // Size selection
    const sizes = Array.isArray(product?.sizes) && product.sizes.length > 0
        ? product.sizes
        : (Array.isArray(product?.size) ? product.size : product?.size ? [product.size] : []);
    const [selectedSize, setSelectedSize] = useState(null);

    // Set default selected size to 'small' if exists, else first size
    useEffect(() => {
        if (sizes && sizes.length > 0) {
            const small = sizes.find(s => (s.label || s).toString().toLowerCase() === 'small');
            setSelectedSize(small ? (small.label || small) : (sizes[0].label || sizes[0]));
        }
    }, [product]);

    // Customization: fetch add-ons if customizable
    const isCustomizable = product?.isCustomizable;
    const addonIds = product?.addOns || [];
    const { data: addons, isLoading: loadingAddons } = useQuery({
        queryKey: ['addons', addonIds],
        enabled: isCustomizable && addonIds.length > 0,
        queryFn: async () => {
            // Use correct API
            const res = await addonsAPI.getMany(addonIds);
            return res.data || res || [];
        }
    });
    const [selectedAddons, setSelectedAddons] = React.useState([]);
    const handleAddonToggle = (id) => {
        setSelectedAddons((prev) =>
            prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
        );
    };

    const { user } = useAuth();

    // Add to Cart handler
    const [addCartLoading, setAddCartLoading] = React.useState(false);
    const handleAddToCart = async () => {
        if (!user) {
            toast.error('You must be logged in to add to cart.');
            return;
        }
        setAddCartLoading(true);
        try {
            await cartAPI.addToCart({
                user: user._id,
                product: product._id,
                size: selectedSize,
                quantity,
                addOns: selectedAddons
            });
            toast.success('Added to cart!');
            setAddCartLoading(false);
            // Reset all form states
            setQuantity(1);
            // Reset selected size to default (small or first)
            if (sizes && sizes.length > 0) {
                const small = sizes.find(s => (s.label || s).toString().toLowerCase() === 'small');
                setSelectedSize(small ? (small.label || small) : (sizes[0].label || sizes[0]));
            } else {
                setSelectedSize(null);
            }
            // Reset selected variant to first or null
            setSelectedVariant(variants[0] || null);
            // Reset selected add-ons
            setSelectedAddons([]);
            // Reset selected image to first
            if (images[0]) setSelectedImage(images[0]);
        } catch (err) {
            toast.error('Failed to add to cart.');
            setAddCartLoading(false);
        }
    };

    if (isLoading) {
        return (
            <CustomerLayout>
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#232323]">
                    <Skeleton className="w-80 h-80 mb-6 bg-[#333] rounded-2xl border border-[#333]" />
                    <Skeleton className="h-8 w-48 mb-2 bg-[#333] rounded-lg" />
                    <Skeleton className="h-6 w-32 mb-4 bg-[#333] rounded-lg" />
                    <Skeleton className="h-12 w-64 mb-4 bg-[#333] rounded-lg" />
                </div>
            </CustomerLayout>
        );
    }
    if (error || !product) {
        return <CustomerLayout><div className="text-center text-red-500 py-8">Product not found.</div></CustomerLayout>;
    }
    return (
        <CustomerLayout>
            <div className="min-h-screen bg-[#232323] flex flex-col items-center py-10 px-2">
                {/* Product Card (not sticky, single column) */}
                <div className="bg-white rounded-2xl shadow max-w-2xl w-full flex flex-col p-10 gap-8 border border-gray-200 mb-10">
                    {/* Image Gallery */}
                    <div className="flex flex-col items-center justify-center">
                        <img
                            src={selectedImage}
                            alt={product.productName}
                            className="w-full max-w-xs h-64 md:w-96 md:h-96 object-contain rounded-xl mb-6 border-2 border-gray-200 shadow bg-white"
                        />
                    </div>
                    {/* Product Info */}
                    <div className="flex flex-col gap-6">
                        {/* Top: Name, Favorite, Share */}
                        <div className="flex items-start justify-between gap-2">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#232323] mb-2 flex-1">{product.productName}</h2>
                            <div className="flex gap-3 items-center">
                                {/* Favorite Button */}
                                <button
                                    onClick={() => setFavorite(f => !f)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all shadow ${favorite ? 'bg-[#FFC107] border-[#FFC107]' : 'bg-white border-gray-200'} hover:scale-105`}
                                    aria-label="Add to favorites"
                                >
                                    <Heart className={favorite ? 'text-white' : 'text-[#FFC107]'} fill={favorite ? '#FFC107' : 'none'} size={24} />
                                </button>
                                {/* Share Button */}
                                <button
                                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-all shadow"
                                    aria-label="Share"
                                >
                                    <Share2 className="text-[#FFC107]" size={22} />
                                </button>
                            </div>
                        </div>
                        {/* Price, Ratings, Sold, Availability */}
                        <div className="flex items-center gap-4 mb-2 flex-wrap">
                            <div className="text-3xl font-bold text-[#FFC107]">
                                {Array.isArray(product.sizes) && product.sizes.length > 0 && selectedSize ? (
                                    (() => {
                                        const found = product.sizes.find(s => s.label === selectedSize);
                                        return found ? `₱ ${Number(found.price).toLocaleString()}` : `₱ ${product.price?.toLocaleString()}`;
                                    })()
                                ) : (
                                    <>₱ {product.price?.toLocaleString()}</>
                                )}
                            </div>
                            <div className="text-gray-400 text-lg">4.9 ★ | 10+ sold</div>
                            {product.isAvailable ? (
                                <span className="ml-2 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-bold">Available</span>
                            ) : (
                                <span className="ml-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">Not Available</span>
                            )}
                        </div>
                        {/* Variants */}
                        {variants.length > 0 && (
                            <div className="mb-2">
                                <div className="font-semibold text-[#232323] mb-1">Variants:</div>
                                <div className="flex gap-2 flex-wrap">
                                    {variants.map((v, i) => (
                                        <Button
                                            key={i}
                                            variant={selectedVariant === v ? 'yellow' : 'yellow-outline'}
                                            onClick={() => setSelectedVariant(v)}
                                            className="min-w-[80px]"
                                        >
                                            {v}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Size Selector */}
                        {Array.isArray(product?.sizes) && product.sizes.length > 0 && (
                            <div className="mb-2">
                                <div className="font-semibold text-[#232323] mb-1">Size:</div>
                                <div className="flex gap-2 flex-wrap">
                                    {product.sizes.map((size, i) => (
                                        <Button
                                            key={i}
                                            variant={selectedSize === size.label ? 'yellow' : 'yellow-outline'}
                                            onClick={() => setSelectedSize(size.label)}
                                            className="min-w-[60px]"
                                        >
                                            {size.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="font-semibold text-[#232323]">Quantity:</div>
                            <div className="flex items-center gap-1">
                                <Button variant="yellow-outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                                <span className="px-3 text-lg font-bold text-[#232323]">{quantity}</span>
                                <Button variant="yellow-outline" size="icon" onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}>+</Button>
                            </div>
                        </div>
                        {/* Customization Section */}
                        {isCustomizable && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-2 border border-gray-200">
                                <div className="font-bold text-[#232323] mb-3 text-lg">Customize your order</div>
                                {loadingAddons ? (
                                    <Skeleton className="h-8 w-32 bg-[#333] rounded-lg" />
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {addons && addons.length > 0 ? addons.map(addon => (
                                            <label key={addon._id} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAddons.includes(addon._id)}
                                                    onChange={() => handleAddonToggle(addon._id)}
                                                    className="accent-[#FFC107] w-5 h-5"
                                                />
                                                {addon.image && <img src={addon.image} alt={addon.name} className="w-10 h-10 object-cover rounded border border-gray-200 bg-white" />}
                                                <span className="text-[#232323] font-medium">{addon.name}</span>
                                                <span className="text-[#FFC107] font-bold ml-2">+₱{addon.price?.toLocaleString()}</span>
                                            </label>
                                        )) : <span className="text-gray-400">No add-ons available.</span>}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 mt-2">
                            <Button
                                variant="yellow-outline"
                                className="flex-1 w-full"
                                onClick={handleAddToCart}
                                disabled={addCartLoading}
                                loading={addCartLoading}
                            >
                                {addCartLoading ? 'Adding...' : 'Add to Cart'}
                            </Button>
                            <Button variant="yellow" className="flex-1 w-full">Buy Now</Button>
                        </div>
                    </div>
                </div>
                {/* Product Description (bottom, full width) */}
                <div className="max-w-2xl w-full mb-10">
                    <h3 className="text-xl font-extrabold mb-3 text-[#FFC107]">Product Description</h3>
                    <div className="bg-white rounded-xl p-6 text-gray-700 text-base shadow-sm border border-gray-200">
                        {product.description || 'No description available.'}
                        {product.ingredients && product.ingredients.length > 0 && (
                            <div className="mt-6">
                                <div className="font-bold text-[#232323] mb-2">Ingredients:</div>
                                <ul className="list-disc list-inside text-gray-700">
                                    {product.ingredients.map((ing, i) => (
                                        <li key={i}>{ing.productName} <span className="text-[#232323] font-bold">x{ing.quantity}</span></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                {/* Reviews Section (bottom, full width) */}
                <div className="max-w-2xl w-full">
                    <h3 className="text-xl font-extrabold mb-3 text-[#FFC107]">Reviews</h3>
                    <div className="bg-white rounded-xl p-6 text-gray-400 text-base shadow-sm border border-gray-200">No reviews yet.</div>
                </div>
            </div>
        </CustomerLayout>
    );
}
