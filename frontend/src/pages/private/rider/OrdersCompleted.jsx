import React from 'react';
import RiderLayout from '../../../layouts/RiderLayout';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function OrdersCompleted() {
    return (
        <RiderLayout>
            <div className="min-h-screen bg-[#232323] flex flex-col items-center justify-center py-10 px-2">
                <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md w-full">
                    <CheckCircle size={80} strokeWidth={2.5} className="mb-4" style={{ color: '#FFC107', filter: 'drop-shadow(0 0 8px #FFC10788)' }} />
                    <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">No Completed Orders</div>
                    <div className="text-gray-500 mb-6 text-center">You haven't completed any orders yet.</div>
                    <Button
                        variant="yellow"
                        className="w-full text-lg font-bold py-3"
                        onClick={() => window.location.reload()}
                    >
                        Refresh
                    </Button>
                </div>
            </div>
        </RiderLayout>
    );
} 