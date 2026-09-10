"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    getVacancyTechnologies,
} from "@/services/vacancy";

import {
    Technology,
} from "@/types/vacancy";


interface TechnologySelectorProps {

    value: number[];

    onChange: (
        technologyIds: number[],
    ) => void;

    disabled?: boolean;
}


export default function TechnologySelector({
    value,
    onChange,
    disabled = false,
}: TechnologySelectorProps) {

    const [
        technologies,
        setTechnologies,
    ] = useState<Technology[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );


    useEffect(() => {

        let cancelled = false;


        async function loadTechnologies() {

            try {

                setLoading(true);

                setError(null);


                const response =
                    await getVacancyTechnologies();


                if (!cancelled) {

                    setTechnologies(
                        response,
                    );

                }

            } catch {

                if (!cancelled) {

                    setError(
                        "Не удалось загрузить технологии.",
                    );

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }
        }


        loadTechnologies();


        return () => {

            cancelled = true;

        };

    }, []);


    function toggleTechnology(
        technologyId: number,
    ) {

        if (
            value.includes(
                technologyId,
            )
        ) {

            onChange(
                value.filter(
                    (id) =>
                        id !==
                        technologyId,
                ),
            );

            return;
        }


        onChange([
            ...value,
            technologyId,
        ]);
    }


    return (
        <div>

            <div className="mb-2 flex items-center justify-between">

                <label className="block text-sm font-semibold text-slate-700">
                    Технологии и навыки
                </label>


                {value.length > 0 && (

                    <span className="text-xs font-medium text-brand-600">
                        Выбрано: {value.length}
                    </span>

                )}

            </div>


            {loading && (

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    Загрузка технологий...
                </div>

            )}


            {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>

            )}


            {!loading &&
                !error &&
                technologies.length === 0 && (

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                        Технологии пока не добавлены.
                    </div>

                )}


            {!loading &&
                !error &&
                technologies.length > 0 && (

                    <div className="flex flex-wrap gap-2">

                        {technologies.map(
                            (technology) => {

                                const selected =
                                    value.includes(
                                        technology.id,
                                    );


                                return (
                                    <button
                                        key={
                                            technology.id
                                        }
                                        type="button"
                                        disabled={
                                            disabled
                                        }
                                        onClick={() =>
                                            toggleTechnology(
                                                technology.id,
                                            )
                                        }
                                        className={`
                                            rounded-xl
                                            border
                                            px-3
                                            py-2
                                            text-xs
                                            font-semibold
                                            transition
                                            ${
                                                selected
                                                    ? "border-brand-600 bg-brand-600 text-white"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                                            }
                                            ${
                                                disabled
                                                    ? "cursor-not-allowed opacity-50"
                                                    : ""
                                            }
                                        `}
                                    >
                                        {technology.name}
                                    </button>
                                );

                            },
                        )}

                    </div>

                )}


            {value.length > 0 && (

                <div className="mt-3 flex flex-wrap gap-1.5">

                    {value.map(
                        (technologyId) => {

                            const technology =
                                technologies.find(
                                    (item) =>
                                        item.id ===
                                        technologyId,
                                );


                            if (!technology) {
                                return null;
                            }


                            return (
                                <span
                                    key={
                                        technology.id
                                    }
                                    className="
                                        rounded-lg
                                        bg-brand-50
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-medium
                                        text-brand-700
                                    "
                                >
                                    {technology.name}
                                </span>
                            );

                        },
                    )}

                </div>

            )}

        </div>
    );
}