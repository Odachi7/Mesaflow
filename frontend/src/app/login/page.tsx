'use client';

import React from 'react';
import { Form, Input, Button, Checkbox, ConfigProvider, theme } from 'antd';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const { token } = theme.useToken();

    const onFinish = async (values: any) => {
        await login(values.email, values.password);
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-white">
            {/* Left Side - Brand Identity (55%) */}
            <div className="hidden lg:flex w-[55%] relative bg-[#0f172a] items-center justify-center overflow-hidden">
                {/* Abstract Waves/Gradients Background */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-0 -left-1/4 w-full h-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 blur-3xl transform rotate-12 scale-150" />
                    <div className="absolute bottom-0 -right-1/4 w-full h-full bg-gradient-to-tl from-purple-500/30 to-blue-500/30 blur-3xl transform -rotate-12 scale-150" />
                </div>

                {/* Glassmorphism Effect Overlay */}
                <div className="absolute inset-0 backdrop-blur-[1px]" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center">
                    {/* Logo Icon - Professional Integrated Design */}
                    <div className="w-28 h-28 mb-8 relative group">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-indigo-600/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500" />

                        {/* Logo container */}
                        <div className="relative w-full h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                            {/* Subtle animated gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 animate-pulse" />

                            {/* Letter M with gradient */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-6xl font-black bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-lg">
                                    M
                                </span>
                            </div>

                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                        MesaFlow
                    </h1>
                    <p className="text-blue-200/80 text-lg max-w-md text-center font-light">
                        Orchestrate your restaurant operations with precision and elegance.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form (45%) */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16 relative">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Sign in to access your workspace</p>
                    </div>

                    <ConfigProvider
                        theme={{
                            token: {
                                colorPrimary: '#2563eb',
                                borderRadius: 8,
                                controlHeight: 48,
                                fontSize: 16,
                            },
                            components: {
                                Input: {
                                    activeBorderColor: '#2563eb',
                                    hoverBorderColor: '#3b82f6',
                                    paddingInline: 16,
                                },
                                Button: {
                                    colorPrimary: '#2563eb',
                                    algorithm: true,
                                    fontWeight: 600,
                                }
                            }
                        }}
                    >
                        <Form
                            name="login"
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                            className="space-y-4"
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Invalid email format' }
                                ]}
                            >
                                <Input
                                    prefix={<User className="w-5 h-5 text-slate-400 mr-2" />}
                                    placeholder="Email address"
                                    className="bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password
                                    prefix={<Lock className="w-5 h-5 text-slate-400 mr-2" />}
                                    placeholder="Password"
                                    className="bg-slate-50 border-slate-200 hover:bg-white focus:bg-white transition-all"
                                />
                            </Form.Item>

                            <div className="flex items-center justify-between mb-6">
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox className="text-slate-600">Remember me</Checkbox>
                                </Form.Item>
                                <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </Link>
                            </div>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    Sign In <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Form.Item>
                        </Form>
                    </ConfigProvider>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500">
                            Get started
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
