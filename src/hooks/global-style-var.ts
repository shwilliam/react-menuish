import { useEffect } from 'react'

export const useGlobalStyleVar = (property: string, value: string) => {
  useEffect(() => {
    document.body.style.setProperty(property, value)
    return () => {
      document.body.style.removeProperty(property)
    }
  }, [property, value])
}
