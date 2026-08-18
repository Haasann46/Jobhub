"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    createVacancy,
} from "@/services/vacancy";

import {
    useAuthStore,
} from "@/store/auth";


type EmploymentType =
    | "full_time"
    | "part_time"
    | "contract"
    | "internship";


type ExperienceLevel =
    | "junior"
    | "middle"
    | "senior";


const categories = [
    {
        value: "backend",
        label: "Backend",
    },
    {
        value: "frontend",
        label: "Frontend",
    },
    {
        value: "devops",
        label: "DevOps",
    },
    {
        value: "mobile",
        label: "Mobile",
    },
    {
        value: "qa",
        label: "QA",
    },
    {
        value: "design",
        label: "Design",
    },
    {
        value: "ai",
        label: "AI",
    },
    {
        value: "data",
        label: "Data",
    },
];


function getApiErrorMessage(
    error: any,
    fallback: string,
): string {

    const detail =
        error?.response?.data?.detail;


    if (typeof detail === "string") {
        return detail;
    }


    if (Array.isArray(detail)) {

        const messages =
            detail
                .map((item) => {

                    if (
                        typeof item ===
                        "string"
                    ) {
                        return item;
                    }

                    if (
                        item &&
                        typeof item.msg ===
                        "string"
                    ) {

                        const location =
                            Array.isArray(item.loc)
                                ? item.loc
                                    .filter(
                                        (part: unknown) =>
                                            part !== "body",
                                    )
                                    .join(".")
                                : "";

                        return location
                            ? `${location}: ${item.msg}`
                            : item.msg;
                    }

                    return null;

                })
                .filter(
                    (
                        message,
                    ): message is string =>
                        Boolean(message),
                );


        if (messages.length > 0) {
            return messages.join("\n");
        }
    }


    if (
        typeof error?.message ===
        "string"
    ) {
        return error.message;
    }


    return fallback;
}


