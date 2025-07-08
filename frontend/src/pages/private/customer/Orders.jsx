import React from 'react';
import CustomerLayout from '@/layouts/CustomerLayout';

export default function Orders() {
    return (
        <CustomerLayout>
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#232323] text-white">
                <h1 className="text-3xl font-extrabold mb-4">Your Orders</h1>
                <p>You have been redirected here after placing an order. (Order list UI coming soon!)</p>
            </div>
        </CustomerLayout>
    );
}
