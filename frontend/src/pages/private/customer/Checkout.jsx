import { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { userAPI, orderAPI, cartAPI, addonsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import FormInput from '@/components/custom/FormInput';
import gcashLogo from '@/assets/gcash.png';
import codLogo from '@/assets/cod.png';
import ImageUpload from '@/components/custom/ImageUpload';
import { toast } from 'sonner';
import PropTypes from 'prop-types';

export default function Checkout() {
    const { state } = useLocation();
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const location = useLocation();
    const isBuyNow = new URLSearchParams(location.search).get('buyNow') === 'true';

    // Restore selectedCart from state or localStorage, or handle buy now
    let selectedCart = state?.selectedCart;
    if (!selectedCart && !isBuyNow) {
        const stored = localStorage.getItem('selectedCart');
        if (stored) {
            try {
                selectedCart = JSON.parse(stored);
            } catch {
                selectedCart = null;
            }
        }
    }

    // Handle buy now item
    const [buyNowItem, setBuyNowItem] = useState(null);
    const [buyNowAddons, setBuyNowAddons] = useState([]);

    useEffect(() => {
        if (isBuyNow) {
            const storedItem = sessionStorage.getItem('buyNowItem');
            if (storedItem) {
                try {
                    const item = JSON.parse(storedItem);
                    setBuyNowItem(item);

                    // Fetch add-ons details if there are any
                    if (item.addOns && item.addOns.length > 0) {
                        addonsAPI.getMany(item.addOns)
                            .then(res => {
                                const addonsData = res.data || res || [];
                                setBuyNowAddons(addonsData);
                            })
                            .catch(err => {
                                console.error('Failed to fetch add-ons:', err);
                            });
                    }
                } catch (err) {
                    console.error('Failed to parse buy now item:', err);
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        }
    }, [isBuyNow, navigate]);

    // All hooks must be called before any return
    const [address, setAddress] = useState(null);
    const [addressLoading, setAddressLoading] = useState(true);
    const [deliveryInstructions, setDeliveryInstructions] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('gcash');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [proofImage, setProofImage] = useState('');
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        userAPI.getAddress()
            .then(res => {
                setAddress(res.address || null);
            })
            .catch((err) => {
                console.error('API error:', err);
                setAddress(null);
            })
            .finally(() => setAddressLoading(false));
    }, []);

    useEffect(() => {
        if (!isBuyNow && (!selectedCart || !Array.isArray(selectedCart) || selectedCart.length === 0)) {
            navigate(`/cart?user=${userId}`);
        }
    }, [selectedCart, userId, navigate, isBuyNow]);

    useEffect(() => {
        if (address && typeof address.landmark === 'string') {
            setDeliveryInstructions(address.landmark);
        }
    }, [address]);

    // Early return if no valid cart data and not buy now
    if (!isBuyNow && (!selectedCart || !Array.isArray(selectedCart) || selectedCart.length === 0)) {
        return null;
    }

    // Early return if buy now but no item
    if (isBuyNow && !buyNowItem) {
        return null;
    }

    // Delivery fee
    const deliveryFee = 15;

    // Calculate total with proper validation
    const subtotal = isBuyNow ?
        (() => {
            if (!buyNowItem) return 0;
            const itemPrice = Number(buyNowItem.price) || 0;
            const addOnsPrice = buyNowAddons.reduce((sum, addon) => sum + (Number(addon.price) || 0), 0);
            const quantity = Number(buyNowItem.quantity) || 1;
            return (itemPrice + addOnsPrice) * quantity;
        })() :
        selectedCart.reduce((sum, item) => {
            if (!item || typeof item.price !== 'number') return sum;
            const itemPrice = Number(item.price) || 0;
            const addOnsPrice = (item.addOns && Array.isArray(item.addOns))
                ? item.addOns.reduce((s, a) => s + (Number(a.price) || 0), 0)
                : 0;
            const quantity = Number(item.quantity) || 1;
            return sum + ((itemPrice + addOnsPrice) * quantity);
        }, 0);
    const total = subtotal + deliveryFee;

    // Place order handler
    const handlePlaceOrder = async () => {
        // Validate data before proceeding
        if (isBuyNow) {
            if (!buyNowItem) {
                toast.error('No item to purchase. Please try again.');
                navigate('/');
                return;
            }
        } else {
            if (!selectedCart || !Array.isArray(selectedCart) || selectedCart.length === 0) {
                toast.error('No items in cart. Please add items to your cart first.');
                navigate(`/cart?user=${userId}`);
                return;
            }
        }

        // Validate address before placing order
        if (!address || !address.contactNumber || !address.lotNo || !address.barangay || !address.municipality || !address.province) {
            toast.error('Please complete your delivery address before placing the order.');
            return;
        }

        setPlacingOrder(true);
        try {
            // Prepare order data
            let orderData;

            if (isBuyNow) {
                // Buy now order
                            orderData = {
                userId: user?._id || userId,
                items: [{
                    productId: buyNowItem.product,
                    productName: buyNowItem.productName,
                    image: buyNowItem.image,
                    size: buyNowItem.size,
                    addOns: buyNowAddons,
                    quantity: buyNowItem.quantity,
                    price: buyNowItem.price
                }],
                address: {
                    ...address,
                    latitude: address?.latitude || 13.323830,
                    longitude: address?.longitude || 121.845809
                },
                deliveryInstructions,
                paymentMethod,
                referenceNumber: paymentMethod === 'gcash' ? referenceNumber : undefined,
                proofImage: paymentMethod === 'gcash' ? proofImage : undefined,
                total: total
            };
            } else {
                // Cart order
                const validItems = selectedCart.filter(item =>
                    item &&
                    (item.product || item.isCustomDrink) && // Allow either regular products or custom drinks
                    item.productName &&
                    typeof item.price === 'number' &&
                    typeof item.quantity === 'number' &&
                    item.quantity > 0
                );

                if (validItems.length === 0) {
                    toast.error('No valid items found in cart. Please refresh and try again.');
                    return;
                }

                orderData = {
                    userId: user?._id || userId,
                    items: validItems.map(item => ({
                        productId: item.isCustomDrink ? undefined : item.product, // Only include productId for regular products
                        productName: item.productName,
                        image: item.isCustomDrink ? item.customImage : item.image, // Use customImage for custom drinks
                        size: item.size,
                        addOns: item.isCustomDrink ? undefined : item.addOns, // Only include addOns for regular products
                        quantity: item.quantity,
                        price: item.price,
                        // Custom drink fields
                        isCustomDrink: item.isCustomDrink || false,
                        customIngredients: item.isCustomDrink ? item.customIngredients : undefined,
                        customImage: item.isCustomDrink ? item.customImage : undefined,
                        customBlendImage: item.isCustomDrink ? item.customBlendImage : undefined,
                        customDrinkName: item.isCustomDrink ? item.customDrinkName : undefined,
                        customSize: item.isCustomDrink ? item.customSize : undefined
                    })),
                    address: {
                        ...address,
                        latitude: address?.latitude || 13.323830,
                        longitude: address?.longitude || 121.845809
                    },
                    deliveryInstructions,
                    paymentMethod,
                    referenceNumber: paymentMethod === 'gcash' ? referenceNumber : undefined,
                    proofImage: paymentMethod === 'gcash' ? proofImage : undefined,
                    total: total
                };
            }
            // Place order
            await orderAPI.placeOrder(orderData);
            // Remove checked out products from cart (only for cart orders)
            if (!isBuyNow) {
                for (const item of selectedCart) {
                    if (item._originalIds && Array.isArray(item._originalIds)) {
                        for (const id of item._originalIds) {
                            await cartAPI.removeFromCart(id);
                        }
                    } else if (item._id) {
                        await cartAPI.removeFromCart(item._id);
                    }
                }
                localStorage.removeItem('selectedCart');
            } else {
                // Clear buy now data
                sessionStorage.removeItem('buyNowItem');
            }

            toast.success('Order placed successfully!');
            setTimeout(() => {
                navigate(`/order/user/${user?._id || userId}`);
            }, 1000);
        } catch (err) {
            console.error('Order placement error:', err);
            toast.error(err.response?.data?.error || 'Failed to place order.');
        } finally {
            setPlacingOrder(false);
        }
    };

    // Only return early after all hooks
    // The early return for selectedCart is now handled at the beginning of useEffect

    // Delivery Instructions state
    // Update deliveryInstructions when address changes
    // Payment method state
    // Place order button enabled logic
    const canPlaceOrder = (paymentMethod === 'cod') || (paymentMethod === 'gcash' && referenceNumber.trim() && proofImage);

    // Address validation for order placement
    const isAddressComplete = address &&
        address.contactNumber &&
        address.lotNo &&
        address.barangay &&
        address.municipality &&
        address.province;

    // Final order placement validation
    const canPlaceOrderWithAddress = canPlaceOrder && isAddressComplete;

    // Helper to render info row
    const InfoRow = ({ label, value }) => (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
            <span className="text-xs sm:text-xs font-semibold text-gray-500 w-32 inline-block">{label}</span>
            <span className="text-base sm:text-sm text-[#232323] font-medium break-all">{value && value.trim() !== '' ? value : 'N/A'}</span>
        </div>
    );

    InfoRow.propTypes = {
        label: PropTypes.string.isRequired,
        value: PropTypes.string
    };


    return (
        <div className="min-h-screen bg-[#232323] flex flex-col items-center px-2 sm:px-4 py-0">
            {/* Sticky Top Bar */}
            <div className="w-full sticky top-0 z-30 bg-[#232323] flex items-center px-4 py-4 shadow-md">
                <button
                    className="text-white hover:text-[#FFC107] mr-2"
                    aria-label="Back"
                    onClick={() => isBuyNow ? navigate('/') : navigate(`/cart?user=${userId}`)}
                >
                    <ArrowLeft size={28} />
                </button>
                <h1 className="text-xl font-extrabold text-white flex-1 text-center mr-8">Checkout</h1>
            </div>
            {/* Customer Info & Address Section */}
            <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-10 sm:mb-6 mt-6">
                {/* Contact Information */}
                <div>
                    <div className="font-bold text-base sm:text-lg mb-2">Contact Information</div>
                    {addressLoading ? (
                        <div className="animate-pulse flex flex-col gap-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <InfoRow label="Full name" value={user?.name || 'N/A'} />
                            <InfoRow label="Phone Number" value={address?.contactNumber} />
                        </div>
                    )}
                </div>
                {/* Delivery Information */}
                <div>
                    <div className="font-bold text-base sm:text-lg mb-2 mt-4">Delivery Information</div>
                    {!isAddressComplete && !addressLoading && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-red-600 text-sm font-medium">
                                ⚠️ Please complete your delivery address to place an order
                            </div>
                        </div>
                    )}
                    {addressLoading ? (
                        <div className="animate-pulse flex flex-col gap-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-8 bg-gray-200 rounded w-full mt-2" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <InfoRow label="Lot No" value={address?.lotNo} />
                            <InfoRow label="Purok" value={address?.purok} />
                            <InfoRow label="Street" value={address?.street} />
                            <InfoRow label="Barangay" value={address?.barangay} />
                            <InfoRow label="Municipality" value={address?.municipality} />
                            <InfoRow label="Province" value={address?.province} />
                            <div className="flex flex-col sm:col-span-2">
                                <FormInput
                                    label="Delivery Instructions"
                                    name="deliveryInstructions"
                                    value={deliveryInstructions}
                                    onChange={e => setDeliveryInstructions(e.target.value)}
                                    placeholder="Add any special instructions for delivery (optional)"
                                    variant="white"
                                />
                            </div>
                        </div>
                    )}
                </div>
                <Button
                    variant="yellow"
                    size="sm"
                    className="ml-auto mt-2"
                    onClick={() => navigate('/profile/address', {
                        state: {
                            returnTo: isBuyNow ? `/checkout/${user._id}?buyNow=true` : `/checkout/${userId}`
                        }
                    })}
                    disabled={addressLoading}
                >Edit</Button>
            </div>
            {/* Payment Section */}
            <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-10">
                <div className="font-bold text-base sm:text-lg mb-2">Payment</div>
                <div className="flex flex-col gap-4">
                    {/* GCash Option */}
                    <div className={`flex items-center gap-4 p-3 rounded-lg border ${paymentMethod === 'gcash' ? 'border-[#FFC107] bg-[#FFFBEA]' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('gcash')}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={gcashLogo} alt="GCash" className="w-12 h-12 object-contain rounded-lg" />
                        <div className="flex-1">
                            <div className="text-xs text-gray-500">GCash number</div>
                            <div className="font-bold text-base">09615460980</div>
                            <div className="text-xs text-gray-500 mt-1">Name</div>
                            <div className="font-semibold text-sm">Diether Monsanto</div>
                        </div>
                        <input type="radio" checked={paymentMethod === 'gcash'} readOnly className="w-5 h-5 accent-[#FFC107]" />
                    </div>
                    {/* Cash On Delivery Option */}
                    <div className={`flex items-center gap-4 p-3 rounded-lg border ${paymentMethod === 'cod' ? 'border-[#FFC107] bg-[#FFFBEA]' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('cod')}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={codLogo} alt="Cash On Delivery" className="w-10 h-10 rounded bg-white" />
                        <div className="flex-1">
                            <div className="font-bold text-base">Cash On Delivery</div>
                        </div>
                        <input type="radio" checked={paymentMethod === 'cod'} readOnly className="w-5 h-5 accent-[#FFC107]" />
                    </div>
                </div>
            </div>
            {/* Reference Number and Image Upload for GCash */}
            {paymentMethod === 'gcash' && (
                <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-10">
                    <FormInput
                        label="Reference Number"
                        name="referenceNumber"
                        value={referenceNumber}
                        onChange={e => setReferenceNumber(e.target.value)}
                        placeholder="Enter reference number"
                        variant="white"
                    />
                    <ImageUpload
                        label="Upload proof here"
                        value={proofImage}
                        onChange={setProofImage}
                        variant="white"
                    />
                </div>
            )}
            <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-8 shadow flex flex-col gap-4 mb-8 overflow-x-auto">
                {isBuyNow ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0 min-w-0">
                        <img src={buyNowItem.image || '/placeholder.png'} alt={buyNowItem.productName} className="w-16 h-16 object-cover rounded mb-2 sm:mb-0" />
                        <div className="flex-1 min-w-0 w-full">
                            <div className="font-bold text-base sm:text-lg text-[#232323] truncate">{buyNowItem.productName}</div>
                            {buyNowItem.size && <div className="text-xs text-gray-500 font-semibold">{buyNowItem.size}</div>}
                            {buyNowAddons && buyNowAddons.length > 0 && (
                                <div className="text-xs text-[#FFC107] font-bold truncate">
                                    Add-ons: {buyNowAddons.map(a => a.name).join(', ')}
                                </div>
                            )}
                            <div className="text-[#232323] text-sm sm:text-base font-bold">Qty: {buyNowItem.quantity}</div>
                        </div>
                        <div className="text-base sm:text-lg font-bold text-[#232323] mt-2 sm:mt-0">
                            ₱ {(Number(buyNowItem.price) + buyNowAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0)) * buyNowItem.quantity}
                        </div>
                    </div>
                ) : (
                    selectedCart.map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0 min-w-0">
                            <img src={item.image || '/placeholder.png'} alt={item.productName} className="w-16 h-16 object-cover rounded mb-2 sm:mb-0" />
                            <div className="flex-1 min-w-0 w-full">
                                <div className="font-bold text-base sm:text-lg text-[#232323] truncate">{item.productName}</div>
                                {item.size && <div className="text-xs text-gray-500 font-semibold">{item.size}</div>}
                                {item.addOns && item.addOns.length > 0 && (
                                    <div className="text-xs text-[#FFC107] font-bold truncate">Add-ons: {item.addOns.map(a => a.name).join(', ')}</div>
                                )}
                                <div className="text-[#232323] text-sm sm:text-base font-bold">Qty: {item.quantity}</div>
                            </div>
                            <div className="text-base sm:text-lg font-bold text-[#232323] mt-2 sm:mt-0">
                                ₱ {(Number(item.price) + (item.addOns ? item.addOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0) : 0)) * item.quantity}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow flex flex-col gap-4 mb-8">
                <div className="flex justify-between text-lg font-bold text-[#232323]">
                    <span>Subtotal</span>
                    <span>₱ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#232323]">
                    <span>Delivery Fee</span>
                    <span>₱ {deliveryFee.toFixed(2)}</span>
                </div>
                <hr className="my-2 border-gray-300" />
                <div className="flex justify-between text-2xl font-extrabold text-[#232323]">
                    <span>Total</span>
                    <span>₱ {total.toFixed(2)}</span>
                </div>
            </div>
            <Button
                variant="yellow"
                className="w-full max-w-2xl text-xl font-bold py-4 mb-10"
                disabled={!canPlaceOrderWithAddress || placingOrder}
                onClick={handlePlaceOrder}
            >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
            </Button>
        </div>
    );
}
