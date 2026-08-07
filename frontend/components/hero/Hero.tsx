import SearchBar from "@/components/search/SearchBar";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 py-14 text-white sm:px-6">

            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center">

                <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-400 backdrop-blur-sm">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />

                    Платформа поиска IT-специалистов

                </span>

                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
                    Найди работу мечты или лучших разработчиков
                </h1>

                <p className="mx-auto max-w-2xl text-sm text-slate-400 sm:text-base">
                    Тысячи актуальных вакансий в сфере Backend,
                    Frontend, DevOps и дизайна с прямой связью
                    с работодателями.
                </p>

                <SearchBar />

            </div>

        </section>
    );
}