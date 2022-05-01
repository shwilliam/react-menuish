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
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  useDialogContext,
} from './dialog'
import { TrayProps } from './popout'
import { useSafeViewportHeight } from '../hooks/viewport-size'
import { useMounted } from '../hooks/mounted'
import { useScrolledToBottom } from '../hooks/scrolled-to-bottom'

export const Tray = forwardRef(
  ({ content, children, ...props }: TrayProps, ref: any) => {
    const dialogCtxt = useDialogContext()
    const [innerIsOpen, setInnerIsOpen] = useState(dialogCtxt.isOpen)

    useEffect(() => {
      if (dialogCtxt.isOpen) setInnerIsOpen(true)
    }, [dialogCtxt.isOpen])

    return (
      <Dialog isOpen={innerIsOpen} overlay {...props}>
        <TrayContent
          ref={ref}
          onRest={() => !dialogCtxt.isOpen && setInnerIsOpen(false)}
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
  isFullscreen?: boolean
  onRest?: () => void
  onScrolledToBottom?: () => void
}

const TrayContent = forwardRef(
  (
    {
      isFullscreen = false,
      onRest,
      header,
      onScrolledToBottom,
      children,
      ...props
    }: TrayContentProps,
    ref,
  ) => {
    const dialogCtxt = useDialogContext()
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
        hasMounted && dialogCtxt.isOpen
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
      if (!dialogCtxt.isOpen) return
      window.addEventListener('resize', measureTray)
      return () => window.removeEventListener('resize', measureTray)
    }, [dialogCtxt.isOpen, measureTray])

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

interface SubtrayProps extends DialogContentProps {}

export const Subtray = forwardRef(
  ({ children, ...props }: SubtrayProps, ref: any) => {
    const dialogCtxt = useDialogContext()

    return (
      <Transition
        items={dialogCtxt.isOpen}
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
              <button onClick={dialogCtxt.onClose}>close</button>
              {children}
            </DialogContent>
          )
        }
      </Transition>
    )
  },
)
