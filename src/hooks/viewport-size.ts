import { useEffect, useState, useRef } from 'react'

interface ViewportSize {
  width: number
  height: number
}

const visualViewport = typeof window !== 'undefined' && window.visualViewport

export const useViewportSize = () => {
  const [size, setSize] = useState<ViewportSize>(() => getViewportSize())

  useEffect(() => {
    // tracks available height handling opening/closing of ios virtual keyboard
    const onResize = () => {
      setSize((size) => {
        let newSize = getViewportSize()
        if (newSize.width === size.width && newSize.height === size.height) {
          return size
        }
        return newSize
      })
    }

    if (!visualViewport) window.addEventListener('resize', onResize)
    else visualViewport.addEventListener('resize', onResize)

    return () => {
      if (!visualViewport) window.removeEventListener('resize', onResize)
      else visualViewport.removeEventListener('resize', onResize)
    }
  }, [])

  return size
}

const getViewportSize = () => {
  const size: ViewportSize = {
    width: (visualViewport && visualViewport?.width) || window.innerWidth,
    height: (visualViewport && visualViewport?.height) || window.innerHeight,
  }
  return size
}

export const useSafeViewportHeight = () => {
  /*
    measure window height in js rather than use css percentages so contents (e.g. menu)
    can inherit max-height properly

    using percentages does not work because there is nothing to base the percentage on
    we cannot use vh units because mobile browsers adjust this dynamically when address
    or bar/bottom toolbars show and hide on scroll and vh units are fixed

    the visual viewport is smaller than the layout viewport when virtual keyboard is up
    so use the visual viewport api to ensure trays, etc are displayed above the keyboard
  */
  const viewport = useViewportSize()
  const [height, setHeight] = useState(viewport.height)
  const timeoutRef = useRef<any>()

  useEffect(() => {
    clearTimeout(timeoutRef.current)

    // avoid visible empty space under trays, etc when height decreasing
    if (viewport.height < height && viewport.height < window.innerHeight) {
      timeoutRef.current = setTimeout(() => {
        setHeight(viewport.height)
      }, 500)
    } else setHeight(viewport.height)
  }, [height, viewport.height])

  return height
}

export const useSafeViewportHeightVar = () => {
  const height = useSafeViewportHeight()
  const styleVars: any = {
    '--menuish-visual-viewport-height': `${height}px`,
  }
  return styleVars
}
