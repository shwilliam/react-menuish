import {
  useState,
  useEffect,
  forwardRef,
  ReactNode,
  useCallback,
  ForwardedRef,
} from 'react'
import styled from 'styled-components'
import { Transition, useSpring, config } from 'react-spring'
import useMeasure from 'react-use-measure'
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  useDialogContext,
} from './dialog'
import { useSafeViewportHeight } from '../hooks/viewport-size'
import { useMounted } from '../hooks/mounted'

interface TrayProps extends TrayContentProps {
  header?: ReactNode
  isSubtray?: boolean
}

export const Tray = forwardRef(
  (
    { isSubtray, header, children, ...props }: TrayProps,
    ref: ForwardedRef<any>,
  ) => {
    const dialogCtxt = useDialogContext()
    const [innerIsOpen, setInnerIsOpen] = useState(dialogCtxt.isOpen)
    const trayChildren = (
      <>
        {header ? (
          <div style={{ position: 'sticky', top: 0 }}>{header}</div>
        ) : null}
        {children}
      </>
    )

    useEffect(() => {
      if (dialogCtxt.isOpen) setInnerIsOpen(true)
    }, [dialogCtxt.isOpen])

    if (isSubtray) return <Subtray {...props}>{trayChildren}</Subtray>
    return (
      <Dialog isOpen={innerIsOpen}>
        <TrayContent
          ref={ref}
          onRest={() => !dialogCtxt.isOpen && setInnerIsOpen(false)}
          {...props}
        >
          {trayChildren}
        </TrayContent>
      </Dialog>
    )
  },
)

export interface TrayContentProps extends DialogContentProps {
  isFullscreen?: boolean
  onRest?: () => void
}

const TrayContent = forwardRef(
  (
    { isFullscreen = false, onRest, children, ...props }: TrayContentProps,
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
          {children}
        </div>
      </StyledDialogContent>
    )
  },
)

interface SubtrayProps extends DialogContentProps {}

export const Subtray = forwardRef(
  ({ children, ...props }: SubtrayProps, ref: ForwardedRef<any>) => {
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
            <StyledDialogContent
              ref={ref}
              {...props}
              style={{
                top: 0,
                height: '100%',
                width: '100%',
                background: 'white',
                zIndex: 2,
                overflowY: 'auto',
                ...style,
                ...(props.style || {}),
              }}
            >
              <button onClick={dialogCtxt.onClose}>close</button>
              {children}
            </StyledDialogContent>
          )
        }
      </Transition>
    )
  },
)

const StyledDialogContent = styled(DialogContent)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding-bottom: 20px;
  border: 1px solid blue;
`
