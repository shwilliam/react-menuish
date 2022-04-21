import { useLayoutEffect, useRef } from 'react'

export const useSyncedRef = (value: any) => {
  const ref = useRef<any>(value)

  useLayoutEffect(() => {
    ref.current = value
  }, [value])

  return ref
}
