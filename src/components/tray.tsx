import {
  useState,
  useEffect,
  forwardRef,
  ReactNode,
  useRef,
  useCallback,
} from 'react'
import styled from 'styled-components'
import { Transition, useSpring, config, a } from 'react-spring'
import useMeasure from 'react-use-measure'
import { Dialog, DialogContent, DialogContentProps } from './dialog'
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
      <Dialog isOpen={innerIsOpen} onClose={onClose} overlay {...props}>
        <TrayContent
          ref={ref}
          isOpen={isOpen}
          onRest={() => !isOpen && setInnerIsOpen(false)}
          {...content}
        >
          {children}
        </TrayContent>
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
            ...(isFullscreen ? {} : { minHeight: `${trayHeight}px` }),
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

interface SubtrayProps extends DialogContentProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Subtray = forwardRef(
  ({ isOpen, children, ...props }: SubtrayProps, ref: any) => {
    return (
      <Transition
        items={isOpen}
        from={{ translateX: '100vw', opacity: 1 }}
        enter={{ translateX: '0px', opacity: 1 }}
        leave={{ translateX: '100vw', opacity: 0 }}
        config={{
          ...config.gentle,
          bounce: 0,
        }}
      >
        {(style, item) =>
          item && (
            <DialogContent
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                height: '100%',
                width: '100%',
                background: 'white',
                zIndex: 2,
                ...style,
              }}
            >
              <button onClick={props.onClose}>close</button>
              {children}
            </DialogContent>
          )
        }
      </Transition>
    )
  },
)
