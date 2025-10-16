import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoryAPI, productAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function parseNumber(value) {
    const n = Number(String(value ?? "").toString().replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
}

export default function ProductBrowser({ onSelect }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTab, setSelectedTab] = useState("All");

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await categoryAPI.getAll();
            return res.data || res || [];
        },
    });

    const { data: products = [] } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await productAPI.getAll();
            return res.data || res || [];
        },
    });

    const tabs = ["All", "Featured", ...categories.map((c) => c.category)];

    let filtered = products;
    if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(
            (p) =>
                p.productName?.toLowerCase().includes(q) ||
                p.category?.category?.toLowerCase().includes(q)
        );
    }
    if (selectedTab === "Featured") {
        filtered = filtered.filter((p) => p.isFeatured);
    } else if (selectedTab !== "All") {
        filtered = filtered.filter((p) => p.category?.category === selectedTab);
    }

    return (
        <Card className="bg-[#181818]/80 border-2 border-[#232323] rounded-2xl">
            <CardHeader>
                <CardTitle className="text-[#FFC107] font-extrabold tracking-widest uppercase text-sm">
                    Browse Products
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products"
                        className="w-full rounded-md px-3 py-2 bg-[#232323] border border-[#444] text-white placeholder:text-[#BDBDBD]"
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 mb-4 custom-scrollbar whitespace-nowrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`text-xs font-bold pb-1 border-b-2 transition-colors flex-shrink-0 ${selectedTab === tab
                                ? "text-[#FFC107] border-[#FFC107]"
                                : "text-[#BDBDBD] border-transparent hover:text-[#FFC107]"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.map((p) => {
                        const hasSizes = Array.isArray(p.sizes) && p.sizes.length > 0;
                        const minSizePrice = hasSizes ? Math.min(...p.sizes.map(s => parseNumber(s.price))) : null;
                        const displayPrice = hasSizes ? minSizePrice : parseNumber(p.price);
                        return (
                            <button
                                key={p._id}
                                onClick={() => onSelect && onSelect(p)}
                                className="flex items-center gap-3 p-3 rounded-lg bg-[#232323] border border-[#333] hover:border-[#FFC107]/50 text-left"
                            >
                                <img
                                    src={p.image || p.imageUrl || "/placeholder.png"}
                                    alt={p.productName}
                                    className="w-12 h-12 object-cover rounded"
                                />
                                <div className="min-w-0">
                                    <div className="text-white font-medium truncate">{p.productName}</div>
                                    <div className="text-[#FFC107] text-sm font-bold">
                                        ₱ {displayPrice.toLocaleString()}{hasSizes ? " • from" : ""}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}


