import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                <Link
                    href="/"
                    className="flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
                        J
                    </div>

                    <span className="text-xl font-bold">
                        JobHub
                    </span>
                </Link>

                <nav className="hidden gap-8 md:flex">
                    <Link href="/vacancies" className="hover:text-blue-600">
                        Вакансии
                    </Link>

                    <Link href="/companies" className="hover:text-blue-600">
                        Компании
                    </Link>
                </nav>

                <div className="flex gap-3">
                    <Link
                        href="/login"
                        className="rounded-lg px-4 py-2 hover:bg-slate-100"
                    >
                        Войти
                    </Link>

                    <Link
                        href="/register"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Регистрация
                    </Link>
                </div>

            </div>
        </header>
    );
}