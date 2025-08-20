import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Form from '../../components/custom/Form';
import FormInput from '../../components/custom/FormInput';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { authAPI } from '../../services/api';
import { ArrowLeft, Eye, EyeOff, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/custom/LoadingSpinner';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [resetting, setResetting] = useState(false);
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [validating, setValidating] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setError('Invalid or expired reset link.');
            setValidating(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                await authAPI.verifyResetToken(token);
            } catch (err) {
                if (!cancelled) {
                    const msg = err?.response?.data?.message || err.message || 'Invalid or expired reset link.';
                    setError(msg);
                }
            } finally {
                if (!cancelled) setValidating(false);
            }
        })();
        return () => { cancelled = true; };
    }, [token, email]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.password || !form.confirmPassword) {
            toast.error('Please fill in all fields.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (!token || !email) {
            setError('Invalid or expired reset link.');
            toast.error('Invalid or expired reset link.');
            return;
        }
        setResetting(true);
        setError('');
        try {
            await authAPI.resetPassword({ token, email, password: form.password });
            setSuccess(true);
            toast.success('Password reset successful! You can now log in.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Password reset failed.';
            setError(msg);
            toast.error(msg);
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#232323] px-4 relative">
            {!error && !validating && (
                <Link to="/login" className="absolute left-6 top-6 text-white hover:text-[#FFC107] transition-colors" aria-label="Back">
                    <ArrowLeft size={36} />
                </Link>
            )}
            <div className="w-full max-w-md mx-auto flex flex-col items-center">
                {!error && !validating && (
                    <div className="mb-8 text-center">
                        <h1 className="text-5xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
                            Reset Password
                        </h1>
                        <p className="text-lg text-[#BDBDBD] font-semibold">Enter your new password below</p>
                    </div>
                )}
                {validating ? (
                    <LoadingSpinner message="Validating reset link..." />
                ) : error ? (
                    <div className="w-full flex flex-col items-center justify-center mb-4 p-6 rounded bg-[#2d2323] border border-[#E53935] text-center">
                        <XCircle size={64} color="#E53935" className="mb-4" />
                        <div className="text-2xl font-bold text-[#E53935] mb-2">Reset Link Invalid</div>
                        <div className="text-[#BDBDBD] mb-6 font-semibold">{error}</div>
                        <Link to="/login" className="bg-[#FFC107] text-white font-bold px-6 py-3 rounded-md text-lg shadow hover:bg-[#e6ac06] transition">Go to Login</Link>
                    </div>
                ) : success ? (
                    <LoadingSpinner message="Redirecting to login..." />
                ) : (
                    <Form onSubmit={handleSubmit} className="w-full space-y-6">
                        <FormInput
                            label="New Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New password"
                            value={form.password}
                            onChange={handleChange}
                            endIcon={
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="focus:outline-none flex items-center justify-center"
                                    style={{ width: 32, height: 32 }}
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={20} color="#BDBDBD" /> : <Eye size={20} color="#BDBDBD" />}
                                </button>
                            }
                            autoComplete="new-password"
                        />
                        <FormInput
                            label="Confirm New Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
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
                        <Button variant="yellow" type="submit" className="w-full mt-1" size="lg" disabled={resetting} loading={resetting}>
                            {resetting ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </Form>
                )}
            </div>
        </div>
    );
}
