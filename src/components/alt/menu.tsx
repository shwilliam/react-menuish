import { ForwardedRef, forwardRef, ReactNode } from 'react'
import { Popout } from './popout'
import {
  ChangeHandler,
  getListBoxKeyboardEventHandler,
  ListBoxBase,
  useListBoxState,
} from './listbox'
import { useIsMobile } from '../../hooks/is-mobile'
import { Tray } from './tray'

interface MenuProps {
  value?: ReactNode
  onChange?: ChangeHandler
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
    const isMobile = useIsMobile()
    const listbox = <ListBoxBase state={state} {...props} />

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
        trigger={({ anchorRef }) => (
          <button ref={anchorRef} onClick={open} onKeyDown={handleKeyDown}>
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
