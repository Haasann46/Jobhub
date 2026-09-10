"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    getMyProfile,
    updateMyProfile,
} from "@/services/profile";

import {
    Profile,
    ProfileUpdate,
} from "@/types/profile";


interface ProfileModalProps {
    isOpen: boolean;

    onClose: () => void;

    onSaved: (
        profile: Profile,
    ) => void;
}


/*
 * ============================================================
 * Форматирование ошибок backend
 * ============================================================
 */

function getErrorMessage(
    error: any,
    fallback: string,
): string {

    const detail =
        error?.response?.data?.detail;


    /*
     * Обычная строковая ошибка FastAPI.
     */

    if (typeof detail === "string") {
        return detail;
    }


    /*
     * Ошибка валидации FastAPI / Pydantic.
     *
     * Например:
     *
     * [
     *   {
     *     "type": "url_parsing",
     *     "loc": ["body", "github_url"],
     *     "msg": "Input should be a valid URL",
     *     ...
     *   }
     * ]
     */

    if (Array.isArray(detail)) {

        const messages =
            detail
                .map((item) => {

                    if (
                        typeof item?.msg ===
                        "string"
                    ) {

                        const location =
                            Array.isArray(
                                item?.loc,
                            )
                                ? item.loc
                                    .filter(
                                        (
                                            part: unknown,
                                        ) =>
                                            part !==
                                            "body",
                                    )
                                    .join(".")
                                : "";

                        if (location) {

                            return `${location}: ${item.msg}`;

                        }

                        return item.msg;
                    }

                    return null;
                })
                .filter(
                    (
                        message: string | null,
                    ): message is string =>
                        Boolean(message),
                );


        if (messages.length > 0) {

            return messages.join("\n");

        }
    }


    return fallback;
}


/*
 * ============================================================
 * Нормализация URL
 * ============================================================
 *
 * Backend использует HttpUrl | None.
 *
 * Поэтому:
 *
 * ""       → null
 * "   "    → null
 * URL      → URL
 *
 * Это позволяет оставлять поля ссылок пустыми.
 */

function normalizeUrl(
    value: string | null | undefined,
): string | null {

    const normalized =
        value?.trim() ?? "";


    if (!normalized) {
        return null;
    }


    return normalized;
}


