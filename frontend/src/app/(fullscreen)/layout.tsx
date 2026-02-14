export default function FullscreenLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}
