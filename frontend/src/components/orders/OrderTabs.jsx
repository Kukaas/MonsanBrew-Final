import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderCard from './OrderCard';
import OrderEmptyState from './OrderEmptyState';

const OrderTabs = ({ orders, activeTab, setActiveTab, onOrderUpdate }) => {
    const filterOrders = (status) => {
        if (status === 'all') return orders;
        if (status === 'to_ship') return orders.filter(order => ['approved', 'preparing'].includes(order.status));
        if (status === 'to_receive') return orders.filter(order => order.status === 'out_for_delivery');
        if (status === 'completed') return orders.filter(order => order.status === 'completed');
        if (status === 'cancelled') return orders.filter(order => order.status === 'cancelled');
        if (status === 'return_refund') return orders.filter(order => order.status === 'return_refund');
        return orders;
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Sticky Tabs */}
            <div className="sticky top-18 z-10 bg-[#232323] pb-4">
                <div className="bg-white rounded-2xl p-2 shadow">
                    <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-transparent h-auto p-0 gap-1">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                        >
                            All
                        </TabsTrigger>
                        <TabsTrigger
                            value="to_ship"
                            className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                        >
                            <span className="hidden sm:inline">To Ship</span>
                            <span className="sm:hidden">To Ship</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="to_receive"
                            className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                        >
                            <span className="hidden sm:inline">To Receive</span>
                            <span className="sm:hidden">To Receive</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="completed"
                            className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                        >
                            <span className="hidden sm:inline">Completed</span>
                            <span className="sm:hidden">Completed</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="cancelled"
                            className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                        >
                            <span className="hidden sm:inline">Cancelled</span>
                            <span className="sm:hidden">Cancelled</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="return_refund"
                            className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                        >
                            <span className="hidden sm:inline">Return/Refund</span>
                            <span className="sm:hidden">Refund</span>
                        </TabsTrigger>
                    </TabsList>
                </div>
            </div>

            <div className="space-y-4 mt-4">
                <TabsContent value="all">
                    {filterOrders('all').length > 0 ? (
                        filterOrders('all').map((order) => (
                            <OrderCard key={order._id} order={order} onOrderUpdate={onOrderUpdate} />
                        ))
                    ) : (
                        <OrderEmptyState message="You haven't placed any orders yet." />
                    )}
                </TabsContent>

                <TabsContent value="to_ship">
                    {filterOrders('to_ship').length > 0 ? (
                        filterOrders('to_ship').map((order) => (
                            <OrderCard key={order._id} order={order} onOrderUpdate={onOrderUpdate} />
                        ))
                    ) : (
                        <OrderEmptyState message="No orders are being prepared for shipping." />
                    )}
                </TabsContent>

                <TabsContent value="to_receive">
                    {filterOrders('to_receive').length > 0 ? (
                        filterOrders('to_receive').map((order) => (
                            <OrderCard key={order._id} order={order} onOrderUpdate={onOrderUpdate} />
                        ))
                    ) : (
                        <OrderEmptyState message="No orders are out for delivery." />
                    )}
                </TabsContent>

                <TabsContent value="completed">
                    {filterOrders('completed').length > 0 ? (
                        filterOrders('completed').map((order) => (
                            <OrderCard key={order._id} order={order} onOrderUpdate={onOrderUpdate} />
                        ))
                    ) : (
                        <OrderEmptyState message="No completed orders yet." />
                    )}
                </TabsContent>

                <TabsContent value="cancelled">
                    {filterOrders('cancelled').length > 0 ? (
                        filterOrders('cancelled').map((order) => (
                            <OrderCard key={order._id} order={order} onOrderUpdate={onOrderUpdate} />
                        ))
                    ) : (
                        <OrderEmptyState message="No cancelled orders." />
                    )}
                </TabsContent>

                <TabsContent value="return_refund">
                    {filterOrders('return_refund').length > 0 ? (
                        filterOrders('return_refund').map((order) => (
                            <OrderCard key={order._id} order={order} onOrderUpdate={onOrderUpdate} />
                        ))
                    ) : (
                        <OrderEmptyState message="No return/refund requests." />
                    )}
                </TabsContent>
            </div>
        </Tabs>
    );
};

export default OrderTabs;
