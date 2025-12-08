// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isClient) {
      const checkAuth = async () => {
        try {
          const res = await fetch('/api/auth/check')
          const data = await res.json()
          
          if (data.authenticated) {
            router.push('/dashboard')
          } else {
            router.push('/login')
          }
        } catch (error) {
          router.push('/login')
        }
      }

      checkAuth()
    }
  }, [router, isClient])

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}