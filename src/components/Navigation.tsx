'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/lib/types/database'

interface NavigationProps {
  role: UserRole
}

export default function Navigation({ role }: NavigationProps) {
  const pathname = usePathname()

  const staffLinks = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/inventory', label: 'Inventory', icon: '📦' },
    { href: '/scan', label: 'Scan', icon: '📸' },
  ]

  const managerLinks = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/inventory', label: 'Inventory', icon: '📦' },
    { href: '/transfers', label: 'Transfers', icon: '🔄' },
    { href: '/reports', label: 'Reports', icon: '📊' },
  ]

  const ownerLinks = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/products', label: 'Products', icon: '👟' },
    { href: '/inventory', label: 'Inventory', icon: '📦' },
    { href: '/reports', label: 'Reports', icon: '📊' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  const links = role === 'owner' ? ownerLinks : role === 'manager' ? managerLinks : staffLinks

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl mb-1">{link.icon}</span>
              <span className="text-xs">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
