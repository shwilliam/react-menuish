import {
  useState,
  useEffect,
  forwardRef,
  ReactNode,
  useRef,
  useCallback,
  memo,
} from 'react'
import styled from 'styled-components'
import { useSpring } from 'react-spring'
import useMeasure from 'react-use-measure'
import {
  createDialogVariant,
  Dialog,
  DialogContent,
  DialogContentProps,
  useDialogContext,
} from './dialog'
import { TrayProps } from './popout'
import { useSafeViewportHeight } from '../hooks/viewport-size'
import { useMounted } from '../hooks/mounted'
import { useScrolledToBottom } from '../hooks/scrolled-to-bottom'

const TrayBase = forwardRef(
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

export const Tray = memo(createDialogVariant(TrayBase))

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

interface SubtrayProps extends SubtrayContentProps {}

export const Subtray = forwardRef(
  ({ children, ...props }: SubtrayProps, ref: any) => {
    const dialogCtxt = useDialogContext()
    const [innerIsOpen, setInnerIsOpen] = useState(dialogCtxt.isOpen)

    useEffect(() => {
      if (dialogCtxt.isOpen) setInnerIsOpen(true)
    }, [dialogCtxt.isOpen])

    if (!innerIsOpen) return null
    return (
      <SubtrayContent
        ref={ref}
        onRest={() => !dialogCtxt.isOpen && setInnerIsOpen(false)}
        {...props}
      >
        {children}
      </SubtrayContent>
    )
  },
)

interface SubtrayContentProps extends DialogContentProps {
  onRest?: () => void
  children: ReactNode
}

const SubtrayContent = forwardRef(
  ({ onRest, children, ...props }: SubtrayContentProps, ref: any) => {
    const dialogCtxt = useDialogContext()
    const hasMounted = useMounted()
    const springStyle = useSpring({
      x: hasMounted && dialogCtxt.isOpen ? '0vw' : '100vw',
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
        <button onClick={dialogCtxt.onClose}>close</button>
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
