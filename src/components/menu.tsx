import { ForwardedRef, forwardRef, ReactNode, useEffect } from 'react'
import { Popout } from './popout'
import {
  ChangeHandler,
  getListBoxKeyboardEventHandler,
  ListBoxBase,
  useListBoxState,
} from './listbox'
import { Tray } from './tray'
import { useIsMobile } from '../hooks/is-mobile'
import { useSyncedRef } from '../hooks/synced-ref'
import { usePrevious } from '../hooks/previous'

export interface MenuProps {
  value?: ReactNode
  onChange?: ChangeHandler
  onOpen?: () => void
  onClose?: () => void
  activeOptionId?: string
  onLoadMore?: () => void
  focusResetTrigger?: any
  children: ReactNode[]
}

export const Menu = forwardRef(
  (
    {
      value,
      onChange,
      onOpen,
      onClose,
      activeOptionId,
      onLoadMore,
      focusResetTrigger,
      ...props
    }: MenuProps,
    ref: ForwardedRef<any>,
  ) => {
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
      <ListBoxBase state={state} onScrolledToBottom={onLoadMore} {...props} />
    )

    const onCloseRef = useSyncedRef(onClose)
    useEffect(() => {
      if (wasOpen && !isOpen) onCloseRef.current?.()
    }, [isOpen, wasOpen])

    if (isMobile)
      return (
        <>
          <button onClick={open}>{value || 'open'}</button>
          <Tray
            isOpen={isOpen}
            onClose={close}
            content={{ onScrolledToBottom: onLoadMore }}
          >
            {listbox}
          </Tray>
        </>
      )

    return (
      <Popout
        isOpen={isOpen}
        onClose={close}
        onOpen={onOpen}
        trigger={(props) => (
          <button {...props} onClick={open} onKeyDown={handleKeyDown}>
            {value || 'open'}
          </button>
        )}
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
