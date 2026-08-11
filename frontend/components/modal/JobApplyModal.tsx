"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import {
    createApplication,
} from "@/services/application";

import {
    getMyResumes,
} from "@/services/resume";

import { Resume } from "@/types/resume";


interface JobApplyModalProps {
    isOpen: boolean;

    vacancyId: number;

    vacancyTitle: string;

    onClose: () => void;

    onSuccess?: () => void;
}


export default function JobApplyModal({
    isOpen,
    vacancyId,
    vacancyTitle,
    onClose,
    onSuccess,
}: JobApplyModalProps) {

    const [resumes, setResumes] =
        useState<Resume[]>([]);

    const [selectedResumeId, setSelectedResumeId] =
        useState<number | null>(null);

    const [coverLetter, setCoverLetter] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [loadingResumes, setLoadingResumes] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState(false);


    useEffect(() => {

        if (!isOpen) {
            return;
        }


        async function loadResumes() {

            setLoadingResumes(true);
            setError(null);
            setSuccess(false);


            try {

                const data =
                    await getMyResumes();

                const activeResumes =
                    data.filter(
                        (resume) =>
                            resume.is_active,
                    );

                setResumes(activeResumes);


                if (
                    activeResumes.length > 0
                ) {
                    setSelectedResumeId(
                        activeResumes[0].id,
                    );
                } else {
                    setSelectedResumeId(null);
                }

            } catch (error: any) {

                setError(
                    error?.response?.data?.detail ??
                    "Не удалось загрузить резюме.",
                );

            } finally {

                setLoadingResumes(false);

            }
        }


        loadResumes();

    }, [isOpen]);


    if (!isOpen) {
        return null;
    }


    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {

        event.preventDefault();

        setError(null);


        if (selectedResumeId === null) {

            setError(
                "Выберите резюме.",
            );

            return;
        }


        setLoading(true);


        try {

            await createApplication(
                vacancyId,
                {
                    resume_id:
                        selectedResumeId,

                    cover_letter:
                        coverLetter.trim()
                            ? coverLetter.trim()
                            : null,
                },
            );


            setSuccess(true);

            onSuccess?.();

        } catch (error: any) {

            setError(
                error?.response?.data?.detail ??
                "Не удалось отправить отклик.",
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-slate-950/50
                px-4
                backdrop-blur-sm
            "
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }

            }}
        >

            <div
                className="
                    w-full
                    max-w-lg
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-2xl
                "
            >

                {/* Header */}

                <div className="mb-6 flex items-start justify-between">

                    <div>

                        <h2 className="text-xl font-bold text-slate-900">
                            Отклик на вакансию
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {vacancyTitle}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-lg
                            px-2
                            py-1
                            text-xl
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                        "
                    >
                        ×
                    </button>

                </div>


                {success ? (

                    <div className="py-8 text-center">

                        <div className="mb-4 text-5xl">
                            ✅
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                            Отклик отправлен
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Работодатель получил ваш отклик.
                        </p>

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                mt-6
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
                            Закрыть
                        </button>

                    </div>

                ) : (

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Resume */}

                        <div>

                            <label
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                Выберите резюме
                            </label>


                            {loadingResumes ? (

                                <div className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-4
                                    py-4
                                    text-sm
                                    text-slate-500
                                ">
                                    Загрузка резюме...
                                </div>

                            ) : resumes.length === 0 ? (

                                <div className="
                                    rounded-xl
                                    border
                                    border-amber-200
                                    bg-amber-50
                                    px-4
                                    py-4
                                ">

                                    <p className="text-sm font-semibold text-amber-700">
                                        У вас нет активных резюме.
                                    </p>

                                    <p className="mt-1 text-xs text-amber-600">
                                        Создайте резюме перед отправкой отклика.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-2">

                                    {resumes.map(
                                        (resume) => (

                                            <button
                                                key={resume.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedResumeId(
                                                        resume.id,
                                                    )
                                                }
                                                className={`
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    px-4
                                                    py-3
                                                    text-left
                                                    transition
                                                    ${
                                                        selectedResumeId ===
                                                        resume.id
                                                            ? "border-brand-500 bg-brand-50"
                                                            : "border-slate-200 bg-white hover:border-slate-300"
                                                    }
                                                `}
                                            >

                                                <div className="font-semibold text-slate-900">
                                                    {resume.title}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    {resume.desired_position}

                                                    {resume.city
                                                        ? ` • ${resume.city}`
                                                        : ""}
                                                </div>

                                            </button>

                                        ),
                                    )}

                                </div>

                            )}

                        </div>


                        {/* Cover letter */}

                        <div>

                            <label
                                htmlFor="cover-letter"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                Сопроводительное письмо
                            </label>

                            <textarea
                                id="cover-letter"
                                value={coverLetter}
                                onChange={(event) =>
                                    setCoverLetter(
                                        event.target.value,
                                    )
                                }
                                rows={6}
                                placeholder="Расскажите работодателю, почему вы подходите на эту позицию..."
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
                                    text-slate-900
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-brand-500
                                    focus:ring-2
                                    focus:ring-brand-500/10
                                "
                            />

                        </div>


                        {/* Error */}

                        {error && (

                            <div
                                className="
                                    rounded-xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-4
                                    py-3
                                    text-sm
                                    text-red-600
                                "
                            >
                                {error}
                            </div>

                        )}


                        {/* Actions */}

                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={onClose}
                                className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    transition
                                    hover:bg-slate-50
                                "
                            >
                                Отмена
                            </button>


                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    loadingResumes ||
                                    resumes.length === 0
                                }
                                className="
                                    rounded-xl
                                    bg-brand-600
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-md
                                    shadow-brand-500/20
                                    transition
                                    hover:bg-brand-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                {loading
                                    ? "Отправка..."
                                    : "Отправить отклик"}

                            </button>

                        </div>

                    </form>

                )}

            </div>

        </div>
    );
}