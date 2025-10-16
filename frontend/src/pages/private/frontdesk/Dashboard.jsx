import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingCart, Users, Clock } from "lucide-react";
import FrontdeskLayout from "@/layouts/FrontdeskLayout";
import { useQuery } from "@tanstack/react-query";
import { orderAPI } from "@/services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["frontdesk-orders"],
    queryFn: async () => {
      const res = await orderAPI.getAllOrders();
      return res.data?.orders || res.orders || [];
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const today = new Date();
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const walkInOrders = (orders || []).filter((o) => o.isWalkInOrder);
  const todaysWalkInCount = walkInOrders.filter((o) => isSameDay(new Date(o.createdAt), today)).length;
  const activeWalkInCount = walkInOrders.filter((o) => o.status === "preparing").length;

  return (
    <FrontdeskLayout>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Order Card */}
          <Card className="bg-[#181818]/80 border-2 border-[#232323] rounded-2xl transition-all duration-300 group shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[#FFC107]/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#FFC107]/30 transition-colors">
                <Plus className="w-8 h-8 text-[#FFC107]" />
              </div>
              <CardTitle className="text-[#FFC107] text-xl font-extrabold tracking-widest uppercase">Create Walk-in Order</CardTitle>
              <CardDescription className="text-[#BDBDBD]">
                Create orders for customers who visit the store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/frontdesk/create-order")}
                className="w-full bg-[#FFC107] hover:bg-[#FFD700] text-black font-semibold"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                New Order
              </Button>
            </CardContent>
          </Card>

          {/* Today's Walk-in Orders */}
          <Card className="bg-[#181818]/80 border-2 border-[#232323] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[#FFC107] flex items-center gap-2 font-extrabold tracking-widest uppercase">
                <Users className="w-5 h-5" />
                Today's Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{isLoading ? "-" : todaysWalkInCount}</div>
              <p className="text-[#BDBDBD] text-sm">Walk-in orders today</p>
            </CardContent>
          </Card>

          {/* Active (Preparing) Walk-in Orders */}
          <Card className="bg-[#181818]/80 border-2 border-[#232323] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[#FFC107] flex items-center gap-2 font-extrabold tracking-widest uppercase">
                <Clock className="w-5 h-5" />
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{isLoading ? "-" : activeWalkInCount}</div>
              <p className="text-[#BDBDBD] text-sm">Currently preparing</p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-[#181818]/80 border-2 border-[#232323] rounded-2xl mt-8">
          <CardHeader>
            <CardTitle className="text-[#FFC107] font-extrabold tracking-widest uppercase">Frontdesk Instructions</CardTitle>
            <CardDescription className="text-[#BDBDBD]">
              How to use the frontdesk system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Creating Walk-in Orders:</h4>
                <ul className="text-[#BDBDBD] space-y-1 text-sm">
                  <li>• Click "New Order" to start creating an order</li>
                  <li>• Enter customer name and contact number</li>
                  <li>• Select order type (Dine In or Take Out)</li>
                  <li>• Add products to the cart with sizes and add-ons</li>
                  <li>• Review the order and create it</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Order Management:</h4>
                <ul className="text-[#BDBDBD] space-y-1 text-sm">
                  <li>• Walk-in orders start in "Preparing" status</li>
                  <li>• Orders can be updated to "Completed" when ready</li>
                  <li>• All orders appear in the admin panel</li>
                  <li>• Payment is always Cash</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FrontdeskLayout>
  );
}
