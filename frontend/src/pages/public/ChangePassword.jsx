import { useState } from 'react';
import Form from '../../components/custom/Form';
import FormInput from '../../components/custom/FormInput';
import { Button } from '../../components/ui/button';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

export default function ChangePassword() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changing, setChanging] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            toast.error('Please fill in all fields.');
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }
        if (form.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long.');
            return;
        }
        setChanging(true);
        try {
            await authAPI.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            });
            toast.success('Password changed successfully!');

            // Fetch updated user data to get the new hasChangedPassword status
            const updatedUserData = await authAPI.me();
            updateUser(updatedUserData.user);

            // Redirect based on user role
            setTimeout(() => {
                switch (user?.role) {
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    case 'rider':
                        navigate('/rider/dashboard');
                        break;
                    case 'frontdesk':
                        navigate('/frontdesk/dashboard');
                        break;
                    case 'customer':
                        navigate('/?is_from_login=true');
                        break;
                    default:
                        navigate('/');
                }
            }, 1500);
        } catch (err) {
            toast.error(err.message || 'Failed to change password.');
        } finally {
            setChanging(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#232323] px-4">
            <div className="w-full max-w-md mx-auto flex flex-col items-center">
                <div className="mb-8 text-center">
                    <div className="mb-4 flex justify-center">
                        <Shield size={64} className="text-[#FFC107]" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-2">
                        Change Password
                    </h1>
                    <p className="text-lg text-[#BDBDBD] font-semibold">
                        For security, please change your password
                    </p>
                </div>

                <Form onSubmit={handleSubmit} className="w-full space-y-6">
                    <FormInput
                        label="Current Password"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        value={form.currentPassword}
                        onChange={handleChange}
                        endIcon={
                            <button
                                type="button"
                                tabIndex={-1}
                                className="focus:outline-none flex items-center justify-center"
                                style={{ width: 32, height: 32 }}
                                onClick={() => setShowCurrentPassword((v) => !v)}
                                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                            >
                                {showCurrentPassword ? <EyeOff size={20} color="#BDBDBD" /> : <Eye size={20} color="#BDBDBD" />}
                            </button>
                        }
                        autoComplete="current-password"
                    />
                    <FormInput
                        label="New Password"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        value={form.newPassword}
                        onChange={handleChange}
                        endIcon={
                            <button
                                type="button"
                                tabIndex={-1}
                                className="focus:outline-none flex items-center justify-center"
                                style={{ width: 32, height: 32 }}
                                onClick={() => setShowNewPassword((v) => !v)}
                                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                                {showNewPassword ? <EyeOff size={20} color="#BDBDBD" /> : <Eye size={20} color="#BDBDBD" />}
                            </button>
                        }
                        autoComplete="new-password"
                    />
                    <FormInput
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        endIcon={
                            <button
                                type="button"
                                tabIndex={-1}
                                className="focus:outline-none flex items-center justify-center"
                                style={{ width: 32, height: 32 }}
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <EyeOff size={20} color="#BDBDBD" /> : <Eye size={20} color="#BDBDBD" />}
                            </button>
                        }
                        autoComplete="new-password"
                    />
                    <Button
                        type="submit"
                        variant="yellow"
                        className="w-full text-lg font-bold py-3"
                        disabled={changing}
                        loading={changing}
                    >
                        Change Password
                    </Button>
                </Form>
            </div>
        </div>
    );
}
