import {
  useState,
  useEffect,
  forwardRef,
  ReactNode,
  useCallback,
  ForwardedRef,
} from 'react'
import styled from 'styled-components'
import { useSpring, config, useTransition } from 'react-spring'
import useMeasure from 'react-use-measure'
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  useDialogContext,
} from './dialog'
import { useSafeViewportHeight } from '../hooks/viewport-size'
import { useMounted } from '../hooks/mounted'

interface TrayProps extends TrayVariantProps {
  header?: ReactNode
  isSubtray?: boolean
}

export const Tray = forwardRef(
  (
    { isSubtray, header, children, ...props }: TrayProps,
    ref: ForwardedRef<any>,
  ) => {
    const WrapperEl = isSubtray ? Subtray : RootTray

    return (
      <WrapperEl ref={ref} {...props}>
        {header ? (
          <div style={{ position: 'sticky', top: 0 }}>{header}</div>
        ) : null}
        {children}
      </WrapperEl>
    )
  },
)

interface TrayVariantProps extends DialogContentProps {
  isFullscreen?: boolean
}

const RootTray = forwardRef(
  (
    { isFullscreen = false, children, ...props }: TrayVariantProps,
    ref: ForwardedRef<any>,
  ) => {
    const dialogCtxt = useDialogContext()
    const [innerIsOpen, setInnerIsOpen] = useState(dialogCtxt.isOpen)
    const hasMounted = useMounted()
    const viewportHeight = useSafeViewportHeight()
    const [innerRef, { height: contentHeight }] = useMeasure()
    const [trayHeight, setTrayHeight] = useState(0)
    const measureTray = useCallback(() => {
      if (isFullscreen) return
      setTrayHeight(contentHeight)
    }, [isFullscreen, contentHeight])
    const springStyle = useSpring({
      opacity: hasMounted && dialogCtxt.isOpen ? 1 : 0,
      height:
        hasMounted && dialogCtxt.isOpen
          ? isFullscreen
            ? viewportHeight
            : Math.min(contentHeight, viewportHeight)
          : 0,
      onRest: () => {
        if (!dialogCtxt.isOpen) setInnerIsOpen(false)
        measureTray()
      },
    })

    useEffect(() => {
      if (dialogCtxt.isOpen) setInnerIsOpen(true)
    }, [dialogCtxt.isOpen])

    useEffect(() => {
      if (!dialogCtxt.isOpen) return
      window.addEventListener('resize', measureTray)
      return () => window.removeEventListener('resize', measureTray)
    }, [dialogCtxt.isOpen, measureTray])

    return (
      <Dialog
        isOpen={innerIsOpen}
        overlay={{ style: { opacity: springStyle.opacity } }}
      >
        <StyledDialogContent
          ref={ref}
          style={{ height: springStyle.height }}
          {...props}
        >
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
      </Dialog>
    )
  },
)

export const Subtray = forwardRef(
  ({ children, ...props }: TrayVariantProps, ref: ForwardedRef<any>) => {
    const dialogCtxt = useDialogContext()
    const transitions = useTransition(dialogCtxt.isOpen, {
      from: { translateX: '100vw', opacity: 1 },
      enter: { translateX: '0vw', opacity: 1 },
      leave: { translateX: '100vw', opacity: 0 },
      config: {
        ...config.gentle,
        bounce: 0,
      },
    })

    return transitions(
      (transition, isOpen) =>
        isOpen && (
          <StyledDialogContent
            ref={ref}
            {...props}
            style={{
              top: 0,
              height: '100%',
              width: '100%',
              zIndex: 2,
              overflowY: 'auto',
              ...transition,
              ...(props.style || {}),
            }}
          >
            <button onClick={dialogCtxt.onClose}>close</button>
            {children}
          </StyledDialogContent>
        ),
    )
  },
)

const StyledDialogContent = styled(DialogContent)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  border: 1px solid blue;
`
