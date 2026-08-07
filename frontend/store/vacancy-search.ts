import { create } from "zustand";

import {
    Vacancy,
    VacancyListResponse,
    VacancySearchParams,
} from "@/types/vacancy";

interface VacancySearchStore {
    params: VacancySearchParams;

    draftSearch: string;
    draftLocation: string;

    vacancies: Vacancy[];

    loading: boolean;

    total: number;

    pages: number;

    hasNext: boolean;

    hasPrevious: boolean;

    setDraftSearch: (
        value: string,
    ) => void;

    setDraftLocation: (
        value: string,
    ) => void;

    applySearch: () => void;

    setRemote: (
        value: boolean,
    ) => void;

    setEmploymentType: (
        value: VacancySearchParams["employment_type"],
    ) => void;

    setExperienceLevel: (
        value: VacancySearchParams["experience_level"],
    ) => void;

    setSort: (
        value: VacancySearchParams["sort"],
    ) => void;

    setParams: (
        params: VacancySearchParams,
    ) => void;

    setPage: (
        page: number,
    ) => void;

    setResponse: (
        response: VacancyListResponse,
    ) => void;

    setLoading: (
        value: boolean,
    ) => void;

    setSalaryFrom: (
        value: number | undefined,
    ) => void;

    setSalaryTo: (
        value: number | undefined,
    ) => void;

    reset: () => void;
}

const initialParams: VacancySearchParams = {
    search: "",
    location: "",
    category: undefined,
    employment_type: undefined,
    experience_level: undefined,
    salary_from: undefined,
    salary_to: undefined,
    is_remote: undefined,
    page: 1,
    size: 20,
    sort: "newest",
};

export const useVacancySearchStore =
    create<VacancySearchStore>((set, get) => ({

        params: initialParams,

        draftSearch: "",

        draftLocation: "",

        vacancies: [],

        loading: false,

        total: 0,

        pages: 0,

        hasNext: false,

        hasPrevious: false,

        setDraftSearch: (value) =>
            set({
                draftSearch: value,
            }),

        setDraftLocation: (value) =>
            set({
                draftLocation: value,
            }),

        applySearch: () => {

            const state = get();

            set({
                params: {
                    ...state.params,
                    search: state.draftSearch,
                    location: state.draftLocation,
                    page: 1,
                },
            });

        },

        setRemote: (value) =>
            set((state) => ({
                params: {
                    ...state.params,
                    is_remote: value,
                    page: 1,
                },
            })),

        setEmploymentType: (value) =>
            set((state) => ({
                params: {
                    ...state.params,
                    employment_type: value,
                    page: 1,
                },
            })),

        setExperienceLevel: (value) =>
            set((state) => ({
                params: {
                    ...state.params,
                    experience_level: value,
                    page: 1,
                },
            })),

        setSalaryFrom: (value) =>
            set((state) => ({
                params: {
                    ...state.params,
                    salary_from: value,
                    page: 1,
                },
            })),

        setSalaryTo: (value) =>
            set((state) => ({
                params: {
                    ...state.params,
                    salary_to: value,
                    page: 1,
                },
            })),

        setSort: (value) =>
            set((state) => ({
                params: {
                    ...state.params,
                    sort: value,
                    page: 1,
                },
            })),

        setParams: (params) =>
            set({
                params,
            }),

        setPage: (page) =>
            set((state) => ({
                params: {
                    ...state.params,
                    page,
                },
            })),

        setLoading: (loading) =>
            set({
                loading,
            }),

        setResponse: (response) =>
            set({
                vacancies: response.items,
                total: response.total,
                pages: response.pages,
                hasNext: response.has_next,
                hasPrevious: response.has_previous,
            }),

        reset: () =>
            set({

                params: initialParams,

                draftSearch: "",

                draftLocation: "",

                vacancies: [],

                loading: false,

                total: 0,

                pages: 0,

                hasNext: false,

                hasPrevious: false,

            }),

    }));