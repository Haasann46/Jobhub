"use client";

import { useEffect, useState } from "react";

import { getVacancyById } from "@/services/vacancy";
import { Vacancy } from "@/types/vacancy";


interface UseVacancyResult {
    vacancy: Vacancy | null;
    loading: boolean;
    error: string | null;
}


export function useVacancy(
    vacancyId: string | undefined,
): UseVacancyResult {

    const [vacancy, setVacancy] =
        useState<Vacancy | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);


    useEffect(() => {

        if (!vacancyId) {

            setVacancy(null);
            setLoading(false);
            setError("Вакансия не найдена.");

            return;
        }


        let cancelled = false;


        async function loadVacancy() {

            try {

                setLoading(true);
                setError(null);

                const data =
                    await getVacancyById(vacancyId);


                if (!cancelled) {

                    setVacancy(data);

                }

            } catch (error: unknown) {

                if (cancelled) {
                    return;
                }


                setVacancy(null);


                if (
                    error instanceof Error &&
                    error.message === "Vacancy not found"
                ) {

                    setError(
                        "Вакансия не найдена.",
                    );

                } else {

                    setError(
                        "Не удалось загрузить вакансию.",
                    );

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }


        loadVacancy();


        return () => {

            cancelled = true;

        };

    }, [vacancyId]);


    return {
        vacancy,
        loading,
        error,
    };
}