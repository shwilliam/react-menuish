import { useState, useEffect, MutableRefObject } from 'react'

export const useScrolledToBottom = (
  elRef: MutableRefObject<any>,
  cb?: () => void,
) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false)

  useEffect(() => {
    if (elRef.current?.parentElement) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          console.log('entry: ', entry)
          const isBottom = entry.isIntersecting
          setIsScrolledToBottom(isBottom)
          if (isBottom) cb?.()
        },
        { root: elRef.current.parentElement },
      )
      observer.observe(elRef.current)
      return () => observer.disconnect()
    } else setIsScrolledToBottom(false)
  }, [elRef, cb])

  return isScrolledToBottom
}
