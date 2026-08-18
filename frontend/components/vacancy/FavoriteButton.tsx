"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    addFavorite,
    checkFavorite,
    removeFavorite,
} from "@/services/favorite";

import {
    useAuthStore,
} from "@/store/auth";


interface FavoriteButtonProps {
    vacancyId: number;

    initialIsFavorite?: boolean;

    onChange?: (
        isFavorite: boolean,
    ) => void;
}


export default function FavoriteButton({
    vacancyId,
    initialIsFavorite,
    onChange,
}: FavoriteButtonProps) {

    const user = useAuthStore(
        (state) => state.user,
    );

    const isAuthenticated =
        useAuthStore(
            (state) => state.isAuthenticated,
        );

    const initialized =
        useAuthStore(
            (state) => state.initialized,
        );


    const [
        isFavorite,
        setIsFavorite,
    ] = useState(
        initialIsFavorite ?? false,
    );

    const [
        loading,
        setLoading,
    ] = useState(false);


    useEffect(() => {

        if (
            initialIsFavorite !==
            undefined
        ) {

            setIsFavorite(
                initialIsFavorite,
            );

            return;
        }


        if (
            !initialized
            ||
            !isAuthenticated
            ||
            user?.role !== "candidate"
        ) {
            return;
        }


        let cancelled = false;


        async function loadStatus() {

            try {

                const value =
                    await checkFavorite(
                        vacancyId,
                    );


                if (!cancelled) {

                    setIsFavorite(
                        value,
                    );

                }

            } catch {

                if (!cancelled) {

                    setIsFavorite(
                        false,
                    );

                }

            }

        }


        loadStatus();


        return () => {

            cancelled = true;

        };

    }, [
        vacancyId,
        initialIsFavorite,
        initialized,
        isAuthenticated,
        user,
    ]);


    if (
        !initialized
        ||
        !isAuthenticated
        ||
        user?.role !== "candidate"
    ) {
        return null;
    }


    async function handleClick(
        event: React.MouseEvent<HTMLButtonElement>,
    ) {

        event.stopPropagation();


        if (loading) {
            return;
        }


        try {

            setLoading(true);


            if (isFavorite) {

                await removeFavorite(
                    vacancyId,
                );

                setIsFavorite(
                    false,
                );

                onChange?.(
                    false,
                );

            } else {

                await addFavorite(
                    vacancyId,
                );

                setIsFavorite(
                    true,
                );

                onChange?.(
                    true,
                );

            }

        } catch (error) {

            console.error(
                "Favorite error:",
                error,
            );

        } finally {

            setLoading(false);

        }
    }


    return (
        <button
            type="button"
            aria-label={
                isFavorite
                    ? "Удалить из избранного"
                    : "Добавить в избранное"
            }
            title={
                isFavorite
                    ? "Удалить из избранного"
                    : "Добавить в избранное"
            }
            disabled={loading}
            onClick={handleClick}
            className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                transition
                ${
                    loading
                        ? "cursor-wait opacity-50"
                        : "hover:scale-110"
                }
            `}
        >
            <span
                className={`
                    text-3xl
                    leading-none
                    transition
                    ${
                        isFavorite
                            ? "text-red-500"
                            : "text-white [-webkit-text-stroke:1.5px_#ef4444]"
                    }
                `}
            >
                ♥
            </span>
        </button>
    );
}