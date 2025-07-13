import React from 'react';
import RiderLayout from '../../../layouts/RiderLayout';
import { useAuth } from '../../../context/AuthContext';

export default function Profile() {
    const { user } = useAuth();
    return (
        <RiderLayout>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">My Profile</h1>
                <div className="bg-white rounded shadow p-4 max-w-md">
                    <div className="mb-2"><span className="font-semibold">Name:</span> {user?.name}</div>
                    <div className="mb-2"><span className="font-semibold">Email:</span> {user?.email}</div>
                    <div className="mb-2"><span className="font-semibold">Role:</span> {user?.role}</div>
                </div>
            </div>
        </RiderLayout>
    );
} 