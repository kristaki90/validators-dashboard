"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/app/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const navLinks = [
    { href: "/", label: "Overview" },
]

export function NavMenu() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/60 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/" className="flex items-center gap-2 text-slate-900">
                    <div className="text-lg font-semibold tracking-tight">Sui Validators</div>
                    <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold uppercase text-indigo-600">
                        Dashboard
                    </span>
                </Link>

                <NavigationMenu viewport={false}>
                    <NavigationMenuList className="flex-wrap gap-2">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)

                            return (
                                <NavigationMenuItem key={link.href}>
                                    <NavigationMenuLink
                                        asChild
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                                            isActive
                                                ? "bg-slate-900 text-white shadow-lg"
                                                : "bg-transparent text-slate-600 hover:text-slate-900"
                                        )}
                                    >
                                        <Link href={link.href}>{link.label}</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )
                        })}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </header>
    )
}

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}
