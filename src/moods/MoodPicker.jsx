export default function MoodPicker({ moods, value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {moods.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`p-3 rounded-2xl border shadow-sm ${
            value === m.id ? "ring-2 ring-black" : ""
          }`}
          aria-pressed={value === m.id}
          title={m.name}
        >
          <div className="text-2xl">{m.emoji}</div>
          <div className="text-xs mt-1">{m.name}</div>
        </button>
      ))}
    </div>
  );
}
