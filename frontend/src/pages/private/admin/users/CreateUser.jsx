import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "@/services/api";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import Form from "@/components/custom/Form";
import FormInput from "@/components/custom/FormInput";
import CustomSelect from "@/components/custom/CustomSelect";
import ImageUpload from "@/components/custom/ImageUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CreateUser() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("customer");
    const [contactNumber, setContactNumber] = useState("");
    const [lotNo, setLotNo] = useState("");
    const [purok, setPurok] = useState("");
    const [street, setStreet] = useState("");
    const [landmark, setLandmark] = useState("");
    const [barangay, setBarangay] = useState("");
    const [municipality, setMunicipality] = useState("");
    const [province, setProvince] = useState("");
    const [photo, setPhoto] = useState("");
    const [formError, setFormError] = useState("");
    const [showSaving, setShowSaving] = useState(false);

    const roleOptions = [
        { value: "customer", label: "Customer" },
        { value: "rider", label: "Rider" },
        { value: "frontdesk", label: "Front Desk" },
        { value: "admin", label: "Admin" }
    ];

    const { mutate } = useMutation({
        mutationFn: async (newUser) => {
            return await userAPI.createUser(newUser);
        },
        onSuccess: () => {
            setShowSaving(false);
            queryClient.invalidateQueries(['users']);
            toast.success("User created successfully!");
            navigate("/admin/users");
        },
        onError: (err) => {
            setShowSaving(false);
            let msg = "Failed to create user";
            if (err?.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err?.message) {
                msg = err.message;
            } else if (typeof err === 'string') {
                msg = err;
            }
            setFormError(msg);
            toast.error(msg);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError("");

        // Validation
        if (!name.trim()) return setFormError("Name is required");
        if (!email.trim()) return setFormError("Email is required");
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setFormError("Please enter a valid email address");

        setShowSaving(true);
        mutate({
            name: name.trim(),
            email: email.trim(),
            role,
            contactNumber: contactNumber.trim(),
            lotNo: lotNo.trim(),
            purok: purok.trim(),
            street: street.trim(),
            landmark: landmark.trim(),
            barangay: barangay.trim(),
            municipality: municipality.trim(),
            province: province.trim(),
            photo
        });
    };

    return (
        <AdminLayout>
            <PageLayout title="Create User" description="Add a new user account. The password will be automatically generated and sent to the user's email.">
                <Form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full bg-[#181818] p-8 rounded-2xl border border-[#232323] shadow-lg">
                        {/* User Information Section */}
                        <div className="col-span-1 md:col-span-2">
                            <h2 className="text-lg font-bold text-[#FFC107] mb-4">User Information</h2>
                        </div>

                        {/* Left column: Basic Information */}
                        <div className="flex flex-col gap-4">
                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Full Name *</span>}
                                name="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter full name"
                            />

                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Email Address *</span>}
                                name="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter email address"
                            />

                            <div className="flex flex-col gap-1">
                                <label htmlFor="role" className="font-bold text-[#FFC107]">Role *</label>
                                <CustomSelect
                                    id="role"
                                    value={role}
                                    onChange={setRole}
                                    options={roleOptions}
                                    placeholder="Select user role"
                                    name="role"
                                    error={formError}
                                    variant="dark"
                                />
                            </div>

                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Contact Number</span>}
                                name="contactNumber"
                                value={contactNumber}
                                onChange={e => setContactNumber(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter contact number"
                            />

                            <div className="flex flex-col gap-1">
                                <label className="font-bold text-[#FFC107]">Profile Photo</label>
                                <ImageUpload 
                                    label="" 
                                    value={photo} 
                                    onChange={setPhoto} 
                                    error={formError} 
                                    placeholder="Upload profile photo (optional)" 
                                />
                            </div>
                        </div>

                        {/* Right column: Address Information */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-md font-bold text-[#FFC107] mb-2">Address Information</h3>
                            
                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Lot No.</span>}
                                name="lotNo"
                                value={lotNo}
                                onChange={e => setLotNo(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter lot number"
                            />

                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Purok</span>}
                                name="purok"
                                value={purok}
                                onChange={e => setPurok(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter purok"
                            />

                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Street</span>}
                                name="street"
                                value={street}
                                onChange={e => setStreet(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter street name"
                            />

                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Landmark</span>}
                                name="landmark"
                                value={landmark}
                                onChange={e => setLandmark(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter landmark"
                            />

                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Barangay</span>}
                                name="barangay"
                                value={barangay}
                                onChange={e => setBarangay(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter barangay"
                            />

                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Municipality</span>}
                                name="municipality"
                                value={municipality}
                                onChange={e => setMunicipality(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter municipality"
                            />

                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Province</span>}
                                name="province"
                                value={province}
                                onChange={e => setProvince(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter province"
                            />
                        </div>

                        {formError && <div className="text-red-500 text-sm col-span-1 md:col-span-2">{formError}</div>}
                        
                        <div className="flex flex-col md:flex-row gap-2 mt-2 col-span-1 md:col-span-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="lg" 
                                onClick={() => navigate('/admin/users')} 
                                className="w-full md:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="yellow" 
                                size="lg" 
                                loading={showSaving} 
                                disabled={showSaving} 
                                className="w-full md:w-auto md:ml-auto"
                            >
                                {showSaving ? "Creating..." : "Create User"}
                            </Button>
                        </div>
                    </div>
                </Form>
            </PageLayout>
        </AdminLayout>
    );
} 