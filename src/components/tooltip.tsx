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
import { useIsMobile } from '../hooks/is-mobile'

interface TooltipTriggerContext extends DialogVariantTriggerProps {
  onVirtualFocusStart?: () => void
  onVirtualFocusEnd?: () => void
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
    const isMobile = useIsMobile()
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
        {...(isMobile ? {} : { role: 'tooltip' })}
        trigger={({ ref }) =>
          trigger({
            ref,
            ...props,
            ...(isMobile
              ? { onClick: open }
              : {
                  ...hoverProps,
                  onVirtualFocusStart: open,
                  onVirtualFocusEnd: () => close(true),
                }),
          })
        }
        dialog={{
          isOpen,
          onClose: isMobile ? () => close(true) : close,
          noFocusLock: !isMobile,
          isolateDialog: isMobile,
          ...(props.dialog || {}),
        }}
      >
        {isMobile
          ? children
          : transitions(
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
