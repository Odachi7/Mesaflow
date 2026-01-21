'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
    children: React.ReactNode;
    title: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <div className="ml-64">
                <Header title={title} />

                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
