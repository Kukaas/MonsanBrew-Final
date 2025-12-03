import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Plus, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AddressList() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await addressAPI.getAll();
            setAddresses(res.addresses || res.data?.addresses || []);
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await addressAPI.setDefault(id);
            toast.success('Default address updated');
            fetchAddresses();
        } catch (error) {
            console.error('Failed to set default:', error);
            toast.error('Failed to update default address');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        setDeleting(id);
        try {
            await addressAPI.delete(id);
            toast.success('Address deleted successfully');
            fetchAddresses();
        } catch (error) {
            console.error('Failed to delete address:', error);
            toast.error(error.response?.data?.message || 'Failed to delete address');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#232323] flex flex-col items-center px-0 sm:px-4 py-0">
            {/* Sticky Top Bar */}
            <div className="w-full sticky top-0 z-30 bg-[#232323] flex items-center px-4 py-4 shadow-md">
                <button
                    className="text-white hover:text-[#FFC107] mr-2"
                    aria-label="Back"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={28} />
                </button>
                <h1 className="text-xl font-extrabold text-white flex-1 text-center mr-8">My Addresses</h1>
            </div>

            <div className="w-full max-w-2xl px-4 py-6">
                {/* Add New Address Button */}
                <Button
                    variant="yellow"
                    className="w-full mb-6 text-lg font-bold py-6"
                    onClick={() => navigate('/profile/address/new')}
                >
                    <Plus size={20} className="mr-2" />
                    Add New Address
                </Button>

                {loading ? (
                    <div className="text-center text-white py-8">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <MapPin size={64} className="mx-auto mb-4 text-gray-300" />
                        <h2 className="text-xl font-bold text-[#232323] mb-2">No Addresses Yet</h2>
                        <p className="text-gray-500 mb-4">Add your first delivery address to get started</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {addresses.map((address) => (
                            <div
                                key={address._id}
                                className={`bg-white rounded-2xl shadow-lg p-6 ${address.isDefault ? 'border-2 border-[#FFC107]' : ''}`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={24} className="text-[#FFC107]" />
                                        <div>
                                            <div className="font-bold text-lg text-[#232323]">{address.label || 'Home'}</div>
                                            {address.isDefault && (
                                                <div className="flex items-center gap-1 text-xs text-[#FFC107] font-semibold">
                                                    <Star size={14} fill="#FFC107" />
                                                    Default Address
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/profile/address/${address._id}`)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(address._id)}
                                            disabled={deleting === address._id}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            {deleting === address._id ? '...' : <Trash2 size={16} />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Address Details */}
                                <div className="text-sm text-gray-700 mb-4">
                                    <div className="font-semibold">{address.contactNumber}</div>
                                    <div>
                                        {address.lotNo}
                                        {address.purok && `, ${address.purok}`}
                                        {address.street && `, ${address.street}`}
                                    </div>
                                    {address.landmark && <div className="text-gray-500">Landmark: {address.landmark}</div>}
                                    <div>
                                        {address.barangay}, {address.municipality}, {address.province}
                                    </div>
                                </div>

                                {/* Set as Default Button */}
                                {!address.isDefault && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleSetDefault(address._id)}
                                    >
                                        <Star size={16} className="mr-2" />
                                        Set as Default
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
