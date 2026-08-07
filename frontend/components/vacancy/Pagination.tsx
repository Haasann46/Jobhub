"use client";

import { useVacancySearchStore } from "@/store/vacancy-search";

export default function Pagination() {
    const params = useVacancySearchStore(
        (state) => state.params,
    );

    const pages = useVacancySearchStore(
        (state) => state.pages,
    );

    const hasNext = useVacancySearchStore(
        (state) => state.hasNext,
    );

    const hasPrevious = useVacancySearchStore(
        (state) => state.hasPrevious,
    );

    const setPage = useVacancySearchStore(
        (state) => state.setPage,
    );

    if (pages <= 1) {
        return null;
    }

    const currentPage = params.page ?? 1;

    return (
        <div className="flex justify-center items-center gap-2 pt-6">

            <button
                disabled={!hasPrevious}
                onClick={() =>
                    setPage(currentPage - 1)
                }
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition"
            >
                ←
            </button>

            {Array.from(
                { length: pages },
                (_, index) => {

                    const page = index + 1;

                    return (
                        <button
                            key={page}
                            onClick={() =>
                                setPage(page)
                            }
                            className={`w-10 h-10 rounded-xl transition ${
                                page === currentPage
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            {page}
                        </button>
                    );

                },
            )}

            <button
                disabled={!hasNext}
                onClick={() =>
                    setPage(currentPage + 1)
                }
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition"
            >
                →
            </button>

        </div>
    );
}