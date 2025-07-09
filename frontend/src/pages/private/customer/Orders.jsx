import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import CustomerLayout from '@/layouts/CustomerLayout';
import OrderTabs from '@/components/orders/OrderTabs';
import OrderLoadingState from '@/components/orders/OrderLoadingState';
import { toast } from 'sonner';

export default function Orders() {
    const params = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('all');

    // Use user ID from params or fallback to authenticated user
    const userId = params?.userId || user?._id;

    // Use React Query for fetching orders
    const { data: orders = [], error, isLoading } = useQuery({
        queryKey: ['orders', userId],
        queryFn: async () => {
            if (!userId) return [];
            const response = await orderAPI.getOrdersByUser(userId);
            return response.orders || [];
        },
        enabled: !!userId, // Only run query if userId exists
        staleTime: 1000 * 60 * 2,
        cacheTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        onError: (error) => {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        }
    });

    // Invalidate and refetch orders when an order is updated
    const handleOrderUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['orders', userId] });
    };

    // Show loading if we don't have userId or if we're fetching orders
    if (!userId || isLoading) {
        return (
            <CustomerLayout>
                <div className="min-h-screen bg-[#232323] flex flex-col items-center py-4 sm:py-10 px-2">
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-30 bg-[#232323] w-full flex justify-center pb-4 pt-2 sm:pt-0">
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-center text-white">My Purchases</h1>
                    </div>

                    <OrderLoadingState />
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-[#232323] flex flex-col items-center py-4 sm:py-10 px-2">
                {/* Sticky Header */}
                <div className="sticky top-0 z-30 bg-[#232323] w-full flex justify-center pb-4 pt-2 sm:pt-0">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-center text-white">My Purchases</h1>
                </div>

                <div className="w-full max-w-5xl">
                    <OrderTabs
                        orders={orders}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onOrderUpdate={handleOrderUpdate}
                    />
                </div>
            </div>
        </CustomerLayout>
    );
}
