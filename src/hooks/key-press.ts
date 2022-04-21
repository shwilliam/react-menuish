import { useCallback, useEffect } from 'react'
import _ from 'lodash'

export const useKeyPress = (
  key: KeyboardEvent['key'] | null,
  fn: () => void,
  event: 'keyup' | 'keypress' | 'keydown' = 'keypress',
  preventDefault?: boolean,
) => {
  const onPress = useCallback(
    (e: KeyboardEvent) => {
      if (_.isNull(key) || e.key === key) {
        fn()
        if (preventDefault) e.preventDefault()
      }
    },
    [key, fn, preventDefault],
  )

  useEffect(() => {
    window.addEventListener(event, onPress)
    return () => window.removeEventListener(event, onPress)
  }, [onPress, event])
}
