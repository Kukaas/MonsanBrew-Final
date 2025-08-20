import { useState, useEffect } from 'react';
import Form from '../../components/custom/Form';
import FormInput from '../../components/custom/FormInput';
import { Button } from '../../components/ui/button';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const { isAuthenticated, loading } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registering, setRegistering] = useState(false);
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
        if (!form.name || !form.email || !form.password || !form.confirmPassword) {
            toast.error('Please fill in all fields.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        setRegistering(true);
        try {
            await authAPI.register({
                name: form.name,
                email: form.email,
                password: form.password
            });
            toast.success('Registration successful! Please check your email to verify your account.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            toast.error(err.message || 'Registration failed.');
        } finally {
            setRegistering(false);
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
                        Sign Up
                    </h1>
                    <p className="text-lg text-[#BDBDBD] font-semibold">Create account and choose favorite menu</p>
                </div>
                <Form onSubmit={handleSubmit} className="w-full space-y-6">
                    <FormInput
                        label="Name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                    />
                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="Your email"
                        value={form.email}
                        onChange={handleChange}
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
                        autoComplete="new-password"
                    />
                    <FormInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Your password"
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
                    <Button variant="yellow" type="submit" className="w-full mt-1" size="lg" disabled={registering} loading={registering}>
                        {registering ? 'Registering...' : 'Register'}
                    </Button>
                </Form>
                <div className="mt-6 text-center">
                    <span className="text-white text-sm">Have an account? </span>
                    <Link to="/login" className="text-[#FFC107] font-bold text-sm">Sign In</Link>
                </div>
                <div className="mt-12 text-center text-sm text-[#BDBDBD]">
                    By clicking register, you agree to our <br />
                    <a href="#" className="text-[#FFC107] font-bold">Terms</a> and <a href="#" className="text-[#FFC107] font-bold">Data Policy</a>
                </div>
            </div>
        </div>
    );
}
