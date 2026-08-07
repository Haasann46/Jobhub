"use client";

import { useEffect } from "react";

import VacancyCard from "./VacancyCard";

import { getVacancies } from "@/services/vacancy";
import { useVacancySearchStore } from "@/store/vacancy-search";

export default function VacancyList() {
    const params = useVacancySearchStore(
        (state) => state.params,
    );

    const vacancies = useVacancySearchStore(
        (state) => state.vacancies,
    );

    const loading = useVacancySearchStore(
        (state) => state.loading,
    );

    const setLoading = useVacancySearchStore(
        (state) => state.setLoading,
    );

    const setResponse = useVacancySearchStore(
        (state) => state.setResponse,
    );

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);

                const response =
                    await getVacancies(params);

                setResponse(response);
            }
            finally {
                setLoading(false);
            }
        }

        load();
    }, [
        params,
        setLoading,
        setResponse,
    ]);

    if (loading) {
        return (
            <div className="space-y-4">

                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">

                    Загрузка вакансий...

                </div>

            </div>
        );
    }

    if (vacancies.length === 0) {
        return (
            <div className="space-y-4">

                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

                    <div className="text-5xl mb-4">
                        📂
                    </div>

                    <h3 className="text-lg font-bold text-slate-700">
                        Вакансии не найдены
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                        Попробуйте изменить параметры поиска.
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="space-y-4">

            {vacancies.map((vacancy) => (

                <VacancyCard
                    key={vacancy.id}
                    vacancy={vacancy}
                />

            ))}

        </div>
    );
}