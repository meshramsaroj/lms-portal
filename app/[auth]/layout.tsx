export default function AuthLayout({ children }: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white flex items-center justify-center">
            <div className="w-full max-w-md p-6">
                {children}
            </div>
        </div>
    )

}