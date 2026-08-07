"use client";

import { useVacancySearchStore } from "@/store/vacancy-search";

export default function Sidebar() {
    const employmentType = useVacancySearchStore(
        (state) => state.params.employment_type,
    );

    const experienceLevel = useVacancySearchStore(
        (state) => state.params.experience_level,
    );

    const isRemote = useVacancySearchStore(
        (state) => state.params.is_remote,
    );

    const setEmploymentType = useVacancySearchStore(
        (state) => state.setEmploymentType,
    );

    const setExperienceLevel = useVacancySearchStore(
        (state) => state.setExperienceLevel,
    );

    const setRemote = useVacancySearchStore(
        (state) => state.setRemote,
    );

    const reset = useVacancySearchStore(
        (state) => state.reset,
    );

    const salaryFrom = useVacancySearchStore(
        (state) => state.params.salary_from,
    );

    const salaryTo = useVacancySearchStore(
        (state) => state.params.salary_to,
    );

    const setSalaryFrom = useVacancySearchStore(
        (state) => state.setSalaryFrom,
    );

    const setSalaryTo = useVacancySearchStore(
        (state) => state.setSalaryTo,
    );

    return (
        <aside className="lg:col-span-1 space-y-6">

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">

                <div className="flex justify-between items-center pb-4 border-b border-slate-100">

                    <h3 className="font-bold text-slate-800 text-base">
                        Фильтры
                    </h3>

                    <button
                        onClick={reset}
                        className="text-xs text-blue-600 hover:underline font-medium"
                    >
                        Сбросить
                    </button>

                </div>

                <div>

                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Тип занятости
                    </label>

                    <div className="space-y-2">

                        <label className="flex items-center gap-2 cursor-pointer">

                            <input
                                type="radio"
                                checked={!employmentType}
                                onChange={() =>
                                    setEmploymentType(undefined)
                                }
                            />

                            Любой

                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">

                            <input
                                type="radio"
                                checked={
                                    employmentType ===
                                    "full_time"
                                }
                                onChange={() =>
                                    setEmploymentType(
                                        "full_time",
                                    )
                                }
                            />

                            Полный день

                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">

                            <input
                                type="radio"
                                checked={
                                    employmentType ===
                                    "part_time"
                                }
                                onChange={() =>
                                    setEmploymentType(
                                        "part_time",
                                    )
                                }
                            />

                            Частичная занятость

                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">

                            <input
                                type="radio"
                                checked={
                                    employmentType ===
                                    "contract"
                                }
                                onChange={() =>
                                    setEmploymentType(
                                        "contract",
                                    )
                                }
                            />

                            Контракт

                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">

                            <input
                                type="radio"
                                checked={
                                    employmentType ===
                                    "internship"
                                }
                                onChange={() =>
                                    setEmploymentType(
                                        "internship",
                                    )
                                }
                            />

                            Стажировка

                        </label>

                    </div>

                </div>

                <div>

                    <div>

                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">

                            Зарплата

                        </label>

                        <div className="grid grid-cols-2 gap-3">

                            <input
                                type="number"
                                placeholder="От"
                                value={salaryFrom ?? ""}
                                onChange={(e) =>
                                    setSalaryFrom(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : undefined,
                                    )
                                }
                                className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-3
                                    py-2
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-brand-500
                                "
                            />

                            <input
                                type="number"
                                placeholder="До"
                                value={salaryTo ?? ""}
                                onChange={(e) =>
                                    setSalaryTo(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : undefined,
                                    )
                                }
                                className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-3
                                    py-2
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-brand-500
                                "
                            />

                        </div>

                    </div>

                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Опыт
                    </label>

                    <div className="space-y-2">

                        <label className="flex items-center gap-2 cursor-pointer">

                            <input
                                type="radio"
                                checked={!experienceLevel}
                                onChange={() =>
                                    setExperienceLevel(
                                        undefined,
                                    )
                                }
                            />

                            Любой

                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">

                            <input
                                type="radio"
                                checked={
                                    experienceLevel ===
                                    "junior"
                                }
                                onChange={() =>
                                    setExperienceLevel(
                                        "junior",
                                    )
                                }
                            />

                            Junior

                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">

                            <input
                                type="radio"
                                checked={
                                    experienceLevel ===
                                    "middle"
                                }
                                onChange={() =>
                                    setExperienceLevel(
                                        "middle",
                                    )
                                }
                            />

                            Middle

                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">

                            <input
                                type="radio"
                                checked={
                                    experienceLevel ===
                                    "senior"
                                }
                                onChange={() =>
                                    setExperienceLevel(
                                        "senior",
                                    )
                                }
                            />

                            Senior

                        </label>

                    </div>

                </div>

                <label
                    className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        p-3
                        transition
                        hover:bg-slate-100
                        cursor-pointer
                    "
                >

                    <span>
                        Только удаленная работа
                    </span>

                    <input
                        type="checkbox"
                        checked={!!isRemote}
                        onChange={(e) =>
                            setRemote(
                                e.target.checked,
                            )
                        }
                    />

                </label>

            </div>

        </aside>
    );
}