"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Stethoscope } from "lucide-react";

export function Topbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/providers", label: "Providers", icon: Stethoscope },
  ];

  return (
    <header className="fixed left-0 top-0 z-40 w-full border-b border-blue-100 bg-white/70 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        {/* TODO: Replace with actual logo */}
        <h1 className="bg-linear-to-r from-blue-600 to-blue-400 bg-clip-text text-xs md:text-xl font-semibold text-transparent">
          Beauty Med Spa
        </h1>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <div className="hidden md:block">{item.label}</div>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
