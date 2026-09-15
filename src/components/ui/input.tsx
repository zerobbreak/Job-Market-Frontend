import * as React from "react"

import { cn } from "../../lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-base text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 hover:border-neutral-300 focus-visible:border-neutral-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/5 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
