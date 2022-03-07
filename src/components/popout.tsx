import { useId } from '@react-aria/utils'
import {
  useContext,
  useMemo,
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
}

interface PopoutProps {
  isOpen?: boolean
  trigger: (triggerContext: PopoutTriggerContext) => ReactNode
  children: ReactElement
}

export const Popout = ({
  isOpen = false,
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
      popout,
    }),
    [isOpen, popout],
  )

  return (
    <popoutContext.Provider value={ctxt}>
      {trigger({ anchorRef: anchor.set, ...props })}
      {children}
    </popoutContext.Provider>
  )
}

interface PopoutContentProps extends DialogContentProps {
  id?: string
  onClose?: () => void
  children: ReactNode
}

export const PopoutContent = forwardRef(
  ({ id, onClose, children, ...props }: PopoutContentProps, ref: any) => {
    const innerId = useId(id)
    const innerRef = useRef<any>()
    const { isActiveFocusBoundary } = useFocusTakeoverContext()
    const { isOpen, popout } = usePopoutContext()

    useOnClickOutside(innerRef, () => {
      if (isActiveFocusBoundary(innerId)) onClose?.()
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
  popout: any // FIXME: type
}

const popoutContext = createContext<PopoutContext>({
  isOpen: false,
  popout: {},
})

const usePopoutContext = () => useContext<PopoutContext>(popoutContext)
