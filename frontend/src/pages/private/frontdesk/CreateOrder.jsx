import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, ShoppingCart, User, Phone, Utensils, ArrowLeft } from "lucide-react";
import { orderAPI, productAPI, addonsAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import FrontdeskLayout from "@/layouts/FrontdeskLayout";
import FrontdeskCustomerInfo from "./components/FrontdeskCustomerInfo";
import ProductBrowser from "./components/ProductBrowser";
import ProductConfigurator from "./components/ProductConfigurator";
import CartSummary from "./components/CartSummary";

export default function CreateOrder() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Form state
    const [customerName, setCustomerName] = useState("");
    const [customerContact, setCustomerContact] = useState("");
    const [orderType, setOrderType] = useState("dine_in");
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [quantity, setQuantity] = useState(1);

    // Get selected product details
    const selectedProductData = selectedProduct;

    // Calculate total
    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const addonTotal = item.addOns?.reduce((sum, addon) => sum + (Number(addon.price) || 0), 0) || 0;
            return total + (item.price + addonTotal) * item.quantity;
        }, 0);
    };

    const addonsKey = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) return "";
        return arr
            .map((a) => a.addonId || a._id || a)
            .sort()
            .join(",");
    };

    // Add item to cart (accepts optional payload: { addons: [...] })
    const addToCart = (opts) => {
        if (!selectedProductData) {
            toast.error("Please select a product");
            return;
        }
        const hasSizes = (Array.isArray(selectedProductData?.sizes) && selectedProductData.sizes.length > 0) || !!selectedProductData?.size;
        if (hasSizes && !selectedSize) {
            toast.error("Please select a product size");
            return;
        }

        // compute price using product sizes if provided
        let totalPrice = Number(selectedProductData?.price) || 0;
        if (Array.isArray(selectedProductData?.sizes) && selectedProductData.sizes.length > 0) {
            const found = selectedProductData.sizes.find((s) => s.label === selectedSize);
            totalPrice = found ? Number(found.price) || 0 : totalPrice;
        }

        const detailedAddons = Array.isArray(opts?.addons) ? opts.addons.map(a => ({
            addonId: a.addonId || a._id,
            name: a.name,
            price: Number(a.price) || 0
        })) : [];

        const cartItem = {
            productId: selectedProductData?._id,
            productName: selectedProductData?.productName || selectedProductData?.name,
            image: selectedProductData?.image || selectedProductData?.imageUrl,
            size: hasSizes ? selectedSize : undefined,
            price: totalPrice,
            quantity: quantity,
            addOns: detailedAddons
        };

        // merge with existing identical item (same product, size, add-ons set)
        const newKey = `${cartItem.productId}|${cartItem.size || ""}|${addonsKey(cartItem.addOns)}`;
        const idx = cart.findIndex((it) => `${it.productId}|${it.size || ""}|${addonsKey(it.addOns)}` === newKey);
        if (idx !== -1) {
            const updated = [...cart];
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + cartItem.quantity };
            setCart(updated);
        } else {
            setCart([...cart, cartItem]);
        }

        setSelectedProduct(null);
        setSelectedSize("");
        setSelectedAddons([]);
        setQuantity(1);
    };

    // Remove item from cart
    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    // Update quantity (decrement to 0 removes the item)
    const updateQuantity = (index, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(index);
            return;
        }
        const updatedCart = [...cart];
        updatedCart[index].quantity = newQuantity;
        setCart(updatedCart);
    };

    // Create walk-in order mutation
    const { mutate: createOrder, isLoading: isCreating } = useMutation({
        mutationFn: async (orderData) => {
            return await orderAPI.createWalkInOrder(orderData);
        },
        onSuccess: () => {
            toast.success("Walk-in order created successfully!");
            setCart([]);
            setCustomerName("");
            setCustomerContact("");
            setOrderType("dine_in");
            queryClient.invalidateQueries(["admin-orders"]);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || "Failed to create order";
            toast.error(errorMessage);
        },
    });

    // Handle order submission
    const handleSubmit = () => {
        if (!customerName || !customerContact || cart.length === 0) {
            toast.error("Please fill in all required fields and add items to cart");
            return;
        }

        const orderData = {
            customerName,
            customerContact,
            orderType,
            items: cart,
            frontdeskUserId: user._id,
            paymentMethod: "cash",
            total: calculateTotal()
        };

        createOrder(orderData);
    };

    return (
        <FrontdeskLayout>
            <div className="w-full max-w-7xl mx-auto px-6">
                <div className="mb-6 flex items-center gap-4">
                    <Button
                        variant="yellow"
                        size="icon"
                        className="shadow-lg hover:scale-105 transition-transform duration-200"
                        onClick={() => navigate("/frontdesk/dashboard")}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <span className="font-extrabold text-2xl text-white tracking-wide">Go back</span>
                </div>
                <div className="mb-4">
                    <h2 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase">Create Walk-in Order</h2>
                    <p className="text-[#BDBDBD]">Create orders for walk-in customers</p>
                </div>
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Customer Information */}
                    <div className="lg:col-span-1">
                        <FrontdeskCustomerInfo
                            customerName={customerName}
                            setCustomerName={setCustomerName}
                            customerContact={customerContact}
                            setCustomerContact={setCustomerContact}
                            orderType={orderType}
                            setOrderType={setOrderType}
                        />
                    </div>

                    {/* Product Browser + Configurator */}
                    <div className="lg:col-span-2 space-y-4">
                        <ProductBrowser onSelect={(p) => { setSelectedProduct(p); setSelectedAddons([]); setSelectedSize(""); setQuantity(1); }} />
                        <ProductConfigurator
                            product={selectedProductData}
                            selectedSize={selectedSize}
                            setSelectedSize={setSelectedSize}
                            selectedAddons={selectedAddons}
                            setSelectedAddons={setSelectedAddons}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            onAdd={addToCart}
                        />
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:col-span-1">
                        {cart.length > 0 && (
                            <CartSummary
                                cart={cart}
                                onInc={(idx) => updateQuantity(idx, cart[idx].quantity + 1)}
                                onDec={(idx) => updateQuantity(idx, cart[idx].quantity - 1)}
                                onRemove={(idx) => removeFromCart(idx)}
                                total={calculateTotal()}
                                onSubmit={handleSubmit}
                                isCreating={isCreating}
                                disabled={isCreating || !customerName || !customerContact || cart.length === 0}
                            />
                        )}
                    </div>
                </div>
            </div>
        </FrontdeskLayout>
    );
}
