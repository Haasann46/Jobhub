export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-24 text-white">

            <div className="absolute inset-0 opacity-10">
                <div
                    className="h-full w-full"
                    style={{
                        backgroundImage:
                            "radial-gradient(#3b82f6 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                    }}
                />
            </div>

            <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center">

                <div className="mb-6 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                    🚀 Платформа поиска IT-специалистов
                </div>

                <h1 className="max-w-4xl text-5xl font-extrabold leading-tight md:text-6xl">
                    Найди работу мечты
                    <br />
                    или лучших разработчиков
                </h1>

                <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
                    Современная платформа для поиска вакансий,
                    общения работодателей и кандидатов,
                    а также удобного управления карьерой.
                </p>

            </div>

        </section>
    );
}