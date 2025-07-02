import AdminLayout from '@/layouts/AdminLayout';
import React from 'react';

export default function Dashboard() {
    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto mt-8 p-8 bg-[#242424] rounded-2xl shadow-lg border border-[#292929]">
                <h2 className="text-3xl font-extrabold text-white mb-4">Admin Dashboard</h2>
                <p className="text-[#BDBDBD] text-lg">
                    Welcome to your admin dashboard. Here you can manage your projects, team, and view reports.
                </p>
                {/* Add dashboard widgets or stats here */}
            </div>
        </AdminLayout>
    );
}
