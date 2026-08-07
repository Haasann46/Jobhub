import {
    EmploymentType,
    ExperienceLevel,
} from "@/types/vacancy";

export function formatEmploymentType(
    type: EmploymentType,
): string {

    switch (type) {

        case "full_time":
            return "Full-time";

        case "part_time":
            return "Part-time";

        case "contract":
            return "Contract";

        case "internship":
            return "Internship";

        default:
            return type;

    }

}

export function formatExperience(
    level: ExperienceLevel,
): string {

    switch (level) {

        case "junior":
            return "Junior";

        case "middle":
            return "Middle";

        case "senior":
            return "Senior";

        default:
            return level;

    }

}

export function formatSalary(
    from: number | null,
    to: number | null,
): string {

    if (!from && !to) {
        return "Salary not specified";
    }

    const formatter = new Intl.NumberFormat(
        "en-US",
    );

    if (from && to) {
        return `$${formatter.format(from)} - $${formatter.format(to)}`;
    }

    if (from) {
        return `From $${formatter.format(from)}`;
    }

    return `Up to $${formatter.format(to!)}`;
}

export function formatPublishedDate(
    publishedAt: string,
): string {

    const now = new Date();

    const published = new Date(
        publishedAt,
    );

    const diff =
        now.getTime() -
        published.getTime();

    const minutes = Math.floor(
        diff / 60000,
    );

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(
        minutes / 60,
    );

    if (hours < 24) {
        return `${hours} h ago`;
    }

    const days = Math.floor(
        hours / 24,
    );

    if (days === 1) {
        return "Yesterday";
    }

    if (days < 7) {
        return `${days} days ago`;
    }

    return published.toLocaleDateString(
        "en-US",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    );
}