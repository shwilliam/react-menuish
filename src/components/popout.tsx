import { useId } from '@react-aria/utils'
import {
  useState,
  useContext,
  useMemo,
  useCallback,
  useRef,
  forwardRef,
  createContext,
  ReactNode,
  ReactElement,
} from 'react'
import useOnClickOutside from 'use-onclickoutside'
import { usePopout } from '../hooks/popout'
import { mergeRefs } from '../util/merge-refs'
import { Dialog, DialogContent, DialogContentProps } from './dialog'
import { useFocusTakeoverContext } from './focus-takeover'

interface PopoutTriggerContext {
  anchorRef: any
  open: () => void
}

interface PopoutProps {
  trigger: (triggerContext: PopoutTriggerContext) => ReactNode
  children: ReactElement
}

export const Popout = ({ trigger, children, ...props }: PopoutProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { popout, anchor, arrow } = usePopout({
    placement: 'bottom',
  })
  const open = useCallback(() => setIsOpen(true), [setIsOpen])
  const close = useCallback(() => setIsOpen(false), [setIsOpen])
  const ctxt = useMemo(
    () => ({
      isOpen,
      open,
      close,
      popout,
    }),
    [isOpen, open, close, popout],
  )

  return (
    <popoutContext.Provider value={ctxt}>
      {trigger({ open, anchorRef: anchor.set, ...props })}
      {children}
    </popoutContext.Provider>
  )
}

interface PopoutContentProps extends DialogContentProps {
  id?: string
  children: ReactNode
}

export const PopoutContent = forwardRef(
  ({ id, children, ...props }: PopoutContentProps, ref: any) => {
    const innerId = useId(id)
    const innerRef = useRef<any>()
    const { isActiveFocusBoundary } = useFocusTakeoverContext()
    const { isOpen, close, popout } = usePopoutContext()

    useOnClickOutside(innerRef, () => {
      if (isActiveFocusBoundary(innerId)) close()
    })

    return (
      <Dialog id={innerId} isOpen={isOpen}>
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
  open: () => void
  close: () => void
  popout: any // FIXME: type
}

const popoutContext = createContext<PopoutContext>({
  isOpen: false,
  open: () => {},
  close: () => {},
  popout: {},
})

const usePopoutContext = () => useContext<PopoutContext>(popoutContext)
