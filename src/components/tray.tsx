import { useState, useRef, useEffect, forwardRef } from 'react'
import styled from 'styled-components'
import { useSpring } from 'react-spring'
import useMeasure from 'react-use-measure'
import useOnClickOutside from 'use-onclickoutside'
import { Dialog, DialogContent, DialogContentProps } from './dialog'
import { Overlay, OverlayProps } from './overlay'
import { mergeRefs } from '../util/merge-refs'
import { useSafeViewportHeight } from '../hooks/viewport-size'
import { useMounted } from '../hooks/mounted'

interface TrayProps extends TrayContentProps {
  isOpen?: boolean
  onClose: () => void
  overlay?: OverlayProps
}

export const Tray = forwardRef(
  (
    { isOpen, onClose, overlay = {}, children, ...props }: TrayProps,
    ref: any,
  ) => {
    const innerRef = useRef<any>()
    const [innerIsOpen, setInnerIsOpen] = useState(isOpen)

    useEffect(() => {
      if (isOpen) setInnerIsOpen(true)
    }, [isOpen])

    useOnClickOutside(innerRef, onClose)

    return (
      <Dialog isOpen={innerIsOpen}>
        <Overlay {...overlay}>
          <TrayContent
            ref={mergeRefs(ref, innerRef)}
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
}

const TrayContent = forwardRef(
  (
    {
      isOpen = false,
      isFullscreen = false,
      onRest,
      children,
      ...props
    }: TrayContentProps,
    ref,
  ) => {
    const hasMounted = useMounted()
    const height = useSafeViewportHeight()
    const [innerRef, { height: contentHeight }] = useMeasure()
    const springStyle = useSpring({
      height:
        hasMounted && isOpen
          ? isFullscreen
            ? height
            : Math.min(contentHeight, height)
          : 0,
      onRest,
    })

    return (
      <StyledDialogContent ref={ref} style={springStyle as any} {...props}>
        <div ref={innerRef}>{children}</div>
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
