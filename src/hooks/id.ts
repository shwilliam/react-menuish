import { useRef } from 'react'
import { nanoid } from 'nanoid'

export const useId = (id?: string) => {
  const idRef = useRef(id || nanoid())
  return idRef.current
}
