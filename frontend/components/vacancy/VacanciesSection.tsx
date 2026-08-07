"use client";

import Sidebar from "@/components/search/filters/Sidebar";

import VacancyList from "./VacancyList";
import Pagination from "./Pagination";

import { useVacancySearchStore } from "@/store/vacancy-search";
import { VacancySort } from "@/types/vacancy";

export default function VacanciesSection() {

    const total = useVacancySearchStore(
        (state) => state.total,
    );

    const params = useVacancySearchStore(
        (state) => state.params,
    );

    const setSort = useVacancySearchStore(
        (state) => state.setSort,
    );

    return (

        <main className="mx-auto flex-grow max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">

                <Sidebar />

                <section className="space-y-4 lg:col-span-3">

                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">

                        <p className="text-sm font-medium text-slate-500">

                            Found jobs:

                            <span className="ml-1 font-bold text-slate-900">

                                {total}

                            </span>

                        </p>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

                            <span>
                                Sort:
                            </span>

                            <select
                                value={params.sort}
                                onChange={(e) =>
                                    setSort(
                                        e.target.value as VacancySort,
                                    )
                                }
                                className="
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    px-2.5
                                    py-1
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    transition
                                    focus:border-brand-500
                                "
                            >

                                <option value="newest">
                                    Newest
                                </option>

                                <option value="oldest">
                                    Oldest
                                </option>

                                <option value="salary_desc">
                                    Highest salary
                                </option>

                                <option value="salary_asc">
                                    Lowest salary
                                </option>

                            </select>

                        </div>

                    </div>

                    <VacancyList />

                    <Pagination />

                </section>

            </div>

        </main>

    );

}