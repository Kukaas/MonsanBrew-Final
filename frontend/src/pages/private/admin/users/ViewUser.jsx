import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/services/api";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusColor, getStatusLabel, getStatusIcon, getRoleColor, getRoleIcon } from '@/lib/utils';

export default function ViewUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: user, isLoading, error } = useQuery({
        queryKey: ["user", id],
        queryFn: async () => {
            const res = await userAPI.getUserById(id);
            return res.data?.user || res.user;
        },
    });

    if (isLoading) return (
        <AdminLayout>
            <PageLayout title="User Information" description="See all details for this user.">
                <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded" />
                </div>
                <div className="w-full max-w-7xl mx-auto bg-[#181818]/80 p-4 sm:p-8 md:p-12 rounded-3xl border border-[#232323] flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-20 items-stretch shadow-2xl backdrop-blur-md">
                    <div className="flex-shrink-0 flex flex-col items-center md:items-start w-full md:w-[350px] lg:w-[500px]">
                        <Skeleton className="w-full aspect-square rounded-2xl border-4 border-[#FFC107]" />
                        <div className="mt-6 flex flex-wrap gap-4 w-full">
                            <Skeleton className="h-10 w-32 rounded" />
                            <Skeleton className="h-10 w-32 rounded" />
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-8 md:gap-12 justify-center">
                        <Skeleton className="h-8 w-48 mb-6 rounded" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-4 md:gap-y-5 text-xl">
                            <Skeleton className="h-7 w-64 mb-2 rounded" />
                            <Skeleton className="h-7 w-64 mb-2 rounded" />
                            <Skeleton className="h-7 w-64 mb-2 rounded" />
                            <Skeleton className="h-7 w-64 mb-2 rounded" />
                        </div>
                        <div className="border-t border-[#232323] my-4" />
                        <Skeleton className="h-8 w-48 mb-4 md:mb-6 rounded" />
                        <Skeleton className="h-7 w-40 md:w-64 mb-2 rounded" />
                        <Skeleton className="h-7 w-40 md:w-64 mb-2 rounded" />
                        <Skeleton className="h-7 w-40 md:w-64 mb-2 rounded" />
                    </div>
                </div>
            </PageLayout>
        </AdminLayout>
    );

    if (error) {
        return (
            <AdminLayout>
                <PageLayout title="User Information" description="See all details for this user.">
                    <div className="w-full bg-[#181818] p-8 rounded-2xl border border-[#232323] shadow-lg">
                        <div className="text-red-500 text-center">
                            Failed to load user data. Please try again.
                        </div>
                    </div>
                </PageLayout>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <PageLayout title="User Information" description="See all details for this user.">
                <div className="mb-8 flex items-center gap-4">
                    <Button variant="yellow" size="icon" className="shadow-lg hover:scale-105 transition-transform duration-200" onClick={() => navigate('/admin/users')} >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <span className="font-extrabold text-2xl text-white tracking-wide">Go back</span>
                </div>
                <div className="w-full max-w-7xl mx-auto bg-[#181818]/80 p-4 sm:p-8 md:p-12 rounded-3xl border border-[#232323] flex flex-col lg:flex-row gap-8 lg:gap-16 items-stretch shadow-2xl backdrop-blur-md min-w-0">
                    {/* Photo and badges */}
                    <div className="flex-shrink-0 flex flex-col items-center lg:items-start w-full lg:w-[350px] xl:w-[400px] min-w-0">
                        <div className="relative w-full aspect-square bg-gradient-to-br from-[#232323] to-[#1a1a1a] rounded-2xl border-4 border-[#FFC107] overflow-hidden flex items-center justify-center shadow-xl group">
                            {user.photo ? (
                                <img
                                    src={user.photo}
                                    alt="User"
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110 bg-[#232323]"
                                />
                            ) : (
                                <User className="w-32 h-32 text-[#BDBDBD]" />
                            )}
                        </div>
                        <div className="mt-8 flex flex-wrap gap-4 w-full">
                            <Badge className={`${getRoleColor(user.role)} border rounded-full px-6 py-2 text-lg font-semibold shadow-md flex items-center gap-2`}>
                                {getRoleIcon(user.role)}
                                <span className="truncate max-w-[120px]">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                            </Badge>
                            <Badge className={`${getStatusColor(user.isVerified ? 'completed' : 'cancelled')} border rounded-full px-6 py-2 text-lg font-semibold shadow-md flex items-center gap-2`}>
                                {getStatusIcon(user.isVerified ? 'completed' : 'cancelled')}
                                <span>{user.isVerified ? 'Verified' : 'Not Verified'}</span>
                            </Badge>
                        </div>
                    </div>
                    {/* Details section */}
                    <div className="flex-1 flex flex-col gap-10 justify-center min-w-0">
                        {/* User Info */}
                        <div>
                            <h3 className="text-[#FFC107] text-2xl font-extrabold mb-6 tracking-widest uppercase drop-shadow-lg">User Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-base md:text-lg min-w-0">
                                <div className="truncate break-words min-w-0">
                                    <span className="font-bold text-[#FFC107]">Name: </span>
                                    <span className="text-white font-medium break-words">{user.name}</span>
                                </div>
                                <div className="truncate break-words min-w-0">
                                    <span className="font-bold text-[#FFC107]">Email: </span>
                                    <span className="text-white font-medium break-words">{user.email}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-[#FFC107]">Contact: </span>
                                    <span className="text-white font-medium">{user.contactNumber || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-[#FFC107]">Joined: </span>
                                    <span className="text-white font-medium">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-[#232323] my-4" />
                        {/* Address */}
                        <div>
                            <h3 className="text-[#FFC107] text-2xl font-extrabold mb-6 tracking-widest uppercase drop-shadow-lg">Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-base md:text-lg min-w-0">
                                <div>
                                    <span className="font-bold text-[#FFC107]">Lot No: </span>
                                    <span className="text-white font-medium">{user.lotNo || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-[#FFC107]">Purok: </span>
                                    <span className="text-white font-medium">{user.purok || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-[#FFC107]">Street: </span>
                                    <span className="text-white font-medium">{user.street || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-[#FFC107]">Landmark: </span>
                                    <span className="text-white font-medium">{user.landmark || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-[#FFC107]">Barangay: </span>
                                    <span className="text-white font-medium">{user.barangay || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-[#FFC107]">Municipality: </span>
                                    <span className="text-white font-medium">{user.municipality || 'N/A'}</span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="font-bold text-[#FFC107]">Province: </span>
                                    <span className="text-white font-medium">{user.province || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        </AdminLayout>
    );
} 