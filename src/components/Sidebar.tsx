"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Customers", href: "/customers", icon: "👥" },
  { name: "Payments", href: "/payments", icon: "💰" },
  { name: "Archive", href: "/archive", icon: "📁" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show sidebar on login/signup pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-800 border border-slate-700"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-slate-50">NVH Agri CRM</h1>
            <p className="text-xs text-slate-400 mt-1">Customer Management System</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                    ${isActive
                      ? "bg-emerald-500 text-slate-950 font-medium"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-slate-950"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User/Logout section */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-50">Staff User</p>
                  <p className="text-xs text-slate-400">Admin</p>
                </div>
              </div>
              <LogoutButton compact />
            </div>
            
            {/* Stats summary */}
            <div className="mt-4 p-3 bg-slate-800/50 rounded-md">
              <p className="text-xs text-slate-400 mb-1">Today&apos;s summary</p>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Active customers</span>
                <span className="text-emerald-400">...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}