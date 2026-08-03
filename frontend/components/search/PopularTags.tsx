const tags = [
    "Python",
    "FastAPI",
    "React",
    "Remote",
];

export default function PopularTags() {
    return (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">

            <span className="text-sm text-slate-500">
                Популярное:
            </span>

            {tags.map((tag) => (
                <button
                    key={tag}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm transition hover:border-blue-500 hover:text-blue-600"
                >
                    {tag}
                </button>
            ))}

        </div>
    );
}