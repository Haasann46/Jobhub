"use client";

import Link from "next/link";

import {
    useEffect,
    useState,
} from "react";

import {
    getCompanyById,
} from "@/services/company";

import {
    getCompanyVacancies,
} from "@/services/vacancy";

import {
    Company,
} from "@/types/company";

import {
    Vacancy,
} from "@/types/vacancy";


interface CompanyPageProps {
    params: Promise<{
        id: string;
    }>;
}


export default function CompanyPage({
    params,
}: CompanyPageProps) {

    const [
        company,
        setCompany,
    ] = useState<Company | null>(null);


    const [
        vacancies,
        setVacancies,
    ] = useState<Vacancy[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<string | null>(null);


    useEffect(() => {

        async function loadCompany() {

            try {

                setLoading(true);

                setError(null);


                const {
                    id,
                } = await params;


                const companyId =
                    Number(id);


                if (
                    !Number.isInteger(
                        companyId,
                    ) ||
                    companyId <= 0
                ) {

                    setError(
                        "Некорректный ID компании.",
                    );

                    return;
                }


                /*
                 * ==================================================
                 * Компания
                 * ==================================================
                 */

                const companyData =
                    await getCompanyById(
                        companyId,
                    );


                setCompany(
                    companyData,
                );


                /*
                 * ==================================================
                 * Вакансии компании
                 * ==================================================
                 */

                const companyVacancies =
                    await getCompanyVacancies(
                        companyId,
                    );


                setVacancies(
                    companyVacancies,
                );

            } catch (error: any) {

                const detail =
                    error?.response?.data?.detail;


                setError(
                    detail ??
                    "Не удалось загрузить компанию.",
                );

            } finally {

                setLoading(false);

            }
        }


        loadCompany();

    }, [params]);


    /*
     * ============================================================
     * Loading
     * ============================================================
     */

    if (loading) {

        return (

            <main
                className="
                    mx-auto
                    max-w-7xl
                    px-4
                    py-10
                    sm:px-6
                    lg:px-8
                "
            >

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        px-8
                        py-10
                        text-center
                        text-sm
                        text-slate-500
                        shadow-sm
                    "
                >
                    Загрузка компании...
                </div>

            </main>
        );
    }


    /*
     * ============================================================
     * Error
     * ============================================================
     */

    if (
        error ||
        !company
    ) {

        return (

            <main
                className="
                    mx-auto
                    max-w-7xl
                    px-4
                    py-10
                    sm:px-6
                    lg:px-8
                "
            >

                <div
                    className="
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        px-8
                        py-10
                        text-center
                    "
                >

                    <h1
                        className="
                            text-xl
                            font-bold
                            text-slate-900
                        "
                    >
                        Компания не найдена
                    </h1>


                    <p
                        className="
                            mt-2
                            text-sm
                            text-red-600
                        "
                    >
                        {error ??
                            "Компания не существует."}
                    </p>


                    <Link
                        href="/"
                        className="
                            mt-6
                            inline-flex
                            rounded-xl
                            bg-brand-600
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-brand-700
                        "
                    >
                        На главную
                    </Link>

                </div>

            </main>
        );
    }


    /*
     * ============================================================
     * Public Company Page
     * ============================================================
     */

    return (

        <main
            className="
                mx-auto
                max-w-7xl
                px-4
                py-8
                sm:px-6
                lg:px-8
            "
        >

            {/* ================================================== */}
            {/* Company Header */}
            {/* ================================================== */}

            <section
                className="
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                    sm:p-8
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-6
                        sm:flex-row
                        sm:items-start
                    "
                >

                    {/* Logo */}

                    {company.logo_url ? (

                        <img
                            src={company.logo_url}
                            alt={company.name}
                            className="
                                h-24
                                w-24
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
                                h-24
                                w-24
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-gradient-to-tr
                                from-brand-600
                                to-indigo-600
                                text-3xl
                                font-bold
                                text-white
                            "
                        >

                            {company.name
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                    )}


                    {/* Main information */}

                    <div
                        className="
                            min-w-0
                            flex-1
                        "
                    >

                        <p
                            className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wide
                                text-brand-600
                            "
                        >
                            Компания
                        </p>


                        <h1
                            className="
                                mt-1
                                break-words
                                text-3xl
                                font-bold
                                tracking-tight
                                text-slate-900
                            "
                        >
                            {company.name}
                        </h1>


                        {/* Industry */}

                        {company.industry && (

                            <p
                                className="
                                    mt-2
                                    text-sm
                                    font-medium
                                    text-slate-500
                                "
                            >
                                {company.industry}
                            </p>

                        )}


                        {/* Website */}

                        {company.website && (

                            <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                    mt-3
                                    inline-flex
                                    break-all
                                    text-sm
                                    font-semibold
                                    text-brand-600
                                    hover:text-brand-700
                                "
                            >
                                {company.website}
                            </a>

                        )}

                    </div>

                </div>


                {/* ================================================== */}
                {/* Description */}
                {/* ================================================== */}

                {company.description && (

                    <div
                        className="
                            mt-8
                            border-t
                            border-slate-100
                            pt-7
                        "
                    >

                        <h2
                            className="
                                text-lg
                                font-bold
                                text-slate-900
                            "
                        >
                            О компании
                        </h2>


                        <p
                            className="
                                mt-3
                                whitespace-pre-line
                                text-sm
                                leading-7
                                text-slate-600
                            "
                        >
                            {company.description}
                        </p>

                    </div>

                )}


                {/* ================================================== */}
                {/* Additional Company Information */}
                {/* ================================================== */}

                {(company.size ||
                    company.address) && (

                    <div
                        className="
                            mt-8
                            grid
                            gap-4
                            border-t
                            border-slate-100
                            pt-7
                            sm:grid-cols-2
                        "
                    >

                        {/* Size */}

                        {company.size && (

                            <div
                                className="
                                    rounded-2xl
                                    bg-slate-50
                                    p-5
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    "
                                >
                                    Размер компании
                                </p>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        font-semibold
                                        text-slate-800
                                    "
                                >
                                    {company.size}
                                </p>

                            </div>

                        )}


                        {/* Address */}

                        {company.address && (

                            <div
                                className="
                                    rounded-2xl
                                    bg-slate-50
                                    p-5
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    "
                                >
                                    Адрес
                                </p>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        font-semibold
                                        text-slate-800
                                    "
                                >
                                    {company.address}
                                </p>

                            </div>

                        )}

                    </div>

                )}

            </section>


            {/* ================================================== */}
            {/* Company Vacancies */}
            {/* ================================================== */}

            <section
                className="
                    mt-8
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                    sm:p-8
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-2
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    "
                >

                    <div>

                        <p
                            className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wide
                                text-brand-600
                            "
                        >
                            JobHub
                        </p>


                        <h2
                            className="
                                mt-1
                                text-2xl
                                font-bold
                                text-slate-900
                            "
                        >
                            Вакансии компании
                        </h2>

                    </div>


                    <p
                        className="
                            text-sm
                            text-slate-500
                        "
                    >
                        {vacancies.length === 0
                            ? "Пока нет открытых вакансий"
                            : `${vacancies.length} ${vacancies.length === 1 ? "вакансия" : vacancies.length < 5 ? "вакансии" : "вакансий"}`
                        }
                    </p>

                </div>


                {/* ================================================== */}
                {/* Empty */}
                {/* ================================================== */}

                {vacancies.length === 0 && (

                    <div
                        className="
                            mt-6
                            rounded-2xl
                            border
                            border-dashed
                            border-slate-200
                            bg-slate-50
                            px-6
                            py-10
                            text-center
                        "
                    >

                        <p
                            className="
                                text-sm
                                font-medium
                                text-slate-600
                            "
                        >
                            У этой компании сейчас
                            нет открытых вакансий.
                        </p>

                    </div>

                )}


                {/* ================================================== */}
                {/* Vacancies */}
                {/* ================================================== */}

                {vacancies.length > 0 && (

                    <div
                        className="
                            mt-6
                            grid
                            gap-4
                        "
                    >

                        {vacancies.map(
                            (
                                vacancy,
                            ) => (

                                <Link
                                    key={
                                        vacancy.id
                                    }
                                    href={`/vacancies/${vacancy.id}`}
                                    className="
                                        block
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        p-5
                                        transition
                                        hover:border-brand-300
                                        hover:shadow-sm
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-4
                                            sm:flex-row
                                            sm:items-start
                                            sm:justify-between
                                        "
                                    >

                                        <div
                                            className="
                                                min-w-0
                                            "
                                        >

                                            <h3
                                                className="
                                                    break-words
                                                    text-lg
                                                    font-bold
                                                    text-slate-900
                                                "
                                            >
                                                {
                                                    vacancy.title
                                                }
                                            </h3>


                                            <p
                                                className="
                                                    mt-1
                                                    text-sm
                                                    font-medium
                                                    text-brand-600
                                                "
                                            >
                                                {
                                                    vacancy.company_name
                                                }
                                            </p>


                                            <div
                                                className="
                                                    mt-3
                                                    flex
                                                    flex-wrap
                                                    gap-2
                                                "
                                            >

                                                {vacancy.location && (

                                                    <span
                                                        className="
                                                            rounded-lg
                                                            bg-slate-100
                                                            px-2.5
                                                            py-1
                                                            text-xs
                                                            font-medium
                                                            text-slate-600
                                                        "
                                                    >
                                                        {
                                                            vacancy.location
                                                        }
                                                    </span>

                                                )}


                                                {vacancy.is_remote && (

                                                    <span
                                                        className="
                                                            rounded-lg
                                                            bg-emerald-50
                                                            px-2.5
                                                            py-1
                                                            text-xs
                                                            font-medium
                                                            text-emerald-700
                                                        "
                                                    >
                                                        Remote
                                                    </span>

                                                )}


                                                {vacancy.employment_type && (

                                                    <span
                                                        className="
                                                            rounded-lg
                                                            bg-slate-100
                                                            px-2.5
                                                            py-1
                                                            text-xs
                                                            font-medium
                                                            text-slate-600
                                                        "
                                                    >
                                                        {
                                                            vacancy.employment_type
                                                        }
                                                    </span>

                                                )}

                                            </div>

                                        </div>


                                        {/* Salary */}

                                        {(vacancy.salary_from !== null ||
                                            vacancy.salary_to !== null) && (

                                            <div
                                                className="
                                                    shrink-0
                                                    text-left
                                                    sm:text-right
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-xs
                                                        font-semibold
                                                        uppercase
                                                        tracking-wide
                                                        text-slate-400
                                                    "
                                                >
                                                    Зарплата
                                                </p>


                                                <p
                                                    className="
                                                        mt-1
                                                        text-sm
                                                        font-bold
                                                        text-slate-900
                                                    "
                                                >

                                                    {vacancy.salary_from !== null &&
                                                        vacancy.salary_to !== null
                                                        ? `${vacancy.salary_from.toLocaleString()} – ${vacancy.salary_to.toLocaleString()}`
                                                        : vacancy.salary_from !== null
                                                            ? `от ${vacancy.salary_from.toLocaleString()}`
                                                            : `до ${vacancy.salary_to?.toLocaleString()}`
                                                    }

                                                </p>

                                            </div>

                                        )}

                                    </div>

                                </Link>

                            ),
                        )}

                    </div>

                )}

            </section>

        </main>
    );
}