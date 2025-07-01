import React, { useState, useEffect } from 'react';
import Form from '../../components/custom/Form';
import FormInput from '../../components/custom/FormInput';
import { Button } from '../../components/ui/button';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const { isAuthenticated, loading } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/');
        }
    }, [loading, isAuthenticated, navigate]);

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
            setTimeout(() => navigate('/'), 1200); // Redirect to home or dashboard
        } catch (err) {
            toast.error(err.message || 'Login failed.');
        } finally {
            setFormLoading(false);
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
                        <a href="#" className="text-[#FFC107] font-bold text-sm">Forgot Password?</a>
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
