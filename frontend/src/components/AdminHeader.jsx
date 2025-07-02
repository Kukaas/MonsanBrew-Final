import React from "react";
import { SidebarTrigger } from "./ui/sidebar";

export default function AdminHeader() {
    return (
        <header className="flex items-center h-16 bg-[#232323] border-b border-[#181818] px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="p-2 rounded bg-[#181818] text-white shadow-lg" />
                <h1 className="text-lg font-bold text-white">Documents</h1>
            </div>
        </header>
    );
}
