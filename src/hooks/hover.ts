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
  const triggerHoverEnd = useCallback(() => {
    onHoverEnd?.()
    setIsHovered(false)
  }, [onHoverEnd])
  const hoverProps = useMemo(() => {
    if (_.isUndefined(typeof PointerEvent)) return {}

    const hoverProps: HTMLAttributes<HTMLElement> = {
      onPointerEnter: (e) => {
        if (
          isDisabled ||
          e.pointerType === 'touch' ||
          isHovered ||
          !e.currentTarget.contains(e.target as HTMLElement)
        )
          return

        onHoverStart?.()
        setIsHovered(true)
      },
      onPointerLeave: (e) => {
        if (
          e.currentTarget.contains(e.target as HTMLElement) &&
          e.pointerType !== 'touch' &&
          !isDisabled &&
          isHovered
        )
          triggerHoverEnd()
      },
    }

    return hoverProps
  }, [isDisabled, isHovered, onHoverStart, triggerHoverEnd])

  useEffect(() => {
    if (isDisabled) triggerHoverEnd()
  }, [isDisabled, triggerHoverEnd])

  return {
    isHovered,
    hoverProps,
  }
}
