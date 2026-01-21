import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Accordion({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-semibold text-left text-gray-900">{title}</span>
        <ChevronDown className={cn('h-5 w-5 text-gray-500 transition-transform duration-200', open ? 'rotate-180' : '')} />
      </button>
      <div className={cn("grid transition-all duration-200 ease-in-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 text-gray-600 border-t border-gray-100 mt-2">
                {children}
            </div>
        </div>
      </div>
    </div>
  )
}
