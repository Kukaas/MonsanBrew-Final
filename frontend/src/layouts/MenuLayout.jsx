import React from 'react';
import Header from '../components/Header';
import MobileNavBar from '../components/MobileNavBar';
import MobileTopBar from '../components/MobileTopBar';

export default function MenuLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#232323] flex flex-col">
            {/* Desktop Header */}
            <div className="hidden md:block sticky top-0 z-50">
                <Header />
            </div>
            {/* Mobile Top Bar (sticky) */}
            <div className="md:hidden sticky top-0 z-40">
                <MobileTopBar />
            </div>
            {/* Main content: white bg only on md+; scrollable on mobile */}
            <div className="flex-1 w-full overflow-y-auto md:overflow-visible">
                <main className="pt-14 md:pt-0 pb-16 md:pb-0 bg-transparent md:bg-white min-h-0">
                    {children}
                </main>
            </div>
            {/* Mobile Bottom Nav (sticky) */}
            <div className="md:hidden sticky bottom-0 z-40">
                <MobileNavBar />
            </div>
        </div>
    );
}
