'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface PlacementGuardProps {
  placementDate: string | null
}

export default function PlacementGuard({ placementDate }: PlacementGuardProps) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Jika user belum punya placement_date (belum ikut quiz), 
    // dan rute yang sedang diakses bukanlah /placement-quiz, maka paksa redirect.
    if (!placementDate && !pathname.includes('/placement-quiz')) {
      router.push('/placement-quiz')
    }
  }, [placementDate, pathname, router])

  return null // Ini adalah komponen logic, tidak me-render UI apapun.
}
