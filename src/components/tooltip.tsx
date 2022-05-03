import { ForwardedRef, forwardRef, ReactNode } from 'react'
import { useTransition, a, config } from 'react-spring'
import styled from 'styled-components'
import {
  DialogVariantTriggerProps,
  DialogVariantType,
  PopoutVariant,
  PopoutVariantProps,
} from './dialog-variant'
import { useKeyPress } from '../hooks/key-press'
import { useTooltip } from '../hooks/tooltip'
import { useHover } from '../hooks/hover'
import { useId } from '../hooks/id'

interface TooltipTriggerContext extends DialogVariantTriggerProps {
  onVirtualFocusStart: () => void
  onVirtualFocusEnd: () => void
}

interface TooltipProps<M extends DialogVariantType>
  extends Omit<PopoutVariantProps<M>, 'trigger'> {
  trigger: (triggerContext: TooltipTriggerContext) => ReactNode
}

export const Tooltip = forwardRef(
  <M extends DialogVariantType>(
    { trigger, children, ...props }: TooltipProps<M>,
    ref: ForwardedRef<any>,
  ) => {
    const tooltipId = useId()
    const { isOpen, open, close } = useTooltip({})
    const { hoverProps } = useHover({
      onHoverStart: open,
      onHoverEnd: close,
    })
    const transitions = useTransition(isOpen, {
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
      config: config.stiff,
    })

    useKeyPress('Escape', close, 'keydown')

    return (
      <PopoutVariant
        id={tooltipId}
        role="tooltip"
        trigger={(triggerProps) =>
          trigger({
            ...triggerProps,
            ...hoverProps,
            ...props,
            onVirtualFocusStart: open,
            onVirtualFocusEnd: () => close(true),
          })
        }
        dialog={{
          isOpen,
          onClose: close,
          noFocusLock: true,
          isolateDialog: false,
          ...(props.dialog || {}),
        }}
      >
        {transitions(
          (style, item) =>
            item && (
              <TooltipWrapper ref={ref} style={style}>
                {children}
              </TooltipWrapper>
            ),
        )}
      </PopoutVariant>
    )
  },
)

const TooltipWrapper = styled(a.div)`
  background: #222;
  color: white;
  border-radius: 4px;
  padding: 6px;
`
