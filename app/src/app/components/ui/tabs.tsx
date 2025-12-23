"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

interface TabsProps {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
    className?: string
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={cn("flex", className)}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

interface TabsListProps {
    children: React.ReactNode
    className?: string
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {children}
        </div>
    )
}

interface TabsTriggerProps {
    value: string
    children: React.ReactNode
    className?: string
    title?: string
}

export function TabsTrigger({ value, children, className, title }: TabsTriggerProps) {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsTrigger must be used within Tabs")

    const isActive = context.value === value

    return (
        <div className="relative group">
            <button
                type="button"
                onClick={() => context.onValueChange(value)}
                className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all",
                    "hover:bg-gradient-to-br hover:from-indigo-500/20 hover:to-purple-500/20 hover:scale-105",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                    isActive
                        ? "bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-white shadow-lg border border-white/20"
                        : "text-slate-600 hover:text-slate-900",
                    className
                )}
            >
                {children}
            </button>
            {title && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {title}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
                </div>
            )}
        </div>
    )
}

interface TabsContentProps {
    value: string
    children: React.ReactNode
    className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsContent must be used within Tabs")

    if (context.value !== value) return null

    return (
        <div className={cn("flex-1", className)}>
            {children}
        </div>
    )
}

