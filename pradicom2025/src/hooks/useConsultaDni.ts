// src/hooks/useConsultaDni.ts
import { useState } from 'react'

export function useConsultaDni() {
  const [loading, setLoading] = useState(false)

  const consultar = async (dni: string) => {
    if (dni.length !== 8) return null
    setLoading(true)
    try {
      const res = await fetch(`/api/dni?dni=${dni}`)
      const data = await res.json()
      setLoading(false)
      return data.success ? data : null
    } catch {
      setLoading(false)
      return null
    }
  }

  return { consultar, loading }
}