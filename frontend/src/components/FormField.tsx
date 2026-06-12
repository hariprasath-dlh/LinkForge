import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, type, className, ...rest }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;
  return (
    <div className="space-y-1.5">
      <label className="block text-xs forge-mono uppercase tracking-wider text-forge-muted">
        {label}
      </label>
      <div className="relative">
        <input
          {...rest}
          type={inputType}
          className={`forge-input forge-input-focus ${error ? "!border-forge-error" : ""} ${isPassword ? "pr-10" : ""} ${className || ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-forge-muted hover:text-forge-text"
            tabIndex={-1}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-forge-error forge-mono">{error}</p>}
    </div>
  );
}
