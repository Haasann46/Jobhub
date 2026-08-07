"use client";

import SearchInput from "./SearchInput";
import LocationInput from "./LocationInput";
import SearchButton from "./SearchButton";
import PopularTags from "./PopularTags";

import { useVacancySearchStore } from "@/store/vacancy-search";

export default function SearchBar() {
    const draftSearch = useVacancySearchStore(
        (state) => state.draftSearch,
    );

    const draftLocation = useVacancySearchStore(
        (state) => state.draftLocation,
    );

    const setDraftSearch = useVacancySearchStore(
        (state) => state.setDraftSearch,
    );

    const setDraftLocation = useVacancySearchStore(
        (state) => state.setDraftLocation,
    );

    const applySearch = useVacancySearchStore(
        (state) => state.applySearch,
    );

    return (
        <div className="mt-8">

            <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl shadow-2xl">

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_130px]">

                    <div className="flex items-center rounded-xl bg-white/10 px-4">

                        <span className="mr-3 text-lg">
                            🔍
                        </span>

                        <SearchInput
                            value={draftSearch}
                            onChange={setDraftSearch}
                            onEnter={applySearch}
                        />

                    </div>

                    <div className="flex items-center rounded-xl bg-white/10 px-4">

                        <span className="mr-3 text-lg">
                            📍
                        </span>

                        <LocationInput
                            value={draftLocation}
                            onChange={setDraftLocation}
                            onEnter={applySearch}
                        />

                    </div>

                    <SearchButton
                        onClick={applySearch}
                    />

                </div>

            </div>

            <PopularTags />

        </div>
    );
}