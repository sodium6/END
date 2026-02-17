// Toggle Switch Component
function ToggleSwitch({ label, checked, onChange }) {
    return (
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-xs text-gray-700">{label}</span>
        <div
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            checked ? "bg-emerald-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              checked ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </div>
      </label>
    );
  }

export default ToggleSwitch;