import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addonsAPI } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function parseNumber(value) {
    const n = Number(String(value ?? "").toString().replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
}

export default function ProductConfigurator({ product, selectedSize, setSelectedSize, selectedAddons, setSelectedAddons, quantity, setQuantity, onAdd }) {
    // derive sizes
    const sizes = useMemo(() => {
        if (!product) return [];
        if (Array.isArray(product.sizes) && product.sizes.length > 0) return product.sizes;
        if (Array.isArray(product.size)) return product.size.map((label) => ({ label, price: product.price }));
        if (product.size) return [{ label: product.size, price: product.price }];
        return [];
    }, [product]);

    // default size
    useEffect(() => {
        if (!product) return;
        if (!selectedSize && sizes.length > 0) {
            const small = sizes.find((s) => (s.label || s).toString().toLowerCase() === "small");
            setSelectedSize(small ? (small.label || small) : (sizes[0].label || sizes[0]));
        }
    }, [product, sizes, selectedSize, setSelectedSize]);

    // fetch add-ons for this product
    const addonIds = product?.addOns || [];
    const { data: addons = [], isLoading: loadingAddons } = useQuery({
        queryKey: ["addons", addonIds],
        enabled: addonIds.length > 0,
        queryFn: async () => {
            const res = await addonsAPI.getMany(addonIds);
            return res.data || res || [];
        },
    });

    const sizePrice = useMemo(() => {
        if (!selectedSize) return parseNumber(product?.price);
        if (Array.isArray(product?.sizes)) {
            const found = product.sizes.find((s) => s.label === selectedSize);
            return found ? parseNumber(found.price) : parseNumber(product?.price);
        }
        return parseNumber(product?.price);
    }, [product, selectedSize]);

    const addonsPrice = useMemo(() => {
        return (selectedAddons || []).reduce((sum, id) => {
            const a = addons.find((x) => (x._id || x.addonId) === id);
            return sum + parseNumber(a?.price);
        }, 0);
    }, [selectedAddons, addons]);

    const unitTotal = parseNumber(sizePrice) + parseNumber(addonsPrice);

    const buildSelectedAddonsDetailed = () => {
        return (selectedAddons || []).map((id) => {
            const a = addons.find((x) => (x._id || x.addonId) === id);
            return a ? { addonId: a._id, name: a.name, price: parseNumber(a.price), image: a.image } : null;
        }).filter(Boolean);
    };

    return (
        <Card className="bg-[#181818]/80 border-2 border-[#232323] rounded-2xl">
            <CardHeader>
                <CardTitle className="text-[#FFC107] text-xl font-extrabold tracking-widest uppercase">Configure Item</CardTitle>
                <CardDescription className="text-[#BDBDBD]">Choose size and add-ons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Size selection */}
                {sizes.length > 0 && (
                    <div>
                        <div className="text-white font-semibold mb-2">Size</div>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((s, i) => {
                                const label = s.label || s;
                                return (
                                    <Button
                                        key={i}
                                        variant={selectedSize === label ? "yellow" : "yellow-outline"}
                                        onClick={() => setSelectedSize(label)}
                                        className="min-w-[72px]"
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Add-ons */}
                <div>
                    <div className="text-white font-semibold mb-2">Add-ons</div>
                    {loadingAddons ? (
                        <div className="text-[#BDBDBD] text-sm">Loading add-ons...</div>
                    ) : addons.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {addons.map((a) => {
                                const checked = selectedAddons.includes(a._id);
                                return (
                                    <label key={a._id} className={`flex items-center gap-3 p-2 rounded border ${checked ? "border-[#FFC107] bg-[#2a2a2a]" : "border-[#333] bg-[#232323]"}`}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                if (checked) setSelectedAddons(selectedAddons.filter((id) => id !== a._id));
                                                else setSelectedAddons([...selectedAddons, a._id]);
                                            }}
                                            className="accent-[#FFC107] w-4 h-4"
                                        />
                                        {a.image && <img src={a.image} alt={a.name} className="w-8 h-8 object-cover rounded" />}
                                        <span className="text-white text-sm flex-1">{a.name}</span>
                                        <span className="text-[#FFC107] text-sm font-bold">+₱{parseNumber(a.price).toLocaleString()}</span>
                                    </label>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-[#BDBDBD] text-sm">No add-ons</div>
                    )}
                </div>

                {/* Quantity and Add */}
                <div className="flex items-center justify-between">
                    <div className="text-white font-semibold">Unit: ₱{parseNumber(unitTotal).toLocaleString()}</div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="bg-[#232323] border-[#444] text-white" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                        <span className="text-white font-medium w-8 text-center">{quantity}</span>
                        <Button variant="outline" size="icon" className="bg-[#232323] border-[#444] text-white" onClick={() => setQuantity(quantity + 1)}>+</Button>
                    </div>
                </div>
                <Button className="w-full bg-[#FFC107] hover:bg-[#FFD700] text-black font-semibold" onClick={() => onAdd && onAdd({ addons: buildSelectedAddonsDetailed() })} disabled={!product}>
                    Add to Cart
                </Button>
            </CardContent>
        </Card>
    );
}


