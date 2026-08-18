"use client";

import {
    Company,
} from "@/types/company";


interface CompanyCardProps {
    company: Company;

    onEdit: () => void;
}


export default function CompanyCard({
    company,
    onEdit,
}: CompanyCardProps) {

    return (

        <div
            className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
            "
        >

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div className="flex min-w-0 items-start gap-4">

                    {/* Logo */}

                    {company.logo_url ? (

                        <img
                            src={company.logo_url}
                            alt={company.name}
                            className="
                                h-16
                                w-16
                                shrink-0
                                rounded-2xl
                                border
                                border-slate-100
                                object-cover
                            "
                        />

                    ) : (

                        <div
                            className="
                                flex
                                h-16
                                w-16
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-gradient-to-tr
                                from-brand-600
                                to-indigo-600
                                text-xl
                                font-bold
                                text-white
                            "
                        >

                            {company.name
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                    )}


                    <div className="min-w-0">

                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                            Моя компания
                        </p>


                        <h3 className="mt-1 break-words text-xl font-bold text-slate-900">
                            {company.name}
                        </h3>


                        {company.website && (

                            <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                    mt-1
                                    block
                                    truncate
                                    text-sm
                                    font-medium
                                    text-brand-600
                                    hover:text-brand-700
                                "
                            >
                                {company.website}
                            </a>

                        )}

                    </div>

                </div>


                <button
                    type="button"
                    onClick={onEdit}
                    className="
                        shrink-0
                        rounded-xl
                        bg-slate-100
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-700
                        transition
                        hover:bg-slate-200
                    "
                >
                    Редактировать
                </button>

            </div>


            {company.description && (

                <div className="mt-6 border-t border-slate-100 pt-5">

                    <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                        {company.description}
                    </p>

                </div>

            )}

        </div>
    );
}