export default function ProfileModal({
    isOpen,
    onClose,
    onSaved,
}: ProfileModalProps) {

    const [
        profile,
        setProfile,
    ] = useState<Profile | null>(
        null,
    );


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );


    const [
        form,
        setForm,
    ] = useState<ProfileUpdate>({
        first_name: "",
        last_name: "",
        phone: "",
        avatar_url: "",
        bio: "",
        city: "",
        github_url: "",
        linkedin_url: "",
        skills: [],
        experience: [],
        education: [],
        languages: [],
        projects: [],
    });


    const [
        skillsText,
        setSkillsText,
    ] = useState("");


    /*
     * ============================================================
     * Загрузка профиля
     * ============================================================
     */

    useEffect(() => {

        if (!isOpen) {
            return;
        }


        async function loadProfile() {

            setLoading(true);
            setError(null);


            try {

                const response =
                    await getMyProfile();


                setProfile(
                    response,
                );


                setForm({
                    first_name:
                        response.first_name ??
                        "",

                    last_name:
                        response.last_name ??
                        "",

                    phone:
                        response.phone ??
                        "",

                    avatar_url:
                        response.avatar_url ??
                        "",

                    bio:
                        response.bio ??
                        "",

                    city:
                        response.city ??
                        "",

                    github_url:
                        response.github_url ??
                        "",

                    linkedin_url:
                        response.linkedin_url ??
                        "",

                    skills:
                        response.skills ??
                        [],

                    experience:
                        response.experience ??
                        [],

                    education:
                        response.education ??
                        [],

                    languages:
                        response.languages ??
                        [],

                    projects:
                        response.projects ??
                        [],
                });


                setSkillsText(
                    (
                        response.skills ??
                        []
                    ).join(", "),
                );


            } catch (error: any) {

                setError(
                    getErrorMessage(
                        error,
                        "Не удалось загрузить профиль.",
                    ),
                );


            } finally {

                setLoading(false);

            }
        }


        loadProfile();

    }, [
        isOpen,
    ]);


    if (!isOpen) {
        return null;
    }


    /*
     * ============================================================
     * Изменение поля
     * ============================================================
     */

    function updateField(
        field: keyof ProfileUpdate,
        value: string,
    ) {

        setForm(
            (current) => ({
                ...current,
                [field]: value,
            }),
        );
    }


    /*
     * ============================================================
     * Сохранение профиля
     * ============================================================
     */

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();


        setSaving(true);
        setError(null);


        /*
         * Формируем skills.
         */

        const skills =
            skillsText
                .split(",")
                .map(
                    (skill) =>
                        skill.trim(),
                )
                .filter(Boolean);


        /*
         * Формируем данные для backend.
         *
         * Главное изменение:
         *
         * пустые URL превращаем в null.
         */

        const data: ProfileUpdate = {

            ...form,

            first_name:
                form.first_name?.trim() ||
                null,

            last_name:
                form.last_name?.trim() ||
                null,

            phone:
                form.phone?.trim() ||
                null,

            bio:
                form.bio?.trim() ||
                null,

            city:
                form.city?.trim() ||
                null,

            avatar_url:
                normalizeUrl(
                    form.avatar_url,
                ),

            github_url:
                normalizeUrl(
                    form.github_url,
                ),

            linkedin_url:
                normalizeUrl(
                    form.linkedin_url,
                ),

            skills,
        };


        try {

            const updated =
                await updateMyProfile(
                    data,
                );


            setProfile(
                updated,
            );


            /*
             * Передаём обновлённый профиль
             * обратно в CandidatePage.
             */

            onSaved(
                updated,
            );


            onClose();


        } catch (error: any) {

            setError(
                getErrorMessage(
                    error,
                    "Не удалось сохранить профиль.",
                ),
            );


        } finally {

            setSaving(false);

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
                bg-slate-900/50
                px-4
                py-8
            "
        >

            <div
                className="
                    max-h-[90vh]
                    w-full
                    max-w-3xl
                    overflow-y-auto
                    rounded-3xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* ================================================== */}
                {/* Header */}
                {/* ================================================== */}

                <div
                    className="
                        sticky
                        top-0
                        z-10
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-100
                        bg-white
                        px-6
                        py-5
                    "
                >

                    <div>

                        <h2
                            className="
                                text-xl
                                font-bold
                                text-slate-900
                            "
                        >
                            Редактировать профиль
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-slate-500
                            "
                        >
                            Заполните информацию,
                            которую увидит работодатель.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
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


                {/* ================================================== */}
                {/* Error */}
                {/* ================================================== */}

                {error && (

                    <div
                        className="
                            mx-6
                            mt-5
                            whitespace-pre-line
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


                {/* ================================================== */}
                {/* Loading / Form */}
                {/* ================================================== */}

                {loading ? (

                    <div
                        className="
                            p-10
                            text-center
                            text-sm
                            text-slate-500
                        "
                    >
                        Загрузка профиля...
                    </div>

                ) : (

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="
                            space-y-7
                            p-6
                        "
                    >

                        {/* ================================================== */}
                        {/* Основная информация */}
                        {/* ================================================== */}

                        <section>

                            <h3
                                className="
                                    mb-4
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-slate-500
                                "
                            >
                                Основная информация
                            </h3>


                            <div
                                className="
                                    grid
                                    gap-4
                                    sm:grid-cols-2
                                "
                            >

                                <input
                                    value={
                                        form.first_name ??
                                        ""
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "first_name",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Имя"
                                    className="
                                        rounded-xl
                                        border
                                        border-slate-200
                                        px-4
                                        py-3
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-brand-500
                                    "
                                />


                                <input
                                    value={
                                        form.last_name ??
                                        ""
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "last_name",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Фамилия"
                                    className="
                                        rounded-xl
                                        border
                                        border-slate-200
                                        px-4
                                        py-3
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-brand-500
                                    "
                                />


                                <input
                                    value={
                                        form.phone ??
                                        ""
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "phone",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Телефон"
                                    className="
                                        rounded-xl
                                        border
                                        border-slate-200
                                        px-4
                                        py-3
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-brand-500
                                    "
                                />


                                <input
                                    value={
                                        form.city ??
                                        ""
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "city",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Город"
                                    className="
                                        rounded-xl
                                        border
                                        border-slate-200
                                        px-4
                                        py-3
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-brand-500
                                    "
                                />

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* О себе */}
                        {/* ================================================== */}

                        <section>

                            <h3
                                className="
                                    mb-4
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-slate-500
                                "
                            >
                                О себе
                            </h3>


                            <textarea
                                value={
                                    form.bio ??
                                    ""
                                }
                                onChange={(event) =>
                                    updateField(
                                        "bio",
                                        event.target.value,
                                    )
                                }
                                rows={5}
                                placeholder="Расскажите о себе, своих сильных сторонах и профессиональных целях..."
                                className="
                                    w-full
                                    resize-none
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-4
                                    py-3
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-brand-500
                                "
                            />

                        </section>


                        {/* ================================================== */}
                        {/* Навыки */}
                        {/* ================================================== */}

                        <section>

                            <h3
                                className="
                                    mb-4
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-slate-500
                                "
                            >
                                Навыки
                            </h3>


                            <input
                                value={
                                    skillsText
                                }
                                onChange={(event) =>
                                    setSkillsText(
                                        event.target.value,
                                    )
                                }
                                placeholder="Python, FastAPI, PostgreSQL, React"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-4
                                    py-3
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-brand-500
                                "
                            />


                            <p
                                className="
                                    mt-2
                                    text-xs
                                    text-slate-400
                                "
                            >
                                Указывайте навыки через запятую.
                            </p>

                        </section>


                        {/* ================================================== */}
                        {/* Ссылки */}
                        {/* ================================================== */}

                        <section>

                            <h3
                                className="
                                    mb-4
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-slate-500
                                "
                            >
                                Ссылки
                            </h3>


                            <div
                                className="
                                    space-y-4
                                "
                            >

                                <input
                                    value={
                                        form.github_url ??
                                        ""
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "github_url",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="GitHub URL"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        px-4
                                        py-3
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-brand-500
                                    "
                                />


                                <input
                                    value={
                                        form.linkedin_url ??
                                        ""
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "linkedin_url",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="LinkedIn URL"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        px-4
                                        py-3
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-brand-500
                                    "
                                />


                                <input
                                    value={
                                        form.avatar_url ??
                                        ""
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "avatar_url",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Avatar URL"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        px-4
                                        py-3
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-brand-500
                                    "
                                />

                            </div>

                        </section>


                        {/* ================================================== */}
                        {/* Buttons */}
                        {/* ================================================== */}

                        <div
                            className="
                                flex
                                justify-end
                                gap-3
                                border-t
                                border-slate-100
                                pt-5
                            "
                        >

                            <button
                                type="button"
                                onClick={onClose}
                                className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-5
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
                                disabled={saving}
                                className="
                                    rounded-xl
                                    bg-brand-600
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-brand-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                {saving
                                    ? "Сохранение..."
                                    : "Сохранить"}
                            </button>

                        </div>

                    </form>

                )}

            </div>

        </div>
    );
}