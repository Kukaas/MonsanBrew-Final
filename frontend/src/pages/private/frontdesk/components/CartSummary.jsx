import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";

export default function CartSummary({ cart, onInc, onDec, onRemove, total, onSubmit, isCreating, disabled }) {
    return (
        <Card className="bg-[#181818]/80 border-2 border-[#232323] rounded-2xl">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="bg-[#FFC107] p-2 rounded-full">
                        <ShoppingCart className="w-5 h-5 text-black" />
                    </div>
                    <CardTitle className="text-[#FFC107] text-xl font-extrabold tracking-widest uppercase">Order Items</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {cart.map((item, index) => (
                        <div key={index} className="p-3 bg-[#232323] rounded-lg border border-[#444]">
                            <div className="flex items-center gap-3">
                                {item.image && (
                                    <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="text-white font-medium truncate">{item.productName}</div>
                                    {item.size && <div className="text-[#BDBDBD] text-xs">Size: {item.size}</div>}
                                    {item.addOns && item.addOns.length > 0 && (
                                        <div className="text-[#BDBDBD] text-xs truncate">Add-ons: {item.addOns.map(a => a.name).join(", ")}</div>
                                    )}
                                </div>
                                <div className="text-[#FFC107] font-bold whitespace-nowrap">₱{(
                                    (item.price + (item.addOns?.reduce((s, a) => s + (a.price || 0), 0) || 0)) * item.quantity
                                ).toFixed(2)}</div>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={() => onDec(index)} className="bg-[#2b2b2b] border-[#444] text-white hover:bg-[#333] w-8 h-8">
                                        <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="text-white font-medium min-w-[24px] text-center">{item.quantity}</span>
                                    <Button variant="outline" size="icon" onClick={() => onInc(index)} className="bg-[#2b2b2b] border-[#444] text-white hover:bg-[#333] w-8 h-8">
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => onRemove(index)} className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 w-8 h-8">
                                    <Minus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 border-t-2 border-[#FFC107]/30 pt-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[#FFC107] font-bold text-lg uppercase tracking-wide">Items Total</span>
                        <span className="text-[#FFC107] font-extrabold text-xl">₱{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#BDBDBD] text-sm">Payment Method</span>
                        <span className="text-white font-medium">Cash</span>
                    </div>
                </div>

                <Button onClick={onSubmit} disabled={disabled} className="w-full mt-4 bg-[#FFC107] hover:bg-[#FFD700] text-black font-semibold">
                    {isCreating ? "Creating Order..." : "Create Walk-in Order"}
                </Button>
            </CardContent>
        </Card>
    );
}


