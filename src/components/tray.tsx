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
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  useDialogContext,
} from './dialog'
import { useSafeViewportHeight } from '../hooks/viewport-size'
import { useMounted } from '../hooks/mounted'
import { useScrolledToBottom } from '../hooks/scrolled-to-bottom'

export interface TrayBaseProps extends TrayContentProps {
  isSubtray?: boolean
}

export const TrayBase = forwardRef(
  ({ isSubtray, children, ...props }: TrayBaseProps, ref: any) => {
    const dialogCtxt = useDialogContext()
    const [innerIsOpen, setInnerIsOpen] = useState(dialogCtxt.isOpen)

    useEffect(() => {
      if (dialogCtxt.isOpen) setInnerIsOpen(true)
    }, [dialogCtxt.isOpen])

    if (isSubtray) {
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
    }
    return (
      <Dialog isOpen={innerIsOpen}>
        <TrayContent
          ref={ref}
          onRest={() => !dialogCtxt.isOpen && setInnerIsOpen(false)}
          {...props}
        >
          {children}
        </TrayContent>
      </Dialog>
    )
  },
)

interface TrayContentBaseProps extends DialogContentProps {
  onRest?: () => void
}

export interface TrayContentProps extends TrayContentBaseProps {
  header?: ReactNode
  isFullscreen?: boolean
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

interface SubtrayContentProps extends TrayContentBaseProps {}

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
