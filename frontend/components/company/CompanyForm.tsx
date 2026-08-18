"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import {
    createCompany,
    updateMyCompany,
} from "@/services/company";

import {
    Company,
    CompanyCreateData,
} from "@/types/company";


interface CompanyFormProps {
    company: Company | null;

    onSaved: (
        company: Company,
    ) => void;

    onCancel?: () => void;
}


export default function CompanyForm({
    company,
    onSaved,
    onCancel,
}: CompanyFormProps) {

    const [
        name,
        setName,
    ] = useState(
        company?.name ?? "",
    );


    const [
        description,
        setDescription,
    ] = useState(
        company?.description ?? "",
    );


    const [
        website,
        setWebsite,
    ] = useState(
        company?.website ?? "",
    );


    const [
        logoUrl,
        setLogoUrl,
    ] = useState(
        company?.logo_url ?? "",
    );


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );


    useEffect(() => {

        setName(
            company?.name ?? "",
        );

        setDescription(
            company?.description ?? "",
        );

        setWebsite(
            company?.website ?? "",
        );

        setLogoUrl(
            company?.logo_url ?? "",
        );

        setError(null);

    }, [
        company,
    ]);


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();


        if (!name.trim()) {

            setError(
                "Введите название компании.",
            );

            return;
        }


        setLoading(true);
        setError(null);


        try {

            const data: CompanyCreateData = {

                name: name.trim(),

                description:
                    description.trim() ||
                    null,

                website:
                    website.trim() ||
                    null,

                logo_url:
                    logoUrl.trim() ||
                    null,

            };


            let savedCompany: Company;


            if (company) {

                savedCompany =
                    await updateMyCompany(
                        data,
                    );

            } else {

                savedCompany =
                    await createCompany(
                        data,
                    );

            }


            onSaved(
                savedCompany,
            );

        } catch (error: any) {

            setError(
                error?.response?.data?.detail ??
                "Не удалось сохранить компанию.",
            );

        } finally {

            setLoading(false);

        }
    }


    return (

        <form
            onSubmit={handleSubmit}
            className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
            "
        >

            <div className="mb-6">

                <p className="text-sm font-medium text-brand-600">
                    {company
                        ? "Настройки компании"
                        : "Новая компания"}
                </p>


                <h3 className="mt-1 text-xl font-bold text-slate-900">

                    {company
                        ? "Редактировать компанию"
                        : "Создать компанию"}

                </h3>


                <p className="mt-2 text-sm text-slate-500">

                    {company
                        ? "Обновите информацию о вашей компании."
                        : "Заполните основную информацию о компании."}

                </p>

            </div>


            {error && (

                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                    {error}

                </div>

            )}


            <div className="space-y-5">

                {/* Name */}

                <div>

                    <label
                        htmlFor="company-name"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Название компании
                    </label>


                    <input
                        id="company-name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(
                                event.target.value,
                            )
                        }
                        placeholder="Например, Tech Solutions"
                        maxLength={255}
                        required
                        className="
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            text-slate-900
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-brand-500
                            focus:ring-4
                            focus:ring-brand-500/10
                        "
                    />

                </div>


                {/* Description */}

                <div>

                    <label
                        htmlFor="company-description"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Описание
                    </label>


                    <textarea
                        id="company-description"
                        value={description}
                        onChange={(event) =>
                            setDescription(
                                event.target.value,
                            )
                        }
                        placeholder="Расскажите о компании..."
                        rows={5}
                        className="
                            w-full
                            resize-none
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            leading-6
                            text-slate-900
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-brand-500
                            focus:ring-4
                            focus:ring-brand-500/10
                        "
                    />

                </div>


                {/* Website */}

                <div>

                    <label
                        htmlFor="company-website"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Сайт
                    </label>


                    <input
                        id="company-website"
                        type="url"
                        value={website}
                        onChange={(event) =>
                            setWebsite(
                                event.target.value,
                            )
                        }
                        placeholder="https://example.com"
                        className="
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            text-slate-900
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-brand-500
                            focus:ring-4
                            focus:ring-brand-500/10
                        "
                    />

                </div>


                {/* Logo */}

                <div>

                    <label
                        htmlFor="company-logo"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        URL логотипа
                    </label>


                    <input
                        id="company-logo"
                        type="url"
                        value={logoUrl}
                        onChange={(event) =>
                            setLogoUrl(
                                event.target.value,
                            )
                        }
                        placeholder="https://example.com/logo.png"
                        className="
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            text-slate-900
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-brand-500
                            focus:ring-4
                            focus:ring-brand-500/10
                        "
                    />

                </div>

            </div>


            {/* Actions */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

                {onCancel && (

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="
                            rounded-xl
                            bg-slate-100
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-slate-700
                            transition
                            hover:bg-slate-200
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Отмена
                    </button>

                )}


                <button
                    type="submit"
                    disabled={loading}
                    className="
                        rounded-xl
                        bg-brand-600
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-lg
                        shadow-brand-500/20
                        transition
                        hover:bg-brand-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >

                    {loading
                        ? "Сохранение..."
                        : company
                            ? "Сохранить изменения"
                            : "Создать компанию"}

                </button>

            </div>

        </form>
    );
}