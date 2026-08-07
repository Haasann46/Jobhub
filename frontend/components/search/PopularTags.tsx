"use client";

import { useVacancySearchStore } from "@/store/vacancy-search";

const tags = [
    "Python",
    "FastAPI",
    "React",
];

export default function PopularTags() {
    const setDraftSearch = useVacancySearchStore(
        (state) => state.setDraftSearch,
    );

    const setDraftLocation = useVacancySearchStore(
        (state) => state.setDraftLocation,
    );

    const applySearch = useVacancySearchStore(
        (state) => state.applySearch,
    );

    return (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">

            <span className="text-sm text-slate-500">
                Популярные технологии:
            </span>

            {tags.map((tag) => (
                <button
                    key={tag}
                    onClick={() => {
                        setDraftLocation("");
                        setDraftSearch(tag);
                        applySearch();
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm transition hover:border-blue-500 hover:text-blue-600"
                >
                    {tag}
                </button>
            ))}

        </div>
    );
}