"use client";

import { useEffect } from "react";

import VacancyCard from "./VacancyCard";
import { Vacancy } from "@/types/vacancy";

const vacancies: Vacancy[] = [
    {
        id: 1,
        title: "Python Backend Developer",
        company: "Google",
        location: "Remote",
        salary: "$5000",
        experience: "Middle",
        type: "Full Time",
    },
    {
        id: 2,
        title: "Frontend React Developer",
        company: "Microsoft",
        location: "London",
        salary: "$4800",
        experience: "Junior",
        type: "Full Time",
    },
    {
        id: 3,
        title: "DevOps Engineer",
        company: "Amazon",
        location: "Berlin",
        salary: "$6200",
        experience: "Senior",
        type: "Remote",
    },
];

export default function VacancyList() {
    useEffect(() => {
        console.log("VacancyList загружен");
    }, []);

    return (
        <section className="mx-auto mt-20 max-w-5xl px-6">

            <h2 className="mb-8 text-4xl font-bold">
                Популярные вакансии
            </h2>

            <div className="space-y-6">
                {vacancies.map((vacancy) => (
                    <VacancyCard
                        key={vacancy.id}
                        vacancy={vacancy}
                    />
                ))}
            </div>

        </section>
    );
}