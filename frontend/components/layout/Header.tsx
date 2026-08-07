"use client";

export default function Header() {
    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}

                <div className="flex cursor-pointer items-center space-x-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-xl font-extrabold text-white shadow-md shadow-brand-500/20">
                        J
                    </div>

                    <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-bold text-transparent">
                        JobHub
                    </span>

                </div>

                {/* Desktop Navigation */}

                <nav className="hidden space-x-8 md:flex">

                    <button className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">

                        💼

                        <span>
                            Вакансии
                        </span>

                    </button>

                    <button className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-600">

                        💻

                        <span>
                            Backend
                        </span>

                    </button>

                    <button className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-600">

                        🖥️

                        <span>
                            Frontend
                        </span>

                    </button>

                    <button className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-600">

                        🎨

                        <span>
                            Дизайн
                        </span>

                    </button>

                </nav>

                {/* Actions */}

                <div className="flex items-center space-x-3">

                    <button className="hidden items-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100 sm:inline-flex">

                        ➕

                        <span>
                            Разместить вакансию
                        </span>

                    </button>

                    <button className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">

                        Войти

                    </button>

                    <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700">

                        Регистрация

                    </button>

                </div>

            </div>

        </header>
    );
}