import { ForwardedRef, forwardRef, ReactNode, useEffect, memo } from 'react'
import { Popout } from './popout'
import {
  ChangeHandler,
  getListBoxKeyboardEventHandler,
  ListBoxBase,
  ListBoxBaseProps,
  useListBoxState,
} from './listbox'
import { Tray } from './tray'
import { useIsMobile } from '../hooks/is-mobile'
import { useSyncedRef } from '../hooks/synced-ref'
import { usePrevious } from '../hooks/previous'
import { createDialogVariant, useDialogContext } from './dialog'

export interface MenuProps
  extends Omit<ListBoxBaseProps, 'state' | 'onScrolledToBottom'> {
  value?: ReactNode
  onChange?: ChangeHandler
  activeOptionId?: string
  onLoadMore?: () => void
  focusResetTrigger?: any
  children: ReactNode[]
}

const MenuBase = forwardRef(
  (
    {
      value,
      onChange,
      activeOptionId,
      onLoadMore,
      focusResetTrigger,
      ...props
    }: MenuProps,
    ref: ForwardedRef<any>,
  ) => {
    console.log(props)
    const dialogCtxt = useDialogContext()
    const { state } = useListBoxState({
      onChange,
      activeOptionId,
      focusResetTrigger,
    })
    const { focus, focusTrapRef, open, close } = state
    const handleKeyDown = getListBoxKeyboardEventHandler({
      state,
      isFixed: false,
    })
    const isOpen = !!focus.length
    const wasOpen = usePrevious(isOpen)
    const isMobile = useIsMobile()
    const listbox = (
      <ListBoxBase
        state={state}
        onScrolledToBottom={onLoadMore}
        role="menu"
        {...props}
      />
    )

    const onCloseRef = useSyncedRef(dialogCtxt.onClose)
    useEffect(() => {
      if (wasOpen && !isOpen) {
        onCloseRef.current?.()
        dialogCtxt.onClose?.()
      }
    }, [isOpen, wasOpen, dialogCtxt.onClose])

    useEffect(() => {
      if (!isOpen && dialogCtxt.isOpen) {
        open()
        // dialogCtxt.onOpen?.()
      }
    }, [isOpen, dialogCtxt.isOpen])

    if (isMobile)
      return <Tray content={{ onScrolledToBottom: onLoadMore }}>{listbox}</Tray>

    return (
      <Popout
      // trigger={(props) => (
      //   <button {...props} onClick={open} onKeyDown={handleKeyDown}>
      //     {value || 'open'}
      //   </button>
      // )}
      >
        <span
          aria-hidden
          tabIndex={0}
          ref={focusTrapRef}
          onKeyDown={handleKeyDown}
        />
        {listbox}
      </Popout>
    )
  },
)

export const Menu = memo(createDialogVariant(MenuBase))
