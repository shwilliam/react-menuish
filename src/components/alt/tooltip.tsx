import { ForwardedRef, forwardRef, HTMLAttributes, ReactNode } from 'react'
import { Popout, PopoutProps, PopoutTriggerContext } from './popout'
import { useTooltip } from '../../hooks/tooltip'
import { useHover } from '../../hooks/hover'

interface TooltipTriggerContext extends PopoutTriggerContext {
  hoverProps: HTMLAttributes<any>
}

interface TooltipProps {
  trigger: (triggerContext: TooltipTriggerContext) => ReactNode
  popout?: Partial<PopoutProps>
  children: ReactNode
}

export const Tooltip = forwardRef(
  (
    { trigger, popout, children, ...props }: TooltipProps,
    ref: ForwardedRef<any>,
  ) => {
    const { isOpen, open, close } = useTooltip({})
    const { hoverProps } = useHover({
      onHoverStart: () => open(),
      onHoverEnd: () => close(),
    })

    return (
      <Popout
        isOpen={isOpen}
        onClose={() => close()}
        trigger={(triggerProps) =>
          trigger({ ...triggerProps, hoverProps, ...props })
        }
        {...popout}
      >
        {children}
      </Popout>
    )
  },
)