export default function CreateVacancyPage() {

    const router = useRouter();

    const user =
        useAuthStore(
            (state) => state.user,
        );

    const initialized =
        useAuthStore(
            (state) => state.initialized,
        );

    const initialize =
        useAuthStore(
            (state) => state.initialize,
        );

    const [
        title,
        setTitle,
    ] = useState("");

    const [
        description,
        setDescription,
    ] = useState("");

    const [
        category,
        setCategory,
    ] = useState("backend");

    const [
        location,
        setLocation,
    ] = useState("");

    const [
        employmentType,
        setEmploymentType,
    ] = useState<EmploymentType>("full_time");

    const [
        experienceLevel,
        setExperienceLevel,
    ] = useState<ExperienceLevel>("middle");

    const [
        salaryFrom,
        setSalaryFrom,
    ] = useState("");

    const [
        salaryTo,
        setSalaryTo,
    ] = useState("");

    const [
        isRemote,
        setIsRemote,
    ] = useState(false);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(null);


    useEffect(() => {

        if (!initialized) {
            initialize();
        }

    }, [
        initialized,
        initialize,
    ]);


    useEffect(() => {

        if (
            initialized
            &&
            user
            &&
            user.role !== "employer"
        ) {
            router.replace("/");
        }

    }, [
        initialized,
        user,
        router,
    ]);


    if (!initialized) {

        return (
            <main className="min-h-screen bg-slate-50">

                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">

                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                        <p className="text-sm text-slate-500">
                            Проверка авторизации...
                        </p>

                    </div>

                </div>

            </main>
        );
    }


    if (!user) {

        return (
            <main className="min-h-screen bg-slate-50">

                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">

                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                        <div className="mb-4 text-4xl">
                            🔐
                        </div>

                        <h1 className="text-xl font-bold text-slate-900">
                            Требуется авторизация
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Войдите как работодатель, чтобы создать вакансию.
                        </p>

                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                        >
                            Вернуться к вакансиям
                        </button>

                    </div>

                </div>

            </main>
        );
    }


    if (user.role !== "employer") {

        return null;
    }


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();

        setError(null);


        if (!title.trim()) {
            setError("Введите название вакансии.");
            return;
        }

        if (!description.trim()) {
            setError("Введите описание вакансии.");
            return;
        }

        if (!location.trim()) {
            setError("Введите город или локацию.");
            return;
        }


        const parsedSalaryFrom =
            salaryFrom.trim()
                ? Number(salaryFrom)
                : null;

        const parsedSalaryTo =
            salaryTo.trim()
                ? Number(salaryTo)
                : null;


        if (
            parsedSalaryFrom !== null
            &&
            Number.isNaN(parsedSalaryFrom)
        ) {
            setError("Минимальная зарплата должна быть числом.");
            return;
        }

        if (
            parsedSalaryTo !== null
            &&
            Number.isNaN(parsedSalaryTo)
        ) {
            setError("Максимальная зарплата должна быть числом.");
            return;
        }

        if (
            parsedSalaryFrom !== null
            &&
            parsedSalaryTo !== null
            &&
            parsedSalaryFrom > parsedSalaryTo
        ) {
            setError(
                "Минимальная зарплата не может быть больше максимальной.",
            );
            return;
        }


        setLoading(true);


        try {

            await createVacancy({

                title: title.trim(),

                description: description.trim(),

                category,

                location: location.trim(),

                employment_type: employmentType,

                experience_level: experienceLevel,

                salary_from: parsedSalaryFrom,

                salary_to: parsedSalaryTo,

                is_remote: isRemote,

                technology_ids: [],

            });


            router.push("/employer");

        } catch (error: any) {

            setError(
                getApiErrorMessage(
                    error,
                    "Не удалось создать вакансию.",
                ),
            );

        } finally {

            setLoading(false);

        }
    }


    return (
        <main className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600"
                >
                    ← Назад
                </button>


                <div className="mb-8">

                    <p className="text-sm font-medium text-brand-600">
                        Кабинет работодателя
                    </p>

                    <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                        Разместить вакансию
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Заполните информацию о вакансии, чтобы опубликовать её на JobHub.
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
                >

                    {error && (

                        <div className="mb-6 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>

                    )}


                    <div className="space-y-6">

                        <div>

                            <label
                                htmlFor="vacancy-title"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Название вакансии
                            </label>

                            <input
                                id="vacancy-title"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                maxLength={255}
                                required
                                placeholder="Например, Backend Python Developer"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                            />

                        </div>


                        <div>

                            <label
                                htmlFor="vacancy-description"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Описание вакансии
                            </label>

                            <textarea
                                id="vacancy-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                required
                                rows={8}
                                placeholder="Опишите задачи, проект и требования к кандидату..."
                                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                            />

                        </div>


                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            <div>

                                <label
                                    htmlFor="vacancy-category"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Категория
                                </label>

                                <select
                                    id="vacancy-category"
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                                >

                                    {categories.map(
                                        (item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ),
                                    )}

                                </select>

                            </div>


                            <div>

                                <label
                                    htmlFor="vacancy-experience"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Опыт
                                </label>

                                <select
                                    id="vacancy-experience"
                                    value={experienceLevel}
                                    onChange={(event) =>
                                        setExperienceLevel(
                                            event.target.value as ExperienceLevel,
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                                >

                                    <option value="junior">
                                        Junior
                                    </option>

                                    <option value="middle">
                                        Middle
                                    </option>

                                    <option value="senior">
                                        Senior
                                    </option>

                                </select>

                            </div>

                        </div>


                        <div>

                            <label
                                htmlFor="vacancy-location"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Город / локация
                            </label>

                            <input
                                id="vacancy-location"
                                type="text"
                                value={location}
                                onChange={(event) =>
                                    setLocation(event.target.value)
                                }
                                required
                                placeholder="Москва"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                            />

                        </div>


                        <div>

                            <label
                                htmlFor="vacancy-employment"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Тип занятости
                            </label>

                            <select
                                id="vacancy-employment"
                                value={employmentType}
                                onChange={(event) =>
                                    setEmploymentType(
                                        event.target.value as EmploymentType,
                                    )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                            >

                                <option value="full_time">
                                    Полный день
                                </option>

                                <option value="part_time">
                                    Частичная занятость
                                </option>

                                <option value="contract">
                                    Контракт
                                </option>

                                <option value="internship">
                                    Стажировка
                                </option>

                            </select>

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Зарплата, $
                            </label>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <input
                                    type="number"
                                    min="0"
                                    value={salaryFrom}
                                    onChange={(event) =>
                                        setSalaryFrom(event.target.value)
                                    }
                                    placeholder="От"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                                />

                                <input
                                    type="number"
                                    min="0"
                                    value={salaryTo}
                                    onChange={(event) =>
                                        setSalaryTo(event.target.value)
                                    }
                                    placeholder="До"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                                />

                            </div>

                        </div>


                        <label
                            className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
                        >

                            <div>

                                <p className="text-sm font-semibold text-slate-700">
                                    Удалённая работа
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Кандидат сможет работать полностью удалённо.
                                </p>

                            </div>

                            <input
                                type="checkbox"
                                checked={isRemote}
                                onChange={(event) =>
                                    setIsRemote(event.target.checked)
                                }
                                className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            />

                        </label>


                        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">

                            <p className="text-xs leading-5 text-amber-700">
                                <span className="font-semibold">
                                    Технологии:
                                </span>{" "}
                                пока не выбираются в этой форме. Вакансия будет создана с пустым списком технологий.
                            </p>

                        </div>

                    </div>


                    <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={loading}
                            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Публикация..."
                                : "Опубликовать вакансию"}
                        </button>

                    </div>

                </form>

            </div>

        </main>
    );
}