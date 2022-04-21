import {
  useState,
  useEffect,
  forwardRef,
  ReactNode,
  useRef,
  useCallback,
} from 'react'
import styled from 'styled-components'
import { useSpring } from 'react-spring'
import useMeasure from 'react-use-measure'
import { Dialog, DialogContent, DialogContentProps } from './dialog'
import { Overlay } from './overlay'
import { TrayProps } from './popout'
import { useSafeViewportHeight } from '../hooks/viewport-size'
import { useMounted } from '../hooks/mounted'
import { useScrolledToBottom } from '../hooks/scrolled-to-bottom'

export const Tray = forwardRef(
  ({ isOpen, onClose, content, children, ...props }: TrayProps, ref: any) => {
    const [innerIsOpen, setInnerIsOpen] = useState(isOpen)

    useEffect(() => {
      if (isOpen) setInnerIsOpen(true)
    }, [isOpen])

    return (
      <Dialog isOpen={innerIsOpen} onClose={onClose} {...props}>
        <Overlay>
          <TrayContent
            ref={ref}
            isOpen={isOpen}
            onRest={() => !isOpen && setInnerIsOpen(false)}
            {...content}
          >
            {children}
          </TrayContent>
        </Overlay>
      </Dialog>
    )
  },
)

export interface TrayContentProps extends DialogContentProps {
  header?: ReactNode
  isOpen?: boolean
  isFullscreen?: boolean
  onRest?: () => void
  onScrolledToBottom?: () => void
}

const TrayContent = forwardRef(
  (
    {
      isOpen = false,
      isFullscreen = false,
      onRest,
      header,
      onScrolledToBottom,
      children,
      ...props
    }: TrayContentProps,
    ref,
  ) => {
    const hasMounted = useMounted()
    const viewportHeight = useSafeViewportHeight()
    const [innerRef, { height: contentHeight }] = useMeasure()
    const [trayHeight, setTrayHeight] = useState(0)
    const measureTray = useCallback(() => {
      if (isFullscreen) return
      setTrayHeight(contentHeight)
    }, [isFullscreen, contentHeight])
    const springStyle = useSpring({
      height:
        hasMounted && isOpen
          ? isFullscreen
            ? viewportHeight
            : Math.min(contentHeight, viewportHeight)
          : 0,
      onRest: () => {
        onRest?.()
        measureTray()
      },
    })

    useEffect(() => {
      if (!isOpen) return
      window.addEventListener('resize', measureTray)
      return () => window.removeEventListener('resize', measureTray)
    }, [isOpen, measureTray])

    const bottomRef = useRef<any>()
    useScrolledToBottom(bottomRef, onScrolledToBottom)

    return (
      <StyledDialogContent ref={ref} style={springStyle as any} {...props}>
        <div
          ref={innerRef}
          style={{
            maxHeight: `${viewportHeight}px`,
            overflowY: 'auto',
            ...(isFullscreen
              ? {}
              : {
                  minHeight: `${trayHeight}px`,
                }),
          }}
        >
          {header ? (
            <div style={{ position: 'sticky', top: 0 }}>{header}</div>
          ) : null}
          {children}
          <div ref={bottomRef} />
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

interface SubtrayProps extends SubtrayContentProps {}

export const Subtray = forwardRef(
  ({ isOpen, children, ...props }: SubtrayProps, ref: any) => {
    const [innerIsOpen, setInnerIsOpen] = useState(isOpen)

    useEffect(() => {
      if (isOpen) setInnerIsOpen(true)
    }, [isOpen])

    if (!innerIsOpen) return null
    return (
      <SubtrayContent
        ref={ref}
        isOpen={isOpen}
        onRest={() => !isOpen && setInnerIsOpen(false)}
        {...props}
      >
        {children}
      </SubtrayContent>
    )
  },
)

interface SubtrayContentProps {
  isOpen?: boolean
  onRest?: () => void
  onClose?: () => void
  children: ReactNode
}

const SubtrayContent = forwardRef(
  (
    {
      isOpen = false,
      onRest,
      onClose,
      children,
      ...props
    }: SubtrayContentProps,
    ref: any,
  ) => {
    const hasMounted = useMounted()
    const springStyle = useSpring({
      x: hasMounted && isOpen ? '0vw' : '100vw',
      onRest,
    })

    return (
      <SubtrayContentWrapper
        ref={ref}
        style={{
          transform: springStyle.x.to((x) => `translateX(${x})`) as any,
        }}
        {...props}
      >
        <button onClick={onClose}>close</button>
        {children}
      </SubtrayContentWrapper>
    )
  },
)

const SubtrayContentWrapper = styled(DialogContent)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-y: auto;
  background: white;
`
