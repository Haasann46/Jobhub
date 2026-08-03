"use client";

import { useState } from "react";

import SearchInput from "./SearchInput";
import LocationInput from "./LocationInput";
import SearchButton from "./SearchButton";
import PopularTags from "./PopularTags";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("");

    function handleSearch() {
        console.log({
            query,
            location,
        });
    }

    return (
        <section className="relative -mt-12 z-20">

            <div className="mx-auto max-w-5xl px-6">

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">

                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">

                        <div className="flex items-center rounded-2xl border border-slate-200 px-4">

                            <span className="mr-3 text-xl">
                                🔍
                            </span>

                            <SearchInput
                                value={query}
                                onChange={setQuery}
                            />

                        </div>

                        <div className="flex items-center rounded-2xl border border-slate-200 px-4">

                            <span className="mr-3 text-xl">
                                📍
                            </span>

                            <LocationInput
                                value={location}
                                onChange={setLocation}
                            />

                        </div>

                        <SearchButton
                            onClick={handleSearch}
                        />

                    </div>

                </div>

                <PopularTags />

            </div>

        </section>
    );
}