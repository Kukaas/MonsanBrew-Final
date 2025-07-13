import React from 'react';
import RiderLayout from '@/layouts/RiderLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Calendar, Phone, MapPin } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <RiderLayout>
            <div className="min-h-screen bg-[#232323] p-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Profile</h1>
                        <p className="text-gray-400 text-sm md:text-base">Manage your account information</p>
                    </div>

                    {/* Profile Card */}
                    <Card className="bg-[#2A2A2A] border-[#444]">
                        <CardHeader className="text-center pb-6">
                            <div className="mx-auto mb-4 w-20 h-20 bg-[#FFC107] rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-black">
                                    {user?.name?.[0]?.toUpperCase() || 'R'}
                                </span>
                            </div>
                            <CardTitle className="text-white text-xl">{user?.name || 'Rider'}</CardTitle>
                            <Badge className="bg-[#FFC107]/20 text-[#FFC107] border-[#FFC107]/30 w-fit mx-auto">
                                <Shield className="w-3 h-3 mr-1" />
                                {user?.role || 'Rider'}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Personal Information */}
                            <div className="space-y-3">
                                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                    <User className="w-5 h-5 text-[#FFC107]" />
                                    Personal Information
                                </h3>
                                
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                        <Mail className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-400 text-xs font-medium">Email</p>
                                            <p className="text-white text-sm truncate">{user?.email || 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                        <Phone className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-400 text-xs font-medium">Contact Number</p>
                                            <p className="text-white text-sm">{user?.contactNumber || 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                        <Calendar className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-400 text-xs font-medium">Member Since</p>
                                            <p className="text-white text-sm">{formatDate(user?.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Status */}
                            <div className="space-y-3">
                                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-[#FFC107]" />
                                    Account Status
                                </h3>
                                
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                        <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">Account Status</p>
                                            <p className="text-green-400 text-xs">Active</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">Verification</p>
                                            <p className="text-blue-400 text-xs">Verified</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-3 pt-4 border-t border-[#444]">
                                <h3 className="text-white font-semibold text-lg">Quick Actions</h3>
                                
                                <div className="grid gap-2">
                                    <button className="w-full p-3 bg-[#333] hover:bg-[#444] rounded-lg text-left transition-colors">
                                        <p className="text-white text-sm font-medium">Update Profile</p>
                                        <p className="text-gray-400 text-xs">Edit your personal information</p>
                                    </button>
                                    
                                    <button className="w-full p-3 bg-[#333] hover:bg-[#444] rounded-lg text-left transition-colors">
                                        <p className="text-white text-sm font-medium">Change Password</p>
                                        <p className="text-gray-400 text-xs">Update your account password</p>
                                    </button>
                                    
                                    <button className="w-full p-3 bg-[#333] hover:bg-[#444] rounded-lg text-left transition-colors">
                                        <p className="text-white text-sm font-medium">Notification Settings</p>
                                        <p className="text-gray-400 text-xs">Manage your notification preferences</p>
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Info Card */}
                    <Card className="bg-[#2A2A2A] border-[#444]">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#FFC107]" />
                                Service Area
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="p-3 bg-[#333] rounded-lg">
                                    <p className="text-white text-sm font-medium mb-1">Current Service Area</p>
                                    <p className="text-gray-400 text-sm">MonsanBrew Delivery Zone</p>
                                </div>
                                
                                <div className="p-3 bg-[#333] rounded-lg">
                                    <p className="text-white text-sm font-medium mb-1">Operating Hours</p>
                                    <p className="text-gray-400 text-sm">7:00 AM - 10:00 PM</p>
                                </div>
                                
                                <div className="p-3 bg-[#333] rounded-lg">
                                    <p className="text-white text-sm font-medium mb-1">Support Contact</p>
                                    <p className="text-gray-400 text-sm">support@monsanbrew.com</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RiderLayout>
    );
} 