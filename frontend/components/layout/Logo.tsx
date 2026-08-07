import Link from "next/link";

export default function Logo() {
    return (
        <Link
            href="/"
            className="flex items-center space-x-3"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xl font-extrabold text-white shadow-md">
                J
            </div>

            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-bold text-transparent">
                JobHub
            </span>
        </Link>
    );
}