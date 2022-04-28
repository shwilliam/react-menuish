import { ForwardedRef, forwardRef, ReactNode } from 'react'
import { useTooltip } from '../hooks/tooltip'
import { useHover } from '../hooks/hover'
import { useId } from '../hooks/id'
import { useKeyPress } from '../hooks/key-press'
import { Popout, PopoutProps } from './dialog-variant'

interface TooltipTriggerContext extends PopoutTriggerContext {
  onVirtualFocusStart: () => void
  onVirtualFocusEnd: () => void
}

interface TooltipProps extends PopoutProps {
  trigger: (triggerContext: TooltipTriggerContext) => ReactNode
  children: ReactNode
}

export const Tooltip = forwardRef(
  ({ trigger, children, ...props }: TooltipProps, ref: ForwardedRef<any>) => {
    const tooltipId = useId()
    const { isOpen, open, close } = useTooltip({})
    const { hoverProps } = useHover({
      onHoverStart: open,
      onHoverEnd: close,
    })

    useKeyPress('Escape', close, 'keydown')

    return (
      <Popout
        isOpen={isOpen}
        onClose={() => close()}
        trigger={(triggerProps) =>
          trigger({
            ...triggerProps,
            ...hoverProps,
            ...props,
            onVirtualFocusStart: open,
            onVirtualFocusEnd: () => close(true),
          })
        }
        isFocusTakeoverDisabled
        noFocusLock
        isolateDialog={false}
        role="tooltip"
        id={tooltipId}
      >
        {children}
      </Popout>
    )
  },
)
