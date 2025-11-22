// src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Link href="/admin">
        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-2xl px-8 py-6 text-xl">
          ADMIN
        </Button>
      </Link>
    </div>
  )
}