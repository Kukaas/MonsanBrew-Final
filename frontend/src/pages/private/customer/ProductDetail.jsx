import React from 'react';
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
    const [favorite, setFavorite] = React.useState(false);
    // Placeholder for image gallery
    const images = product?.images && product.images.length > 0
        ? product.images
        : [product?.image || product?.imageUrl || '/placeholder.png'];
    const [selectedImage, setSelectedImage] = React.useState(images[0]);
    React.useEffect(() => {
        if (images[0]) setSelectedImage(images[0]);
    }, [product]);
    // Placeholder for variants
    const variants = product?.variants || [];
    const [selectedVariant, setSelectedVariant] = React.useState(variants[0] || null);
    // Quantity
    const [quantity, setQuantity] = React.useState(1);
    const maxQty = product?.stock || 99;

    // Size selection
    const sizes = Array.isArray(product?.sizes) && product.sizes.length > 0
        ? product.sizes
        : (Array.isArray(product?.size) ? product.size : product?.size ? [product.size] : []);
    const [selectedSize, setSelectedSize] = React.useState(sizes[0]?.label || sizes[0] || null);

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
        } catch (err) {
            toast.error('Failed to add to cart.');
            setAddCartLoading(false);
        }
    };

    if (isLoading) {
        return (
            <CustomerLayout>
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#232323]">
                    <Skeleton className="w-80 h-80 mb-6 bg-[#333]" />
                    <Skeleton className="h-8 w-48 mb-2 bg-[#333]" />
                    <Skeleton className="h-6 w-32 mb-4 bg-[#333]" />
                    <Skeleton className="h-12 w-64 mb-4 bg-[#333]" />
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
                <div className="bg-[#232323] rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col p-10 gap-8 border border-[#333] mb-10">
                    {/* Image Gallery */}
                    <div className="flex flex-col items-center justify-center">
                        <img
                            src={selectedImage}
                            alt={product.productName}
                            className="w-full max-w-xs h-64 md:w-96 md:h-96 object-contain rounded-xl mb-6 border-2 border-[#333] shadow-lg bg-[#232323]"
                        />
                    </div>
                    {/* Product Info */}
                    <div className="flex flex-col gap-6">
                        {/* Top: Name, Favorite, Share */}
                        <div className="flex items-start justify-between gap-2">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 flex-1">{product.productName}</h2>
                            <div className="flex gap-3 items-center">
                                {/* Favorite Button */}
                                <button
                                    onClick={() => setFavorite(f => !f)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all shadow ${favorite ? 'bg-[#FFC107] border-[#FFC107]' : 'bg-[#232323] border-[#444]'} hover:scale-105`}
                                    aria-label="Add to favorites"
                                >
                                    <Heart className={favorite ? 'text-white' : 'text-[#FFC107]'} fill={favorite ? '#FFC107' : 'none'} size={24} />
                                </button>
                                {/* Share Button */}
                                <button
                                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] bg-[#fff] hover:bg-[#f5f5f5] transition-all shadow"
                                    aria-label="Share"
                                >
                                    <Share2 className="text-[#232323]" size={22} />
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
                            <div className="text-[#BDBDBD] text-lg">4.9 ★ | 10+ sold</div>
                            {product.isAvailable ? (
                                <span className="ml-2 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-bold">Available</span>
                            ) : (
                                <span className="ml-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">Not Available</span>
                            )}
                        </div>
                        {/* Variants */}
                        {variants.length > 0 && (
                            <div className="mb-2">
                                <div className="font-semibold text-white mb-1">Variants:</div>
                                <div className="flex gap-2 flex-wrap">
                                    {variants.map((v, i) => (
                                        <Button
                                            key={i}
                                            variant={selectedVariant === v ? 'yellow' : 'outline'}
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
                                <div className="font-semibold text-white mb-1">Size:</div>
                                <div className="flex gap-2 flex-wrap">
                                    {product.sizes.map((size, i) => (
                                        <Button
                                            key={i}
                                            variant={selectedSize === size.label ? 'yellow' : 'yellow-outline'}
                                            onClick={() => setSelectedSize(size.label)}
                                            className="min-w-[60px] text-white"
                                        >
                                            {size.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="font-semibold text-white">Quantity:</div>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                                <span className="px-3 text-lg font-bold text-white">{quantity}</span>
                                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}>+</Button>
                            </div>
                        </div>
                        {/* Customization Section */}
                        {isCustomizable && (
                            <div className="bg-[#181818] rounded-xl p-4 mb-2 border border-[#333]">
                                <div className="font-bold text-white mb-3 text-lg">Customize your order</div>
                                {loadingAddons ? (
                                    <Skeleton className="h-8 w-32 bg-[#333]" />
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
                                                {addon.image && <img src={addon.image} alt={addon.name} className="w-10 h-10 object-cover rounded border border-[#444] bg-[#232323]" />}
                                                <span className="text-white font-medium">{addon.name}</span>
                                                <span className="text-white font-bold ml-2">+₱{addon.price?.toLocaleString()}</span>
                                            </label>
                                        )) : <span className="text-[#BDBDBD]">No add-ons available.</span>}
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
                    <h3 className="text-xl font-extrabold mb-3 text-white">Product Description</h3>
                    <div className="bg-[#232323] rounded-xl p-6 text-[#E0E0E0] text-base shadow-sm border border-[#333]">
                        {product.description || 'No description available.'}
                        {product.ingredients && product.ingredients.length > 0 && (
                            <div className="mt-6">
                                <div className="font-bold text-white mb-2">Ingredients:</div>
                                <ul className="list-disc list-inside text-[#E0E0E0]">
                                    {product.ingredients.map((ing, i) => (
                                        <li key={i}>{ing.productName} <span className="text-white font-bold">x{ing.quantity}</span></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                {/* Reviews Section (bottom, full width) */}
                <div className="max-w-2xl w-full">
                    <h3 className="text-xl font-extrabold mb-3 text-white">Reviews</h3>
                    <div className="bg-[#232323] rounded-xl p-6 text-[#BDBDBD] text-base shadow-sm border border-[#333]">No reviews yet.</div>
                </div>
            </div>
        </CustomerLayout>
    );
}
