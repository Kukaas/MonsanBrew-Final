import React, { useState, useEffect } from 'react';
import Form from '../../components/custom/Form';
import FormInput from '../../components/custom/FormInput';
import { Button } from '../../components/ui/button';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import {
    AlertDialogCancel,
} from '../../components/ui/alert-dialog';
import CustomAlertDialog from '../../components/custom/CustomAlertDialog';

const ForgotPasswordTrigger = React.forwardRef((props, ref) => (
    <button
        ref={ref}
        type="button"
        className="text-[#FFC107] font-bold text-sm px-0 bg-transparent border-0 underline hover:text-[#e6ac06]"
        {...props}
    >
        Forgot Password?
    </button>
));

export default function Login() {
    const { isAuthenticated, loading, user } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotCooldown, setForgotCooldown] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/');
        }
    }, [loading, isAuthenticated, navigate]);

    useEffect(() => {
        let interval;
        if (forgotCooldown > 0) {
            interval = setInterval(() => {
                setForgotCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [forgotCooldown]);

    if (loading || isAuthenticated) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error('Please fill in all fields.');
            return;
        }
        setFormLoading(true);
        try {
            await authAPI.login({
                email: form.email,
                password: form.password
            });
            toast.success('Login successful!');
            setTimeout(() => {
                if (user && user.role) {
                    switch (user.role) {
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
                            navigate('/menus');
                            break;
                        default:
                            navigate('/');
                    }
                } else {
                    navigate('/');
                }
            }, 1200);
        } catch (err) {
            toast.error(err.message || 'Login failed.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        if (!forgotEmail) {
            toast.error('Please enter your email.');
            return;
        }
        // Cooldown logic
        const key = `forgotCooldown_${forgotEmail}`;
        const lastSent = localStorage.getItem(key);
        const now = Date.now();
        if (lastSent && now - parseInt(lastSent, 10) < 60000) {
            const secondsLeft = Math.ceil((60000 - (now - parseInt(lastSent, 10))) / 1000);
            setForgotCooldown(secondsLeft);
            toast.error(`Please wait ${secondsLeft}s before requesting another reset link.`);
            return;
        }
        setForgotLoading(true);
        try {
            await authAPI.forgotPassword(forgotEmail);
            localStorage.setItem(key, now.toString());
            setForgotCooldown(60);
            toast.success('Reset link sent! Check your email.');
            setForgotOpen(false);
            setForgotEmail('');
        } catch (err) {
            toast.error(err.message || 'Failed to send reset link.');
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#232323] px-4 relative">
            <Link to="/" className="absolute left-6 top-6 text-white hover:text-[#FFC107] transition-colors" aria-label="Back">
                <ArrowLeft size={36} />
            </Link>
            <div className="w-full max-w-md mx-auto flex flex-col items-center">
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
                        Welcome Back <span role="img" aria-label="wave">👋</span>
                    </h1>
                    <p className="text-lg text-[#BDBDBD] font-semibold">Sign in to your account</p>
                </div>
                <CustomAlertDialog
                    open={forgotOpen}
                    onOpenChange={setForgotOpen}
                    trigger={null}
                    title="Forgot Password"
                    description={"Enter your email address and we'll send you a link to reset your password."}
                    actions={
                        <>
                            <AlertDialogCancel type="button" className="h-10">Cancel</AlertDialogCancel>
                            <Button type="submit" variant="yellow" size="lg" disabled={forgotLoading || forgotCooldown > 0} form="forgot-form">
                                {forgotLoading ? 'Sending...' : forgotCooldown > 0 ? `Wait ${forgotCooldown}s` : 'Send Reset Link'}
                            </Button>
                        </>
                    }
                >
                    <form id="forgot-form" onSubmit={handleForgot} className="space-y-4 mt-2">
                        <FormInput
                            label="Email"
                            name="forgotEmail"
                            type="email"
                            placeholder="Your email"
                            value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </form>
                </CustomAlertDialog>
                <Form onSubmit={handleSubmit} className="w-full space-y-6">
                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="Your email"
                        value={form.email}
                        onChange={handleChange}
                        inputClassName=""
                        autoComplete="email"
                    />
                    <FormInput
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Your password"
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
                        autoComplete="current-password"
                    />
                    <div className="flex flex-col items-start gap-2">
                        <button
                            type="button"
                            className="text-[#FFC107] font-bold text-sm px-0 bg-transparent border-0 underline hover:text-[#e6ac06]"
                            onClick={() => setForgotOpen(true)}
                        >
                            Forgot Password?
                        </button>
                        <Button variant="yellow" type="submit" size="lg" className="w-full mt-1" disabled={formLoading}>
                            {formLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </div>
                </Form>
                <div className="mt-8 text-center">
                    <span className="text-white text-sm">Don't have an account? </span>
                    <Link to="/register" className="text-[#FFC107] font-bold text-sm">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
