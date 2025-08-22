import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { userAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import MapSelector from '@/components/custom/MapSelector';

export default function Address() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { userId } = useParams();
    const location = useLocation();
    const returnTo = location.state?.returnTo || `/checkout/${user?._id || userId}`;
    const [form, setForm] = useState({
        contactNumber: '', lotNo: '', purok: '', street: '', landmark: '', barangay: '', municipality: '', province: ''
    });
    const [coordinates, setCoordinates] = useState({
        latitude: 13.323830,
        longitude: 121.845809
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        userAPI.getAddress()
            .then(res => {
                const address = res.address || {};
                setForm({
                    contactNumber: address.contactNumber,
                    lotNo: address.lotNo,
                    purok: address.purok,
                    street: address.street,
                    landmark: address.landmark,
                    barangay: address.barangay,
                    municipality: address.municipality,
                    province: address.province,
                });
                if (address.latitude && address.longitude) {
                    setCoordinates({
                        latitude: address.latitude,
                        longitude: address.longitude
                    });
                }
            })
            .catch(() => {
                setForm({
                    contactNumber: '',
                    lotNo: '',
                    purok: '',
                    street: '',
                    landmark: '',
                    barangay: '',
                    municipality: '',
                    province: '',
                });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = e => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleLocationSelect = (locationData) => {
        setCoordinates({
            latitude: locationData.latitude,
            longitude: locationData.longitude
        });

        // Try to extract address components from the selected location
        if (locationData.address) {
            const addressParts = locationData.address.split(', ');
            // This is a simple parsing - you might want to improve this based on your needs
            if (addressParts.length >= 3) {
                const street = addressParts[0];
                const barangay = addressParts[1];
                const municipality = addressParts[2];

                setForm(prev => ({
                    ...prev,
                    street: street || prev.street,
                    barangay: barangay || prev.barangay,
                    municipality: municipality || prev.municipality,
                }));
            }
        }

        setShowMap(false);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            const addressData = {
                ...form,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            };
            await userAPI.updateAddress(addressData);
            toast.success('Address updated successfully!');
            setTimeout(() => {
                navigate(returnTo);
            }, 1000);
        } catch (error) {
            console.error('Failed to update address:', error);
            toast.error('Failed to update address.');
        } finally {
            setSaving(false);
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
                <h1 className="text-xl font-extrabold text-white flex-1 text-center mr-8">Edit Delivery Address</h1>
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-0 mt-6 mb-8">
                {/* Card Header */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-2 border-b">
                    <div className="bg-[#FFC107] text-black rounded-full p-2 flex items-center justify-center">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-lg">Delivery Address</div>
                        <div className="text-xs text-gray-500">Please provide your complete address for delivery</div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading...</div>
                ) : (
                    <form className="flex flex-col gap-4 px-6 py-6" onSubmit={handleSubmit}>
                        {/* Map Selector */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-gray-700">Location on Map</label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMap(!showMap)}
                                    className="text-xs"
                                >
                                    {showMap ? 'Hide Map' : 'Show Map'}
                                </Button>
                            </div>
                            {showMap && (
                                <MapSelector
                                    onLocationSelect={handleLocationSelect}
                                    initialLatitude={coordinates.latitude}
                                    initialLongitude={coordinates.longitude}
                                    className="mb-4"
                                />
                            )}
                            {!showMap && (
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="text-xs text-gray-600">
                                        <strong>Current coordinates:</strong><br />
                                        {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Contact Number</label>
                            <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="09xxxxxxxxx" className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-[#FFC107]" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Lot No</label>
                                <input name="lotNo" value={form.lotNo} onChange={handleChange} placeholder="Lot No" className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-[#FFC107]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Purok</label>
                                <input name="purok" value={form.purok} onChange={handleChange} placeholder="Purok" className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-[#FFC107]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Street</label>
                            <input name="street" value={form.street} onChange={handleChange} placeholder="Street" className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-[#FFC107]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Landmark</label>
                            <input name="landmark" value={form.landmark} onChange={handleChange} placeholder="Landmark (optional)" className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-[#FFC107]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Barangay</label>
                            <input name="barangay" value={form.barangay} onChange={handleChange} placeholder="Barangay" className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-[#FFC107]" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Municipality</label>
                                <input name="municipality" value={form.municipality} onChange={handleChange} placeholder="Municipality" className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-[#FFC107]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Province</label>
                                <input name="province" value={form.province} onChange={handleChange} placeholder="Province" className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-[#FFC107]" />
                            </div>
                        </div>
                        <Button type="submit" variant="yellow" className="mt-2 text-lg font-bold py-3 w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</Button>
                        <Button type="button" variant="outline" className="mt-1 w-full" onClick={() => navigate(-1)}>Cancel</Button>
                    </form>
                )}
            </div>
        </div>
    );
}
