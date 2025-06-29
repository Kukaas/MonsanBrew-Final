import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('pending'); // 'pending', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        // Read params only once on mount
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        if (!token || !email) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }
        api.post('/auth/verify-email', { token, email })
            .then(() => {
                setStatus('success');
                setMessage('Your email has been verified! You can now log in.');
                toast.success('Email verified!');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.message || 'Verification failed.');
                toast.error(err.message || 'Verification failed.');
            });
    }, []); // Only run on mount

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#232323] px-4 relative">
            <div className="w-full max-w-md mx-auto flex flex-col items-center">
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
                        Email Verification
                    </h1>
                    <p className="text-lg text-[#BDBDBD] font-semibold">
                        {status === 'pending' && 'Please wait while we verify your email.'}
                        {status === 'success' && 'Your email is now verified!'}
                        {status === 'error' && 'There was a problem verifying your email.'}
                    </p>
                </div>
                {status === 'pending' && (
                    <>
                        <div className="mb-4 animate-spin text-[#FFC107]">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#FFC107" strokeWidth="4" strokeDasharray="60" strokeDashoffset="20" /></svg>
                        </div>
                        <p className="text-lg font-semibold text-white">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle size={64} color="#4BB543" className="mb-4" />
                        <p className="text-2xl font-bold text-white mb-2">Email Verified!</p>
                        <p className="text-[#BDBDBD] mb-6">{message}</p>
                        <Link to="/login" className="bg-[#FFC107] text-white font-bold px-6 py-3 rounded-md text-lg shadow hover:bg-[#e6ac06] transition">Go to Login</Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle size={64} color="#E53935" className="mb-4" />
                        <p className="text-2xl font-bold text-[#E53935] mb-2">Verification Failed</p>
                        <p className="text-[#BDBDBD] mb-6">{message}</p>
                        <Link to="/register" className="bg-[#FFC107] text-white font-bold px-6 py-3 rounded-md text-lg shadow hover:bg-[#e6ac06] transition">Register Again</Link>
                    </>
                )}
            </div>
        </div>
    );
}
