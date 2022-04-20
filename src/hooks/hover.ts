import {
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import _ from 'lodash'

interface UseHoverOptions {
  onHoverStart?: () => void
  onHoverEnd?: () => void
  isDisabled?: boolean
}

export const useHover = ({
  isDisabled = false,
  onHoverStart,
  onHoverEnd,
}: UseHoverOptions) => {
  const [isHovered, setIsHovered] = useState(false)
  const triggerHoverStart = useCallback(() => {
    if (isDisabled || isHovered) return
    onHoverStart?.()
    setIsHovered(true)
  }, [onHoverStart, isDisabled, isHovered])
  const triggerHoverEnd = useCallback(() => {
    if (!isHovered) return
    onHoverEnd?.()
    setIsHovered(false)
  }, [onHoverEnd, isHovered])
  const hoverProps = useMemo(() => {
    if (_.isUndefined(typeof PointerEvent)) return {}

    const hoverProps: HTMLAttributes<HTMLElement> = {
      onPointerEnter: (e) => {
        if (
          e.pointerType === 'touch' ||
          !e.currentTarget.contains(e.target as HTMLElement)
        )
          return

        triggerHoverStart()
      },
      onPointerLeave: (e) => {
        if (
          !e.currentTarget.contains(e.target as HTMLElement) ||
          e.pointerType === 'touch' ||
          isDisabled
        )
          return

        triggerHoverEnd()
      },
    }

    return hoverProps
  }, [triggerHoverStart, triggerHoverEnd, isDisabled])

  useEffect(() => {
    if (isDisabled) triggerHoverEnd()
  }, [isDisabled, triggerHoverEnd])

  return {
    isHovered,
    triggerHoverStart,
    triggerHoverEnd,
    hoverProps,
  }
}
