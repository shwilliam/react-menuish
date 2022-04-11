import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  KeyboardEventHandler,
} from 'react'
import { Popout } from './popout'
import {
  ChangeHandler,
  getListBoxKeyboardEventHandler,
  ListBoxBase,
  useListBoxState,
  useListLevelContext,
} from './listbox'
import { useIsMobile } from '../../hooks/is-mobile'
import { Tray } from './tray'

interface MenuProps {
  value?: ReactNode
  onChange?: ChangeHandler
  activeOptionId?: string
  onLoadMore?: () => void
  children: ReactNode[]
}

export const Menu = forwardRef(
  (
    { value, onChange, activeOptionId, onLoadMore, ...props }: MenuProps,
    ref: ForwardedRef<any>,
  ) => {
    const { state } = useListBoxState({ onChange, activeOptionId })
    const {
      focus,
      setFocus,
      triggerAction,
      focusNext,
      focusPrev,
      focusTrapRef,
      closeLevel,
      open,
    } = state
    const { level } = useListLevelContext()
    const thisLevel = level + 1
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
            onClose={() => setFocus([])}
            content={{ onScrolledToBottom: onLoadMore }}
          >
            {listbox}
          </Tray>
        </>
      )

    return (
      <Popout
        isOpen={isOpen}
        onClose={() => setFocus([])}
        trigger={({ anchorRef }) => (
          <button ref={anchorRef} onClick={open} onKeyDown={handleKeyDown}>
            {value || 'open'}
          </button>
        )}
      >
        {thisLevel > 0 ? null : (
          <span
            aria-hidden
            tabIndex={0}
            ref={focusTrapRef}
            onKeyDown={handleKeyDown}
          />
        )}
        {listbox}
      </Popout>
    )
  },
)
