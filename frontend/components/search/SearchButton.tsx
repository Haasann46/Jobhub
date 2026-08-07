interface SearchButtonProps {
    onClick: () => void;
}

export default function SearchButton({
    onClick,
}: SearchButtonProps) {
    return (
        <button
            onClick={onClick}
            className="
                flex items-center justify-center gap-2
                rounded-xl
                bg-blue-600
                px-7
                py-3
                font-semibold
                text-white
                shadow-lg
                transition-all
                duration-200
                hover:bg-blue-700
                hover:shadow-xl
                active:scale-[0.98]
            "
        >
            <span>🔎</span>

            <span>Найти</span>
        </button>
    );
}