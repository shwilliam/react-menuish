import { ForwardedRef, forwardRef, ReactNode, useEffect } from 'react'
import _ from 'lodash'
import { Popout, PopoutBaseProps } from './popout'
import {
  ChangeHandler,
  getListBoxKeyboardEventHandler,
  ListBoxBase,
  ListBoxBaseProps,
  ListBoxState,
  useListBoxContext,
  useListBoxState,
  useListLevelContext,
} from './listbox'
import { Subtray, Tray, TrayBaseProps } from './tray'
import { DialogVariantProps, useDialogContext } from './dialog'
import { useIsMobile } from '../hooks/is-mobile'
import { useSyncedRef } from '../hooks/synced-ref'
import { usePrevious } from '../hooks/previous'
import { useId } from '../hooks/id'

interface MenuBaseProps
  extends Omit<ListBoxBaseProps, 'state' | 'onScrolledToBottom'> {
  state: ListBoxState
  value?: ReactNode
  onChange?: ChangeHandler
  activeOptionId?: string
  onLoadMore?: () => void
  focusResetTrigger?: any
  children: ReactNode
}

const MenuBase = forwardRef(
  (
    { value, onLoadMore, state, ...props }: MenuBaseProps,
    ref: ForwardedRef<any>,
  ) => {
    const isMobile = useIsMobile()
    const { focus, focusTrapRef, open, close } = state
    const isOpen = !!focus.length // FIXME:
    const { level } = useListLevelContext()
    const thisLevel = level + 1
    const dialogCtxt = useDialogContext()
    const handleKeyDown = getListBoxKeyboardEventHandler({
      state,
      isFixed: false,
    })
    const wasOpen = usePrevious(isOpen)
    const listbox = (
      <ListBoxBase
        ref={ref}
        state={state}
        onScrolledToBottom={onLoadMore}
        role="menu"
        level={thisLevel}
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
        {thisLevel === 0 ? (
          <span
            aria-hidden
            tabIndex={0}
            ref={focusTrapRef}
            onKeyDown={handleKeyDown}
          />
        ) : null}
        {listbox}
      </>
    )
  },
)

export interface MenuProps
  extends Omit<MenuBaseProps, 'state'>,
    DialogVariantProps {
  options?: PopoutBaseProps
  mobileOptions?: TrayBaseProps
  trigger?: (triggerContext: any) => ReactNode // TODO: type
  listIdx?: number
}

export const Menu = forwardRef(
  (
    {
      id,
      listIdx = -1,
      options,
      mobileOptions,
      onChange,
      activeOptionId,
      focusResetTrigger,
      trigger,
      children,
      ...props
    }: MenuProps,
    ref,
  ) => {
    const innerId = useId(id)
    const isMobile = useIsMobile()
    const { level } = useListLevelContext()
    const thisLevel = level + 1
    const parentState = useListBoxContext()
    const createdState = useListBoxState({
      onChange,
      activeOptionId,
      focusResetTrigger,
    })
    const state = thisLevel > 0 ? parentState : createdState.state
    const { focus, setFocus, closeLevel, focusTrapRef } = state
    const isSubmenuOpen = focus[level] === innerId
    const openSubList = () => {
      setFocus((s) => {
        const clone = _.clone(s)
        clone[level] = innerId
        clone[thisLevel] = 0
        return clone
      })
      return false
    }
    const menu = (
      <MenuBase ref={ref} state={state} {...props}>
        {children}
      </MenuBase>
    )

    useEffect(() => {
      if (_.last(focus) === innerId)
        setFocus((s) => {
          const clone = _.clone(s)
          clone[clone.length - 1] = listIdx
          return clone
        })
    }, [focus, setFocus, listIdx, innerId])

    if (isMobile) {
      if (thisLevel > 0)
        return (
          <Subtray
            isOpen={isSubmenuOpen}
            onClose={() => closeLevel(thisLevel)}
            trigger={
              trigger
                ? ({ ref }) =>
                    trigger({
                      ref,
                      measureRef: null,
                      id,
                      listIdx,
                      onClick: openSubList,
                    })
                : undefined
            }
            options={mobileOptions}
            {...props}
          >
            {menu}
          </Subtray>
        )
      return (
        <Tray options={mobileOptions} trigger={trigger} {...props}>
          {menu}
        </Tray>
      )
    }

    return (
      <Popout
        {...(thisLevel > 0
          ? {
              isOpen: isSubmenuOpen,
              onClose: () => closeLevel(thisLevel),
              placement: 'right',
              noFocusLock: true,
              initialFocusRef: focusTrapRef,
              trigger: trigger
                ? ({ ref }) =>
                    trigger({
                      ref,
                      id: innerId,
                      listIdx,
                      onClick: () => {
                        openSubList()
                        return false
                      },
                      triggeredOnHover: true,
                    })
                : undefined,
            }
          : { trigger })}
        {...props}
        options={options}
      >
        {menu}
      </Popout>
    )
  },
)
