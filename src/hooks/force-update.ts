import { useState, useCallback } from 'react'

export const useForceUpdate = () => {
  const [, setState] = useState<{}>(Object.create(null))
  return useCallback(() => {
    setState(Object.create(null))
  }, [])
}
