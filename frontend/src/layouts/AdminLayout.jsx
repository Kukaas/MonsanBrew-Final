import React from "react";
import {
    SidebarProvider,
    Sidebar,
    SidebarInset,
} from "../components/ui/sidebar";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

export default function AdminLayout({ children }) {
    return (
        <SidebarProvider>
            <Sidebar>
                <AdminSidebar />
            </Sidebar>
            <SidebarInset>
                <AdminHeader />
                <main className="flex-1 p-6 md:p-10 bg-[#232323]">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
