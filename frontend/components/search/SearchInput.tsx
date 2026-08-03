interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchInput({
    value,
    onChange,
}: SearchInputProps) {
    return (
        <input
            type="text"
            placeholder="Профессия, стек или ключевое слово..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
        />
    );
}