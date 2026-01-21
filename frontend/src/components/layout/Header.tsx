'use client';

import React from 'react';
import { Input, Badge, Avatar, Dropdown } from 'antd';
import { Search, Bell, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { MenuProps } from 'antd';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const { user, logout } = useAuth();

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <User className="w-4 h-4" />,
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: <Settings className="w-4 h-4" />,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogOut className="w-4 h-4" />,
            onClick: logout,
            danger: true,
        },
    ];

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <Input
                    prefix={<Search className="w-4 h-4 text-gray-400" />}
                    placeholder="Search..."
                    className="w-64"
                    size="large"
                />

                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Badge count={3} size="small">
                        <Bell className="w-5 h-5 text-gray-600" />
                    </Badge>
                </button>

                {/* User Avatar Dropdown */}
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                    <button className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1 pr-3 transition-colors">
                        <Avatar size={36} className="bg-blue-500">
                            {user?.fullName?.[0] || 'U'}
                        </Avatar>
                        <span className="text-sm font-medium text-slate-700 hidden md:block">
                            {user?.fullName || 'User'}
                        </span>
                    </button>
                </Dropdown>
            </div>
        </header>
    );
}
