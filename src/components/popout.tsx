import { useId } from '@react-aria/utils'
import {
  useContext,
  useMemo,
  useState,
  useRef,
  forwardRef,
  createContext,
  ReactNode,
  ReactElement,
  cloneElement,
} from 'react'
import { Dialog, DialogContent, DialogContentProps } from './dialog'
import { usePopout } from '../hooks/popout'
import { mergeRefs } from '../util/merge-refs'

interface PopoutTriggerContext {
  anchorRef: any
}

interface PopoutContainerProps {
  children: ReactElement
}

export const PopoutContainer = ({ children }: PopoutContainerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  return cloneElement(children, {
    isOpen,
    onClose: () => setIsOpen(false),
    trigger: (ctxt) =>
      children.props.trigger({ ...ctxt, open: () => setIsOpen(true) }),
  })
}

interface PopoutProps {
  isOpen?: boolean
  onClose?: () => void
  trigger: (triggerContext: PopoutTriggerContext) => ReactNode
  children: ReactElement
}

export const Popout = ({
  isOpen = false,
  onClose,
  trigger,
  children,
  ...props
}: PopoutProps) => {
  const { popout, anchor, arrow } = usePopout({
    placement: 'bottom',
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
      <Dialog isOpen={isOpen} onClose={onClose}>
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
