import { useState, useEffect, forwardRef } from 'react'
import styled from 'styled-components'
import { useSpring } from 'react-spring'
import useMeasure from 'react-use-measure'
import useOnClickOutside from 'use-onclickoutside'
import { useId } from '@react-aria/utils'
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  useDialogContext,
} from './dialog'
import { Overlay, OverlayProps } from './overlay'
import { useFocusTakeoverContext } from './focus-takeover'
import { useSafeViewportHeight } from '../hooks/viewport-size'
import { useMounted } from '../hooks/mounted'
import { mergeRefs } from '../util/merge-refs'

interface TrayProps extends TrayContentProps {
  id?: string
  isOpen?: boolean
  overlay?: OverlayProps
}

export const Tray = forwardRef(
  ({ id, isOpen, overlay = {}, children, ...props }: TrayProps, ref: any) => {
    const innerId = useId(id)
    const [innerIsOpen, setInnerIsOpen] = useState(isOpen)

    useEffect(() => {
      if (isOpen) setInnerIsOpen(true)
    }, [isOpen])

    return (
      <Dialog id={innerId} isOpen={innerIsOpen}>
        <Overlay {...overlay}>
          <TrayContent
            ref={ref}
            isOpen={isOpen}
            onRest={() => !isOpen && setInnerIsOpen(false)}
            {...props}
          >
            {children}
          </TrayContent>
        </Overlay>
      </Dialog>
    )
  },
)

interface TrayContentProps extends DialogContentProps {
  isOpen?: boolean
  isFullscreen?: boolean
  onRest?: () => void
  onClose?: () => void
}

const TrayContent = forwardRef(
  (
    {
      isOpen = false,
      isFullscreen = false,
      onRest,
      onClose,
      children,
      ...props
    }: TrayContentProps,
    ref,
  ) => {
    const { isActiveFocusBoundary } = useFocusTakeoverContext()
    const { contentRef, dialogId } = useDialogContext()
    const hasMounted = useMounted()
    const viewportHeight = useSafeViewportHeight()
    const [innerRef, { height: contentHeight }] = useMeasure()
    const springStyle = useSpring({
      height:
        hasMounted && isOpen
          ? isFullscreen
            ? viewportHeight
            : Math.min(contentHeight, viewportHeight)
          : 0,
      onRest,
    })

    useOnClickOutside(contentRef, () => {
      if (dialogId && isActiveFocusBoundary(dialogId)) onClose?.()
    })

    return (
      <StyledDialogContent
        ref={mergeRefs(contentRef, ref)}
        style={springStyle as any}
        {...props}
      >
        <div
          ref={innerRef}
          style={{ maxHeight: `${viewportHeight}px`, overflowY: 'auto' }}
        >
          {children}
        </div>
      </StyledDialogContent>
    )
  },
)

const StyledDialogContent = styled(DialogContent)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid blue;
`
