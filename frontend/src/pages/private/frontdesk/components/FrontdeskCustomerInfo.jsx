import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Utensils, User } from "lucide-react";

export default function FrontdeskCustomerInfo({ customerName, setCustomerName, orderType, setOrderType }) {
    return (
        <Card className="relative bg-gradient-to-br from-[#232323] to-[#1a1a1a] rounded-2xl border-4 border-[#FFC107] shadow-xl">
            <CardHeader>
                <CardTitle className="text-[#FFC107] text-xl font-extrabold tracking-widest uppercase flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                </CardTitle>
                <CardDescription className="text-[#BDBDBD]">
                    Enter customer details for the walk-in order
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="customerName" className="text-white">Customer Name *</Label>
                    <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        className="bg-[#232323] border-[#444] text-white placeholder:text-[#BDBDBD]"
                    />
                </div>
                <div>
                    <Label htmlFor="orderType" className="text-white">Order Type *</Label>
                    <Select value={orderType} onValueChange={setOrderType}>
                        <SelectTrigger className="bg-[#232323] border-[#444] text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#232323] border-[#444] text-white">
                            <SelectItem value="dine_in">
                                <div className="flex items-center gap-2">
                                    <Utensils className="w-4 h-4" />
                                    Dine In
                                </div>
                            </SelectItem>
                            <SelectItem value="take_out">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    Take Out
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="mt-3">
                        <span className="inline-flex items-center gap-2 bg[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 rounded-full px-3 py-1 text-xs font-semibold">
                            {orderType === "dine_in" ? <Utensils className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />} {orderType === "dine_in" ? "Dine In" : "Take Out"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


