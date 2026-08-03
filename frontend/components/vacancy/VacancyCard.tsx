import { Vacancy } from "@/types/vacancy";

interface VacancyCardProps {
    vacancy: Vacancy;
}

export default function VacancyCard({
    vacancy,
}: VacancyCardProps) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">

            <div className="flex items-start justify-between">

                <div>

                    <h3 className="text-2xl font-bold">
                        {vacancy.title}
                    </h3>

                    <p className="mt-2 text-slate-500">
                        {vacancy.company}
                    </p>

                </div>

                <span className="rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                    {vacancy.salary}
                </span>

            </div>

            <div className="mt-6 flex flex-wrap gap-3">

                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm">
                    📍 {vacancy.location}
                </span>

                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm">
                    💼 {vacancy.experience}
                </span>

                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700">
                    {vacancy.type}
                </span>

            </div>

        </div>
    );
}