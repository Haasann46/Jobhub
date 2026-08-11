"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import {
    createResume,
    updateResume,
} from "@/services/resume";

import {
    Resume,
    ResumeCreate,
} from "@/types/resume";


interface ResumeModalProps {
    isOpen: boolean;

    resume: Resume | null;

    onClose: () => void;

    onSaved: (resume: Resume) => void;
}


export default function ResumeModal({
    isOpen,
    resume,
    onClose,
    onSaved,
}: ResumeModalProps) {

    const [title, setTitle] =
        useState("");

    const [desiredPosition, setDesiredPosition] =
        useState("");

    const [about, setAbout] =
        useState("");

    const [city, setCity] =
        useState("");

    const [salaryExpectation, setSalaryExpectation] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);


    useEffect(() => {

        if (!isOpen) {
            return;
        }

        if (resume) {

            setTitle(resume.title);

            setDesiredPosition(
                resume.desired_position,
            );

            setAbout(
                resume.about ?? "",
            );

            setCity(
                resume.city ?? "",
            );

            setSalaryExpectation(
                resume.salary_expectation !== null
                    ? String(
                        resume.salary_expectation,
                    )
                    : "",
            );

        } else {

            setTitle("");

            setDesiredPosition("");

            setAbout("");

            setCity("");

            setSalaryExpectation("");

        }

        setError(null);

    }, [
        isOpen,
        resume,
    ]);


    if (!isOpen) {
        return null;
    }


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();

        setError(null);
        setLoading(true);

        try {

            const data: ResumeCreate = {
                title: title.trim(),
                desired_position:
                    desiredPosition.trim(),
                about:
                    about.trim() || null,
                city:
                    city.trim() || null,
                salary_expectation:
                    salaryExpectation
                        ? Number(
                            salaryExpectation,
                        )
                        : null,
            };


            let savedResume: Resume;


            if (resume) {

                savedResume =
                    await updateResume(
                        resume.id,
                        data,
                    );

            } else {

                savedResume =
                    await createResume(
                        data,
                    );

            }


            onSaved(savedResume);

            onClose();

        } catch (error: any) {

            const message =
                error?.response?.data?.detail ??
                "Не удалось сохранить резюме.";

            setError(message);

        } finally {

            setLoading(false);

        }
    }


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
                    max-h-[90vh]
                    w-full
                    max-w-lg
                    overflow-y-auto
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-2xl
                "
            >

                <div className="mb-6 flex items-start justify-between">

                    <div>

                        <h2 className="text-xl font-bold text-slate-900">

                            {resume
                                ? "Редактировать резюме"
                                : "Новое резюме"}

                        </h2>

                        <p className="mt-1 text-sm text-slate-500">

                            Заполните информацию о резюме.

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            text-xl
                            text-slate-400
                            transition
                            hover:text-slate-600
                        "
                    >
                        ×
                    </button>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    <div>

                        <label className="mb-1.5 block text-sm font-medium text-slate-700">

                            Название резюме

                        </label>

                        <input
                            required
                            value={title}
                            onChange={(event) =>
                                setTitle(
                                    event.target.value,
                                )
                            }
                            placeholder="Например: I am a developer"
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                px-4
                                py-3
                                text-sm
                                text-slate-900
                                outline-none
                                transition
                                focus:border-brand-500
                                focus:ring-2
                                focus:ring-brand-500/10
                            "
                        />

                    </div>


                    <div>

                        <label className="mb-1.5 block text-sm font-medium text-slate-700">

                            Желаемая должность

                        </label>

                        <input
                            required
                            value={desiredPosition}
                            onChange={(event) =>
                                setDesiredPosition(
                                    event.target.value,
                                )
                            }
                            placeholder="Python Backend Developer"
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                px-4
                                py-3
                                text-sm
                                text-slate-900
                                outline-none
                                transition
                                focus:border-brand-500
                                focus:ring-2
                                focus:ring-brand-500/10
                            "
                        />

                    </div>


                    <div>

                        <label className="mb-1.5 block text-sm font-medium text-slate-700">

                            О себе

                        </label>

                        <textarea
                            value={about}
                            onChange={(event) =>
                                setAbout(
                                    event.target.value,
                                )
                            }
                            rows={4}
                            placeholder="Расскажите о себе..."
                            className="
                                w-full
                                resize-none
                                rounded-xl
                                border
                                border-slate-200
                                px-4
                                py-3
                                text-sm
                                text-slate-900
                                outline-none
                                transition
                                focus:border-brand-500
                                focus:ring-2
                                focus:ring-brand-500/10
                            "
                        />

                    </div>


                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-slate-700">

                                Город

                            </label>

                            <input
                                value={city}
                                onChange={(event) =>
                                    setCity(
                                        event.target.value,
                                    )
                                }
                                placeholder="Baku"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-4
                                    py-3
                                    text-sm
                                    text-slate-900
                                    outline-none
                                    transition
                                    focus:border-brand-500
                                    focus:ring-2
                                    focus:ring-brand-500/10
                                "
                            />

                        </div>


                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-slate-700">

                                Зарплата

                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    salaryExpectation
                                }
                                onChange={(event) =>
                                    setSalaryExpectation(
                                        event.target.value,
                                    )
                                }
                                placeholder="2000"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-4
                                    py-3
                                    text-sm
                                    text-slate-900
                                    outline-none
                                    transition
                                    focus:border-brand-500
                                    focus:ring-2
                                    focus:ring-brand-500/10
                                "
                            />

                        </div>

                    </div>


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


                    <div className="flex justify-end gap-3 pt-2">

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
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
                            disabled={loading}
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
                                disabled:opacity-60
                            "
                        >
                            {loading
                                ? "Сохранение..."
                                : "Сохранить"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}