"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    // Determine if we should show the toggle icon
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="relative w-full group">
        <input
          type={inputType}
          className={cn(
            "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50",
            isPassword && "pr-10",
            className,
          )}
          ref={ref}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-purple-500 hover:bg-purple-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={2.5} />
            )}
          </button>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
