interface SearchButtonProps {
    onClick: () => void;
}

export default function SearchButton({
    onClick,
}: SearchButtonProps) {
    return (
        <button
            onClick={onClick}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
            Искать
        </button>
    );
}