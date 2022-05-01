import { ForwardedRef, forwardRef, ReactNode, useEffect } from 'react'
import { Popout, PopoutBaseProps } from './popout'
import {
  ChangeHandler,
  getListBoxKeyboardEventHandler,
  ListBoxBase,
  ListBoxBaseProps,
  useListBoxState,
} from './listbox'
import { Tray, TrayBaseProps } from './tray'
import { useIsMobile } from '../hooks/is-mobile'
import { useSyncedRef } from '../hooks/synced-ref'
import { usePrevious } from '../hooks/previous'
import { DialogVariantProps, useDialogContext } from './dialog'

interface MenuBaseProps
  extends Omit<ListBoxBaseProps, 'state' | 'onScrolledToBottom'> {
  value?: ReactNode
  onChange?: ChangeHandler
  activeOptionId?: string
  onLoadMore?: () => void
  focusResetTrigger?: any
  children: ReactNode
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
    }: MenuBaseProps,
    ref: ForwardedRef<any>,
  ) => {
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
        ref={ref}
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
        // close()
      }
    }, [isOpen, wasOpen])

    useEffect(() => {
      if (!isOpen && dialogCtxt.isOpen) {
        open()
        // dialogCtxt.onOpen?.()
      }
    }, [isOpen, dialogCtxt.isOpen])

    if (isMobile) return listbox
    return (
      <>
        <span
          aria-hidden
          tabIndex={0}
          ref={focusTrapRef}
          onKeyDown={handleKeyDown}
        />
        {listbox}
      </>
    )
  },
)

export interface MenuProps extends MenuBaseProps, DialogVariantProps {
  options?: PopoutBaseProps
  mobileOptions?: TrayBaseProps
}

export const Menu = forwardRef(
  ({ options, mobileOptions, children, ...props }: MenuProps, ref) => {
    const isMobile = useIsMobile()

    if (isMobile)
      return (
        <Tray {...props} options={mobileOptions}>
          <MenuBase ref={ref} {...props}>
            {children}
          </MenuBase>
        </Tray>
      )

    return (
      <Popout {...props} options={options}>
        <MenuBase ref={ref} {...props}>
          {children}
        </MenuBase>
      </Popout>
    )
  },
)
