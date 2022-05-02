import { useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import { useId } from './id'

const SHOW_TOOLTIP_DELAY = 800
const HIDE_TOOLTIP_DELAY = 500

const tooltips = {}
let globalForceImmediate = false
let globalShowTo: Timeout | null = null
let globalHideTo: Timeout | null = null

const clearGlobalShow = () => {
  if (!globalShowTo) return
  clearTimeout(globalShowTo)
  globalShowTo = null
}
const clearGlobalHide = () => {
  if (!globalHideTo) return
  clearTimeout(globalHideTo)
  globalHideTo = null
}

interface UseTooltipOptions {
  delay?: number
}
type Timeout = ReturnType<typeof setTimeout>

export const useTooltip = (options: UseTooltipOptions) => {
  const { delay = SHOW_TOOLTIP_DELAY } = options || {}
  const id = useId()
  const [isOpen, setIsOpen] = useState(false)
  const closeToRef = useRef<Timeout | null>(null)
  const setUpGlobalHideHandler = () => (tooltips[id] = hide)
  const closeAllOthers = () => {
    _.keys(tooltips).forEach((tooltipId) => {
      if (tooltipId !== id) {
        tooltips[tooltipId](true)
        delete tooltips[tooltipId]
      }
    })
  }
  const show = () => {
    if (closeToRef.current !== null) {
      clearTimeout(closeToRef.current)
      closeToRef.current = null
    }
    closeAllOthers()
    setUpGlobalHideHandler()
    globalForceImmediate = true
    setIsOpen(true)
    clearGlobalShow()
    clearGlobalHide()
  }
  const hide = (immediate?: boolean) => {
    if (immediate) {
      if (closeToRef.current !== null) {
        clearTimeout(closeToRef.current)
        closeToRef.current = null
      }
      setIsOpen(false)
    } else if (!closeToRef.current) {
      closeToRef.current = setTimeout(() => {
        closeToRef.current = null
        setIsOpen(false)
      }, HIDE_TOOLTIP_DELAY)
    }

    clearGlobalShow()

    if (globalForceImmediate) {
      if (globalHideTo) clearTimeout(globalHideTo)
      globalHideTo = setTimeout(() => {
        delete tooltips[id]
        globalHideTo = null
        globalForceImmediate = false
      }, HIDE_TOOLTIP_DELAY)
    }
  }
  const queueOpen = () => {
    closeAllOthers()
    setUpGlobalHideHandler()
    if (!isOpen && !globalShowTo && !globalForceImmediate)
      globalShowTo = setTimeout(() => show(), delay)
    else if (!isOpen) show()
  }

  useEffect(() => {
    return () => {
      if (closeToRef.current !== null) clearTimeout(closeToRef.current)
      if (tooltips[id]) delete tooltips[id]
    }
  }, [id])

  return {
    isOpen,
    open: (immediate?: boolean) => {
      if (!immediate && delay > 0 && !closeToRef.current) queueOpen()
      else show()
    },
    close: hide,
  }
}
