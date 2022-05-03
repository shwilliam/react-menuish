import {
  useState,
  useEffect,
  forwardRef,
  ReactNode,
  ForwardedRef,
  ComponentProps,
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
      },
    })

    useEffect(() => {
      if (dialogCtxt.isOpen) setInnerIsOpen(true)
    }, [dialogCtxt.isOpen])

    return (
      <Dialog
        isOpen={innerIsOpen}
        overlay={{ style: { opacity: springStyle.opacity } }}
      >
        <StyledDialogContent
          ref={ref}
          {...props}
          style={{ height: springStyle.height, ...(props.style || {}) }}
        >
          <div
            ref={innerRef}
            style={{
              maxHeight: `${viewportHeight}px`,
              overflowY: 'auto',
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
      from: { translateX: '100vw' },
      enter: { translateX: '0vw' },
      leave: { translateX: '100vw' },
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
              ...transition,
              ...(props.style || {}),
            }}
          >
            <div style={{ overflow: 'hidden', height: '100%' }}>
              <div style={{ overflowY: 'auto', height: '100%' }}>
                {children}
              </div>
            </div>
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
`

interface TrayHeaderProps extends ComponentProps<'div'> {}

export const TrayHeader = forwardRef(
  ({ children, ...props }: TrayHeaderProps, ref: ForwardedRef<any>) => {
    const dialogCtxt = useDialogContext()
    return (
      <div ref={ref} {...props}>
        <button onClick={dialogCtxt.onClose}>close</button>
        {children}
      </div>
    )
  },
)
