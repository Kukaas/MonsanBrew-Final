import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Shield, Calendar, Phone, MapPin, Key, Bell, Camera, LogOut } from 'lucide-react';
import { userAPI } from '@/services/api';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/AdminLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import RiderLayout from '@/layouts/RiderLayout';
import PageLayout from '@/layouts/PageLayout';
import CustomAlertDialog from '@/components/custom/CustomAlertDialog';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const { userId } = useParams();
    
    // Redirect if userId doesn't match current user's ID
    if (userId && userId !== user?._id) {
        return <Navigate to={`/profile/${user?._id}`} replace />;
    }
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || '',
        contactNumber: user?.contactNumber || '',
        photo: user?.photo || ''
    });
    const [localPhoto, setLocalPhoto] = useState(user?.photo || '');
    const fileInputRef = useRef();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setEditData({
                name: user?.name || '',
                contactNumber: user?.contactNumber || '',
                photo: user?.photo || ''
            });
            setLocalPhoto(user?.photo || '');
        }
    }, [isEditing, user]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRoleDisplayName = (role) => {
        const roleNames = {
            'admin': 'Administrator',
            'rider': 'Delivery Rider',
            'customer': 'Customer',
            'frontdesk': 'Front Desk'
        };
        return roleNames[role] || role;
    };

    const getRoleSpecificInfo = () => {
        switch (user?.role) {
            case 'rider':
                return {
                    title: 'Service Area',
                    icon: MapPin,
                    items: [
                        { label: 'Current Service Area', value: 'MonsanBrew Delivery Zone' },
                        { label: 'Operating Hours', value: '7:00 AM - 10:00 PM' },
                        { label: 'Support Contact', value: 'support@monsanbrew.com' }
                    ]
                };
            case 'admin':
                return {
                    title: 'Admin Information',
                    icon: Shield,
                    items: [
                        { label: 'System Access', value: 'Full Administrative Access' },
                        { label: 'Management Level', value: 'Super Administrator' },
                        { label: 'Support Contact', value: 'admin@monsanbrew.com' }
                    ]
                };
            case 'frontdesk':
                return {
                    title: 'Front Desk Information',
                    icon: User,
                    items: [
                        { label: 'System Access', value: 'Order Management & Customer Service' },
                        { label: 'Operating Hours', value: '8:00 AM - 9:00 PM' },
                        { label: 'Support Contact', value: 'frontdesk@monsanbrew.com' }
                    ]
                };
            case 'customer':
                return {
                    title: 'Customer Information',
                    icon: User,
                    items: [
                        { label: 'Account Type', value: 'Regular Customer' },
                        { label: 'Service Hours', value: '7:00 AM - 10:00 PM' },
                        { label: 'Support Contact', value: 'support@monsanbrew.com' }
                    ]
                };
            default:
                return null;
        }
    };

    const getQuickActions = () => {
        const baseActions = [
            {
                icon: Key,
                title: 'Change Password',
                description: 'Update your account password',
                action: () => console.log('Change Password clicked')
            },
            {
                icon: Bell,
                title: 'Notification Settings',
                description: 'Manage your notification preferences',
                action: () => console.log('Notification Settings clicked')
            }
        ];

        // Add role-specific actions
        if (user?.role === 'rider') {
            baseActions.push({
                icon: MapPin,
                title: 'Service Area Settings',
                description: 'Manage your delivery zones',
                action: () => console.log('Service Area Settings clicked')
            });
        }

        if (user?.role === 'admin') {
            baseActions.push({
                icon: Shield,
                title: 'System Settings',
                description: 'Manage system configurations',
                action: () => console.log('System Settings clicked')
            });
        }

        // Add logout action
        baseActions.push({
            icon: LogOut,
            title: 'Logout',
            description: 'Sign out of your account',
            action: () => setLogoutOpen(true)
        });

        return baseActions;
    };

    const handleEditToggle = () => {
        setIsEditing((prev) => !prev);
    };

    // Image compression utility
    const compressImage = (file, maxSizeMB = 5, quality = 0.8) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;
                const maxDimension = 1920; // Max width/height
                
                if (width > height && width > maxDimension) {
                    height = (height * maxDimension) / width;
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = (width * maxDimension) / height;
                    height = maxDimension;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to blob with compression
                canvas.toBlob((blob) => {
                    // If still too large, compress more
                    if (blob.size > maxSizeMB * 1024 * 1024) {
                        canvas.toBlob((compressedBlob) => {
                            resolve(compressedBlob);
                        }, 'image/jpeg', quality * 0.5); // Further reduce quality
                    } else {
                        resolve(blob);
                    }
                }, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file');
                return;
            }
            
            setIsLoading(true);
            try {
                let processedFile = file;
                
                // Check file size and compress if needed
                if (file.size > 5 * 1024 * 1024) {
                    processedFile = await compressImage(file, 5, 0.8);
                }
                
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const photoData = reader.result;
                    setLocalPhoto(photoData);
                    setEditData((prev) => ({ ...prev, photo: photoData }));
                    
                    try {
                        const response = await userAPI.updateProfile({ photo: photoData });
                        if (response && (response.user || response.message)) {
                            updateUser(response.user);
                            toast.success('Profile photo updated successfully!');
                        } else {
                            toast.error('Failed to update profile photo.');
                        }
                    } catch (err) {
                        toast.error(err?.message || 'Failed to update profile photo.');
                    } finally {
                        setIsLoading(false);
                    }
                };
                reader.onerror = () => {
                    toast.error('Failed to read the selected file');
                    setIsLoading(false);
                };
                reader.readAsDataURL(processedFile);
            } catch (error) {
                console.error('Error processing image:', error);
                toast.error('Failed to process the image. Please try again.');
                setIsLoading(false);
            }
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const response = await userAPI.updateProfile(editData);
            if (response && (response.user || response.message)) {
                updateUser(response.user);
                toast.success('Profile updated successfully!');
                setIsEditing(false);
            } else {
                toast.error('Failed to update profile.');
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setEditData({
            name: user?.name || '',
            contactNumber: user?.contactNumber || '',
            photo: user?.photo || ''
        });
        setLocalPhoto(user?.photo || '');
        setIsEditing(false);
    };

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await userAPI.logout();
            updateUser(null);
            toast.success('Logged out successfully!');
            setLogoutOpen(false);
        } catch (err) {
            toast.error(err?.message || 'Failed to logout.');
        } finally {
            setLogoutLoading(false);
        }
    };

    // Render the appropriate layout based on user role
    const renderLayout = (children) => {
        switch (user?.role) {
            case 'admin':
                return <AdminLayout>{children}</AdminLayout>;
            case 'customer':
                return <CustomerLayout>{children}</CustomerLayout>;
            case 'rider':
                return <RiderLayout>{children}</RiderLayout>;
            case 'frontdesk':
                return <AdminLayout>{children}</AdminLayout>; // Front desk uses admin layout
            default:
                return <PageLayout title="Profile">{children}</PageLayout>;
        }
    };

    const roleSpecificInfo = getRoleSpecificInfo();
    const quickActions = getQuickActions();

    // Profile content
    const profileContent = (
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
                        {/* Avatar with border and shadow */}
                        <div className="relative mx-auto mb-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div
                                className="relative w-20 h-20 mx-auto group cursor-pointer"
                                onClick={handleAvatarClick}
                            >
                                <Avatar className="w-20 h-20">
                                    {localPhoto ? (
                                        <AvatarImage 
                                            src={localPhoto} 
                                            alt={editData.name || 'Profile'} 
                                            className="object-cover"
                                        />
                                    ) : null}
                                    <AvatarFallback className="bg-[#FFC107] text-black text-2xl font-bold">
                                        {editData.name?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                
                                {/* Blurry edit overlay on hover */}
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                        <CardTitle className="text-white text-xl">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={editData.name}
                                    onChange={handleInputChange}
                                    className="bg-[#333] border border-[#444] rounded px-3 py-1 text-white text-center w-full max-w-xs"
                                    placeholder="Enter your name"
                                />
                            ) : (
                                user?.name || 'User'
                            )}
                        </CardTitle>
                        <Badge className="bg-[#FFC107]/20 text-[#FFC107] border-[#FFC107]/30 w-fit mx-auto">
                            <Shield className="w-3 h-3 mr-1" />
                            {getRoleDisplayName(user?.role)}
                        </Badge>
                        
                        <p className="text-gray-400 text-xs mt-2">Click photo to change profile picture</p>
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
                                    <Calendar className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-400 text-xs font-medium">Member Since</p>
                                        <p className="text-white text-sm">{formatDate(user?.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                    <Shield className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-400 text-xs font-medium">Role</p>
                                        <p className="text-white text-sm capitalize">{getRoleDisplayName(user?.role)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Update Information Section */}
                        <div className="space-y-3">
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-[#FFC107]" />
                                Update Information
                            </h3>
                            
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                    <User className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-400 text-xs font-medium">Name</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={editData.name}
                                                onChange={handleInputChange}
                                                className="bg-transparent border-none text-white text-sm w-full focus:outline-none"
                                                placeholder="Enter your name"
                                            />
                                        ) : (
                                            <p className="text-white text-sm">{user?.name || 'Not provided'}</p>
                                        )}
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={handleEditToggle}
                                            className="text-[#FFC107] hover:text-[#FFC107]/80 transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                    <Phone className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-400 text-xs font-medium">Contact Number</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="contactNumber"
                                                value={editData.contactNumber}
                                                onChange={handleInputChange}
                                                className="bg-transparent border-none text-white text-sm w-full focus:outline-none"
                                                placeholder="Enter contact number"
                                            />
                                        ) : (
                                            <p className="text-white text-sm">{user?.contactNumber || 'Not provided'}</p>
                                        )}
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={handleEditToggle}
                                            className="text-[#FFC107] hover:text-[#FFC107]/80 transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Save/Cancel Buttons - Only show when editing */}
                            {isEditing && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                        variant="yellow"
                                        size="sm"
                                        loading={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        onClick={handleCancel}
                                        variant="yellow-outline"
                                        size="sm"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Account Status */}
                        <div className="space-y-3">
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#FFC107]" />
                                Account Status
                            </h3>
                            
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${user?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">Email Verification</p>
                                        <p className={`text-xs ${user?.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {user?.isVerified ? 'Verified' : 'Pending Verification'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                    <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">Account Status</p>
                                        <p className="text-green-400 text-xs">Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Information - Only show for customers and riders */}
                        {(user?.role === 'customer' || user?.role === 'rider') && (
                            <div className="space-y-3">
                                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-[#FFC107]" />
                                    Address Information
                                </h3>
                                
                                <div className="grid gap-3">
                                    {user?.lotNo && (
                                        <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                            <MapPin className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-400 text-xs font-medium">Lot No.</p>
                                                <p className="text-white text-sm">{user.lotNo}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user?.purok && (
                                        <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                            <MapPin className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-400 text-xs font-medium">Purok</p>
                                                <p className="text-white text-sm">{user.purok}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user?.street && (
                                        <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                            <MapPin className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-400 text-xs font-medium">Street</p>
                                                <p className="text-white text-sm">{user.street}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user?.landmark && (
                                        <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                            <MapPin className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-400 text-xs font-medium">Landmark</p>
                                                <p className="text-white text-sm">{user.landmark}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user?.barangay && (
                                        <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                            <MapPin className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-400 text-xs font-medium">Barangay</p>
                                                <p className="text-white text-sm">{user.barangay}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user?.municipality && (
                                        <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                            <MapPin className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-400 text-xs font-medium">Municipality</p>
                                                <p className="text-white text-sm">{user.municipality}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user?.province && (
                                        <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                            <MapPin className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-400 text-xs font-medium">Province</p>
                                                <p className="text-white text-sm">{user.province}</p>
                                            </div>
                                        </div>
                                    )}

                                    {!user?.lotNo && !user?.purok && !user?.street && !user?.barangay && !user?.municipality && !user?.province && (
                                        <div className="flex items-center gap-3 p-3 bg-[#333] rounded-lg">
                                            <MapPin className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-400 text-xs font-medium">Address</p>
                                                <p className="text-white text-sm">No address information provided</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="space-y-3 pt-4 border-t border-[#444]">
                            <h3 className="text-white font-semibold text-lg">Quick Actions</h3>
                            
                            <div className="grid gap-2">
                                {quickActions.map((action, index) => {
                                    const isLogout = action.title === 'Logout';
                                    return (
                                        <button
                                            key={index}
                                            onClick={action.action}
                                            className={
                                                "w-full p-3 rounded-lg text-left transition-colors flex items-center " +
                                                (isLogout
                                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                                    : "bg-[#333] hover:bg-[#444] text-white")
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <action.icon className={isLogout ? "w-4 h-4 text-white flex-shrink-0" : "w-4 h-4 text-[#FFC107] flex-shrink-0"} />
                                                <div>
                                                    <p className="text-white text-sm font-medium">{action.title}</p>
                                                    <p className={isLogout ? "text-red-200 text-xs" : "text-gray-400 text-xs"}>{action.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Role-specific Information Card */}
                {roleSpecificInfo && (
                    <Card className="bg-[#2A2A2A] border-[#444]">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <roleSpecificInfo.icon className="w-5 h-5 text-[#FFC107]" />
                                {roleSpecificInfo.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {roleSpecificInfo.items.map((item, index) => (
                                    <div key={index} className="p-3 bg-[#333] rounded-lg">
                                        <p className="text-white text-sm font-medium mb-1">{item.label}</p>
                                        <p className="text-gray-400 text-sm">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Logout Confirmation Dialog */}
                <CustomAlertDialog
                    open={logoutOpen}
                    onOpenChange={logoutLoading ? undefined : setLogoutOpen}
                    title="Logout"
                    description="Are you sure you want to logout?"
                    actions={
                        <>
                            <Button
                                type="button"
                                variant="yellow-outline"
                                size="lg"
                                onClick={() => setLogoutOpen(false)}
                                disabled={logoutLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="yellow"
                                size="lg"
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                loading={logoutLoading}
                            >
                                Logout
                            </Button>
                        </>
                    }
                />
            </div>
        </div>
    );

    return renderLayout(profileContent);
} 