import React from 'react';
import Header from '../components/Header';
import MobileNavBar from '../components/MobileNavBar';
import MobileTopBar from '../components/MobileTopBar';

export default function MenuLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#232323] flex flex-col">
            {/* Desktop Header */}
            <div className="hidden md:block">
                <Header />
            </div>
            {/* Mobile Top Bar */}
            <div className="md:hidden">
                <MobileTopBar />
            </div>
            <main className="flex-1 bg-white pt-14 md:pt-0 pb-16 md:pb-0">
                {children}
            </main>
            {/* Mobile Bottom Nav */}
            <MobileNavBar />
        </div>
    );
}
