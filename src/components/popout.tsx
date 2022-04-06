import {
  useContext,
  useMemo,
  useRef,
  forwardRef,
  createContext,
  ReactNode,
  ReactElement,
} from 'react'
import { Dialog, DialogContent, DialogContentProps } from './dialog'
import { usePopout, UsePopoutOptions } from '../hooks/popout'
import { mergeRefs } from '../util/merge-refs'

// TODO: mobile-friendly variant as modal or tray

interface PopoutTriggerContext {
  anchorRef: any
}

interface PopoutProps extends UsePopoutOptions {
  isOpen?: boolean
  onClose?: () => void
  trigger: (triggerContext: PopoutTriggerContext) => ReactNode
  children: ReactElement
}

export const Popout = ({
  isOpen = false,
  onClose,
  placement = 'bottom',
  modifiers,
  trigger,
  children,
  ...props
}: PopoutProps) => {
  const { popout, anchor, arrow } = usePopout({
    placement,
    modifiers,
  })
  const ctxt = useMemo(
    () => ({
      isOpen,
      onClose,
      popout,
    }),
    [isOpen, onClose, popout],
  )

  return (
    <popoutContext.Provider value={ctxt}>
      {trigger({ anchorRef: anchor.set, ...props })}
      {children}
    </popoutContext.Provider>
  )
}

interface PopoutContentProps extends DialogContentProps {
  children: ReactNode
}

export const PopoutContent = forwardRef(
  ({ children, ...props }: PopoutContentProps, ref: any) => {
    const innerRef = useRef<any>()
    const { isOpen, onClose, popout } = usePopoutContext()

    return (
      <Dialog isOpen={isOpen} onClose={onClose} isScrollDisabled={false}>
        <DialogContent
          ref={mergeRefs(popout.set, innerRef, ref)}
          style={popout.styles}
          {...popout.attributes}
          {...props}
        >
          {children}
        </DialogContent>
      </Dialog>
    )
  },
)

interface PopoutContext {
  isOpen: boolean
  popout: any // FIXME: type
  onClose?: () => void
}

const popoutContext = createContext<PopoutContext>({
  isOpen: false,
  popout: {},
})

const usePopoutContext = () => useContext<PopoutContext>(popoutContext)
