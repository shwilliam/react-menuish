import { useState, useRef, useEffect, forwardRef } from 'react'
import styled from 'styled-components'
import { animated, useSpring } from 'react-spring'
import useMeasure from 'react-use-measure'
import useOnClickOutside from 'use-onclickoutside'
import { Dialog, DialogContent, DialogContentProps } from './dialog'
import { mergeRefs } from '../util/merge-refs'

interface TrayProps extends TrayContentProps {
  isOpen?: boolean
  onClose: () => void
}

export const Tray = forwardRef(
  ({ isOpen, onClose, children, ...props }: TrayProps, ref: any) => {
    const innerRef = useRef<any>()
    const [innerIsOpen, setInnerIsOpen] = useState(isOpen)

    useEffect(() => {
      if (isOpen) setInnerIsOpen(true)
    }, [isOpen])

    useOnClickOutside(innerRef, onClose)

    return (
      <Dialog isOpen={innerIsOpen}>
        <TrayContent
          ref={mergeRefs(ref, innerRef)}
          isOpen={isOpen}
          onRest={() => !isOpen && setInnerIsOpen(false)}
          {...props}
        >
          {children}
        </TrayContent>
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
    const [wrapperRef, { height: wrapperHeight }] = useMeasure()
    const [innerRef, { height: contentHeight }] = useMeasure()
    const springStyle = useSpring({
      height: isOpen
        ? isFullscreen
          ? wrapperHeight
          : Math.min(contentHeight, wrapperHeight)
        : 0,
      onRest,
    })

    return (
      <Overlay ref={wrapperRef}>
        <StyledDialogContent ref={ref} style={springStyle as any} {...props}>
          <div ref={innerRef}>{children}</div>
        </StyledDialogContent>
      </Overlay>
    )
  },
)

const Overlay = styled(animated.div)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
`

const StyledDialogContent = styled(DialogContent)`
  position: absolute;
  bottom: 0;
  width: 100%;
  border: 1px solid blue;
  overflow: hidden;
`
