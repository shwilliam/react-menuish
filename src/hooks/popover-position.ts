import { useState } from 'react'
import {
  flip,
  limitShift,
  offset,
  shift,
  size,
  Dimensions,
  ElementRects,
  Placement,
  useFloating,
} from '@floating-ui/react-dom'

export interface PopoverPosition {
  x: number
  y: number
}

interface UsePopoverPositionOptions {
  placement?: Placement
}

export const usePopoverPosition = (options: UsePopoverPositionOptions = {}) => {
  const { placement = 'bottom' } = options
  const [popoverSize, setPopoverSize] = useState<Dimensions & ElementRects>()
  const position = useFloating({
    placement,
    middleware: [
      offset(2),
      shift({
        limiter: limitShift({
          offset: ({ reference, floating, placement }) => ({
            mainAxis: reference.height,
          }),
        }),
      }),
      flip(),
      size({ apply: (data) => setPopoverSize(data) }),
    ],
  })

  return { position, size: popoverSize }
}
