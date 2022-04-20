import { useEffect, useRef } from 'react'

// trigger cb with deps on unmount
export const useOnUnmount = (cb: () => void, deps: any[]) => {
  const isUnmountingRef = useRef(false)

  useEffect(
    () => () => {
      isUnmountingRef.current = true
    },
    [],
  )

  useEffect(
    () => () => {
      if (isUnmountingRef.current) cb()
    },
    deps,
  )
}
