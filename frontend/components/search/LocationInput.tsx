interface LocationInputProps {
    value: string;
    onChange: (value: string) => void;
    onEnter?: () => void;
}

export default function LocationInput({
    value,
    onChange,
    onEnter,
}: LocationInputProps) {
    return (
        <input
            type="text"
            value={value}
            placeholder="Город или Remote"
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