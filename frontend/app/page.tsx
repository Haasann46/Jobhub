import Hero from "@/components/hero/Hero";
import SearchBar from "@/components/search/SearchBar";
import VacancyList from "@/components/vacancy/VacancyList";

export default function HomePage() {
    return (
        <>
            <Hero />
            <SearchBar />
            <VacancyList />
        </>
    );
}