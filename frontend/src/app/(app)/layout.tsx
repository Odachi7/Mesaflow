'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <div className="ml-64">
                <Header />

                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
