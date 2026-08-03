interface LocationInputProps {
    value: string;
    onChange: (value: string) => void;
}

export default function LocationInput({
    value,
    onChange,
}: LocationInputProps) {
    return (
        <input
            type="text"
            placeholder="Город или Remote..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
        />
    );
}