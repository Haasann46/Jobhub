"use client";

import {
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { Vacancy } from "@/types/vacancy";

import {
    formatExperience,
    formatPublishedDate,
    formatSalary,
} from "@/utils/vacancy";

import {
    useAuthStore,
} from "@/store/auth";

import JobApplyModal from "@/components/modal/JobApplyModal";


interface VacancyCardProps {
    vacancy: Vacancy;
}


export default function VacancyCard({
    vacancy,
}: VacancyCardProps) {

    const router = useRouter();


    const [
        applyModalOpen,
        setApplyModalOpen,
    ] = useState(false);


    const user = useAuthStore(
        (state) => state.user,
    );

    const isAuthenticated =
        useAuthStore(
            (state) => state.isAuthenticated,
        );


    const handleApply = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {

        event.stopPropagation();


        if (!isAuthenticated) {

            /*
             * Пока пользователь не авторизован,
             * открываем auth modal через Header.
             *
             * На следующем проходе можно вынести
             * auth modal в глобальный provider.
             */

            return;
        }


        if (user?.role !== "candidate") {
            return;
        }


        setApplyModalOpen(true);
    };


    return (
        <>

            <article
                onClick={() =>
                    router.push(
                        `/vacancies/${vacancy.id}`,
                    )
                }
                className="
                    group
                    cursor-pointer
                    rounded-2xl
                    border
                    border-slate-200/80
                    bg-white
                    p-6
                    transition-all
                    hover:border-brand-500/50
                    hover:shadow-lg
                    hover:shadow-slate-100
                "
            >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-4">

                        {vacancy.company_logo ? (

                            <img
                                src={vacancy.company_logo}
                                alt={vacancy.company_name}
                                className="h-12 w-12 rounded-xl border border-slate-100 object-cover"
                            />

                        ) : (

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-sm font-bold text-white">

                                {vacancy.company_name
                                    .charAt(0)
                                    .toUpperCase()}

                            </div>

                        )}

                        <div>

                            <div className="flex items-center gap-2">

                                <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600">

                                    {vacancy.category}

                                </span>

                                <span className="text-xs text-slate-400">

                                    {formatPublishedDate(
                                        vacancy.published_at,
                                    )}

                                </span>

                            </div>

                            <h3 className="mt-0.5 text-base font-bold text-slate-900 transition group-hover:text-brand-600 sm:text-lg">

                                {vacancy.title}

                            </h3>

                            <p className="text-xs font-medium text-slate-500">

                                {vacancy.company_name}
                                {" • "}
                                {vacancy.location}

                            </p>

                        </div>

                    </div>


                    <div className="text-left sm:text-right">

                        <span className="block text-base font-extrabold text-slate-900">

                            {formatSalary(
                                vacancy.salary_from,
                                vacancy.salary_to,
                            )}

                        </span>

                        <span className="mt-1 inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">

                            {formatExperience(
                                vacancy.experience_level,
                            )}

                        </span>

                    </div>

                </div>


                <div className="mt-4 border-t border-slate-100 pt-4">

                    <div className="flex flex-wrap items-center justify-between gap-3">

                        <div className="flex flex-wrap gap-1.5">

                            {vacancy.technologies.map(
                                (technology) => (

                                    <span
                                        key={technology.id}
                                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                                    >
                                        {technology.name}
                                    </span>

                                ),
                            )}

                        </div>


                        <button
                            type="button"
                            onClick={handleApply}
                            className="
                                rounded-xl
                                bg-brand-600
                                px-3.5
                                py-1.5
                                text-xs
                                font-semibold
                                text-white
                                transition
                                hover:bg-brand-700
                            "
                        >
                            Откликнуться
                        </button>

                    </div>

                </div>

            </article>


            {isAuthenticated &&
                user?.role === "candidate" && (

                    <JobApplyModal
                        isOpen={
                            applyModalOpen
                        }
                        vacancyId={
                            vacancy.id
                        }
                        vacancyTitle={
                            vacancy.title
                        }
                        onClose={() =>
                            setApplyModalOpen(
                                false,
                            )
                        }
                    />

                )}

        </>
    );
}