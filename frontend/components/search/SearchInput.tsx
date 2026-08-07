interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onEnter?: () => void;
}

export default function SearchInput({
    value,
    onChange,
    onEnter,
}: SearchInputProps) {
    return (
        <input
            type="text"
            value={value}
            placeholder="Должность, компания или технология..."
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    onEnter?.();
                }
            }}
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-400"
        />
    );
}