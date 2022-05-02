import { ForwardedRef, forwardRef, ReactNode, useEffect } from 'react'
import _ from 'lodash'
import {
  ChangeHandler,
  getListBoxKeyboardEventHandler,
  ListBoxBase,
  ListBoxBaseProps,
  useListBoxContext,
  useListBoxState,
  useListLevelContext,
} from './listbox'
import { useIsMobile } from '../hooks/is-mobile'
import { useSyncedRef } from '../hooks/synced-ref'
import { usePrevious } from '../hooks/previous'
import { useDialogContext } from './dialog'
import { GetDialogVariantProps, PopoutVariant } from './dialog-variant'
import { useId } from '../hooks/id'

interface MenuProps extends MenuBaseProps {
  dialog?: Omit<MenuDialogProps, 'trigger'>['dialog']
  popout?: Omit<Omit<MenuDialogProps, 'trigger'>, 'dialog'>
  trigger: MenuDialogProps['trigger']
}

export const Menu = forwardRef(
  (
    { id, listIdx = -1, trigger, dialog, popout, ...props }: MenuProps,
    ref: ForwardedRef<any>,
  ) => {
    const innerId = useId(id)
    const { level } = useListLevelContext()
    const thisLevel = level + 1
    const isSubmenu = thisLevel > 0
    const parentState = useListBoxContext()
    const isMobile = useIsMobile()
    const isSubmenuOpen = parentState.focus[level] === innerId
    const openSubList = () => {
      parentState.setFocus((s) => {
        const clone = _.clone(s)
        clone[level] = innerId
        clone[thisLevel] = 0
        return clone
      })
      return false
    }

    useEffect(() => {
      if (_.last(parentState.focus) === innerId)
        parentState.setFocus((s) => {
          const clone = _.clone(s)
          clone[clone.length - 1] = listIdx
          return clone
        })
    }, [parentState.focus, parentState.setFocus, listIdx, innerId])

    return (
      <PopoutVariant
        mobileType="tray"
        mobileOptions={{ isSubtray: isSubmenu }}
        trigger={
          isSubmenu
            ? trigger
              ? ({ ref }) =>
                  trigger({
                    ref,
                    id: innerId,
                    listIdx,
                    onClick: () => {
                      openSubList()
                      return false
                    },
                    triggeredOnHover: !isMobile,
                  })
              : undefined
            : trigger
        }
        dialog={
          isSubmenu
            ? {
                isOpen: isSubmenuOpen,
                onClose: () => parentState.closeLevel(thisLevel),
                placement: 'right-start',
                initialFocusRef: isMobile
                  ? undefined
                  : parentState.focusTrapRef,
                noFocusLock: thisLevel > 0 || isMobile,
                isFocusTakeoverDisabled: true,
                ...(dialog || {}),
              }
            : dialog
        }
        {...popout}
      >
        <MenuBase id={innerId} ref={ref} {...props} />
      </PopoutVariant>
    )
  },
)

interface MenuDialogProps extends GetDialogVariantProps<'popout', 'tray'> {}

interface MenuBaseProps
  extends Omit<ListBoxBaseProps, 'state' | 'onScrolledToBottom'> {
  value?: ReactNode
  onChange?: ChangeHandler
  activeOptionId?: string
  focusResetTrigger?: any
  children: ReactNode[]
}

const MenuBase = forwardRef(
  (
    {
      id,
      value,
      onChange,
      activeOptionId,
      focusResetTrigger,
      ...props
    }: MenuBaseProps,
    ref: ForwardedRef<any>,
  ) => {
    const isMobile = useIsMobile()
    const parentListBoxState = useListBoxContext()
    const dialogCtxt = useDialogContext()
    const { state } = useListBoxState({
      onChange,
      activeOptionId,
      focusResetTrigger,
    })
    const { level } = useListLevelContext()
    const thisLevel = level + 1
    const isSubmenu = thisLevel > 0
    const thisState = isSubmenu ? parentListBoxState : state
    const { focus, focusTrapRef, open } = thisState
    const handleKeyDown = getListBoxKeyboardEventHandler({
      state: thisState,
      isFixed: false,
    })
    const isOpen = isSubmenu
      ? parentListBoxState.focus[level] === id
      : !!focus.length
    const wasOpen = usePrevious(isOpen)

    console.log(state.focus)

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

    return (
      <>
        {isMobile || isSubmenu ? null : (
          <span
            aria-hidden
            tabIndex={0}
            ref={focusTrapRef}
            onKeyDown={handleKeyDown}
          />
        )}
        <ListBoxBase
          state={thisState}
          level={thisLevel}
          role="menu"
          {...props}
        />
      </>
    )
  },
)
