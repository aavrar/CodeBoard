"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Menu, X, User, LogOut, Settings, GraduationCap, Users, Crown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const getNavItems = () => {
    const baseItems = [
      { href: "/", label: "Home", roles: ["COMMUNITY", "RESEARCHER", "ADMIN"] },
      { href: "/submit", label: "Submit", roles: ["COMMUNITY", "RESEARCHER", "ADMIN"] },
      { href: "/explore", label: "Explore", roles: ["COMMUNITY", "RESEARCHER", "ADMIN"] },
      { href: "/dashboard", label: "Dashboard", roles: ["COMMUNITY", "RESEARCHER", "ADMIN"] },
    ]

    const roleBasedItems = [
      { href: "/research", label: "Research", roles: ["RESEARCHER", "ADMIN"] },
      { href: "/admin", label: "Admin", roles: ["ADMIN"] },
      { href: "/about", label: "About", roles: ["COMMUNITY", "RESEARCHER", "ADMIN"] },
    ]

    const allItems = [...baseItems, ...roleBasedItems]

    // If user is not authenticated, show basic items only
    if (!isAuthenticated || !user) {
      return baseItems.filter(item => item.href === "/" || item.href === "/about")
    }

    // Filter items based on user tier
    return allItems.filter(item => item.roles.includes(user.tier))
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">CodeBoard</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-teal-600",
                  pathname === item.href ? "text-teal-600 border-b-2 border-teal-600 pb-1" : "text-neutral-600",
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Authentication Section */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-teal-600" />
                        </div>
                      )}
                      <div className="text-left">
                        <div className="text-sm font-medium text-neutral-900">
                          {user.displayName || user.name || 'User'}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            user.tier === 'ADMIN' && "bg-purple-100 text-purple-800 border-purple-200",
                            user.tier === 'RESEARCHER' && "bg-emerald-100 text-emerald-800 border-emerald-200",
                            user.tier === 'COMMUNITY' && "bg-blue-100 text-blue-800 border-blue-200"
                          )}>
                            {user.tier === 'ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                            {user.tier === 'RESEARCHER' && <GraduationCap className="h-3 w-3 mr-1" />}
                            {user.tier === 'COMMUNITY' && <Users className="h-3 w-3 mr-1" />}
                            {user.tier}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Role-based menu items */}
                    {(user.tier === 'RESEARCHER' || user.tier === 'ADMIN') && (
                      <DropdownMenuItem asChild>
                        <Link href="/research" className="flex items-center">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          Research Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {user.tier === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Crown className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {user.tier === 'COMMUNITY' && (
                      <DropdownMenuItem asChild>
                        <Link href="/auth/apply-researcher" className="flex items-center">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          Apply for Researcher Access
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Link href="/auth/register">Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 text-base font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "text-teal-600 bg-teal-50"
                      : "text-neutral-600 hover:text-teal-600 hover:bg-neutral-50",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
