import {
  useState,
  useRef,
  ForwardedRef,
  forwardRef,
  ReactNode,
  MutableRefObject,
  ComponentProps,
  KeyboardEventHandler,
  Dispatch,
  SetStateAction,
  Children,
  isValidElement,
  ReactElement,
  cloneElement,
  useEffect,
  useLayoutEffect,
  createContext,
  useContext,
  useCallback,
  MouseEventHandler,
  useMemo,
  ComponentPropsWithoutRef,
} from 'react'
import _ from 'lodash'
import { Subtray } from './tray'
import { Popout, PopoutTriggerContext } from './popout'
import { useId } from '../hooks/id'
import { mergeRefs } from '../util/merge-refs'
import { usePrevious } from '../hooks/previous'
import { useIsMobile } from '../hooks/is-mobile'
import { useOnUnmount } from '../hooks/on-unmount'
import { useScrolledToBottom } from '../hooks/scrolled-to-bottom'
import { DialogTrigger } from './dialog'

type ShouldClose = boolean
type ActionHandler = (value?: string) => ShouldClose | void
type Focus = (number | string)[]
export type ChangeHandler = (value?: any) => ShouldClose | void

interface ListBoxState {
  focus: Focus
  setFocus: Dispatch<SetStateAction<Focus>>
  actionRef: MutableRefObject<Action | null>
  listChildStateRef: MutableRefObject<ListChildState[]>
  getNextFocusableIdx: (start: number, level: number) => number
  getPrevFocusableIdx: (start: number, level: number) => number
  open: () => void
  focusNext: () => void
  focusPrev: () => void
  close: () => void
  onChange?: ChangeHandler
  triggerAction: () => ShouldClose | void
  closeLevel: (level: number) => void
  focusTrapRef: MutableRefObject<any>
  activeOptionId?: string
  isMultiSelectable: boolean
}

interface StickyChild {
  ref: MutableRefObject<any>
  skipVirtualFocus: boolean
}

interface ListChildState {
  count: number
  stickyChildren: { [index: number]: StickyChild }
}

interface UseListBoxStateOptions {
  activeOptionId?: string
  onChange?: ChangeHandler
  isMultiSelectable?: boolean
  focusResetTrigger?: any
}

interface Action {
  handler?: ActionHandler | null
  value: any
}

export const useListBoxState = (options?: UseListBoxStateOptions) => {
  const {
    onChange,
    activeOptionId,
    isMultiSelectable = false,
    focusResetTrigger,
  } = options || {}
  const [focus, setFocus] = useState<Focus>([])
  const focusTrapRef = useRef<any>()
  const actionRef = useRef<Action | null>(null)
  const listChildStateRef = useRef<ListChildState[]>([])
  const open = () => setFocus([-1])
  const getNextFocusableIdx = useCallback((start: number, level: number) => {
    const levelChildState = listChildStateRef.current[level]
    const levelMax = levelChildState?.count

    if (levelChildState === undefined) return 0
    if (start > levelMax) return levelMax
    if (
      levelChildState.stickyChildren?.[start] !== undefined &&
      levelChildState.stickyChildren?.[start].skipVirtualFocus
    )
      return getNextFocusableIdx(start + 1, level)
    return start
  }, [])
  const getPrevFocusableIdx = (start: number, level: number) => {
    const thisLevelState = listChildStateRef.current[level]

    if (thisLevelState === undefined) return 0

    if (start <= 0) {
      if (thisLevelState.stickyChildren?.[0])
        return getNextFocusableIdx(0, level)
      return 0
    }

    if (
      thisLevelState.stickyChildren?.[start] !== undefined &&
      thisLevelState.stickyChildren?.[start].skipVirtualFocus
    )
      return getPrevFocusableIdx(start - 1, level)

    return start
  }
  const focusNext = () => {
    setFocus((s) => {
      const lastLevelFocus = _.last(s)
      const clone = _.clone(s)
      const nextFocusableIdx = getNextFocusableIdx(
        lastLevelFocus + 1,
        focus.length - 1,
      )
      clone[clone.length - 1] = nextFocusableIdx
      return clone
    })
  }
  const focusPrev = () => {
    setFocus((s) => {
      const clone = _.clone(s)
      const lastLevelFocus = _.last(s)
      clone[clone.length - 1] = getPrevFocusableIdx(
        lastLevelFocus - 1,
        focus.length - 1,
      )
      return clone
    })
  }
  const triggerAction = (value?: string) => {
    actionRef.current?.handler?.(
      _.isUndefined(value) ? actionRef.current?.value : value,
    )
  }
  const close = () => setFocus([])
  const resetFocus = useCallback(
    () => setFocus([getNextFocusableIdx(0, 0)]),
    [getNextFocusableIdx],
  )
  const closeLevel = (level: number) =>
    setFocus((s) => {
      const clone = _.clone(s)
      return clone.slice(0, level)
    })

  // focus sticky child
  useEffect(() => {
    const level = focus.length - 1
    if (level < 0) return

    const childrenStickyEls = _.clone(listChildStateRef.current)
      .map((state) =>
        _.entries(state?.stickyChildren)?.reduce((acc, [idx, ref]) => {
          const clone = _.clone(acc)
          clone[idx] = ref
          return clone
        }, Array.from({ length: state?.count || 0 })),
      )
      .reverse()
    const [matchingLevelIdx, matchingLevel] = childrenStickyEls.reduce(
      (acc, stickyEls, idx) => {
        if (acc.some(Boolean)) return acc

        const actualIdx = childrenStickyEls.length - idx - 1
        const passedStickyEls =
          actualIdx === focus.length - 1
            ? stickyEls.slice(0, focus[actualIdx])
            : stickyEls

        if (
          !!_.compact(
            passedStickyEls.filter((stickyEl) => !!stickyEl?.skipVirtualFocus),
          ).length
        )
          return [actualIdx, stickyEls]
        return acc
      },
      [null, null],
    )

    const matchingStickyEl = matchingLevel?.reverse()?.find((stickyEl, idx) => {
      const actualIdx = matchingLevel.length - idx - 1
      return (
        (matchingLevelIdx < level || focus[level] >= actualIdx) && !!stickyEl
      )
    })

    const virtuallyFocusedStickyEl = childrenStickyEls[level]?.[focus[level]]

    if (
      virtuallyFocusedStickyEl &&
      virtuallyFocusedStickyEl.skipVirtualFocus === false
    ) {
      virtuallyFocusedStickyEl.ref.current.focus()
      return
    }

    if (matchingStickyEl) {
      matchingStickyEl.ref.current?.focus()
    }
    // // else if (isMobile) return
    // // else if (noFocusTrap) stickyTriggerRef.current.focus?.()
    else {
      focusTrapRef.current?.focus?.()
    }
  }, [
    focus,
    //  noFocusTrap,
    //   isMobile,
  ])

  const state: ListBoxState = {
    focus,
    setFocus,
    actionRef,
    listChildStateRef,
    getNextFocusableIdx,
    getPrevFocusableIdx,
    open,
    focusNext,
    focusPrev,
    close,
    onChange,
    triggerAction,
    closeLevel,
    focusTrapRef,
    activeOptionId,
    isMultiSelectable,
  }

  // reset focus on `focusResetTrigger` change
  useEffect(() => {
    if (!!focus.length) resetFocus()
  }, [resetFocus, focusResetTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  return { state }
}

interface ListLevelContext {
  level: number
}
const listLevelContext = createContext<ListLevelContext>({
  level: -1,
})
export const useListLevelContext = () => useContext(listLevelContext)

interface GetListBoxKeyboardEventHandlerOptions {
  state: ListBoxState
  isFixed: boolean
}

export const getListBoxKeyboardEventHandler = (
  options: GetListBoxKeyboardEventHandlerOptions,
) => {
  const { state, isFixed } = options
  const {
    focus,
    close,
    focusNext,
    focusPrev,
    closeLevel,
    triggerAction,
    open,
  } = state
  const handleKeyDown: KeyboardEventHandler = (e) => {
    let handled = false
    switch (e.key) {
      case 'ArrowDown':
        if (!focus.length) open()
        else focusNext()
        handled = true
        break
      case 'ArrowUp':
        focusPrev()
        handled = true
        break
      case 'ArrowRight':
      case ' ':
      case 'Enter':
        if (['Enter', ' '].includes(e.key) && !focus.length) open()
        else if (focus.length) triggerAction()
        handled = true
        break
      case 'ArrowLeft':
        if (!isFixed) {
          closeLevel(focus.length - 1)
          handled = true
        }
        break
      case 'Escape':
        if (!isFixed) {
          close()
          handled = true
        }
        break
      default:
        break
    }

    if (handled) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return handleKeyDown
}

interface ListBoxProps {
  isFixed?: boolean
  children: ReactNode[]
}

export const ListBox = forwardRef(
  ({ isFixed = true, ...props }: ListBoxProps, ref: ForwardedRef<any>) => {
    const { state } = useListBoxState()
    const handleKeyDown = getListBoxKeyboardEventHandler({ state, isFixed })

    return (
      <ListBoxBase
        tabIndex={0}
        ref={ref}
        state={state}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  },
)

const listBoxContext = createContext<ListBoxState>({
  focus: [],
  setFocus: () => {},
  actionRef: { current: null },
  listChildStateRef: { current: [] },
  getNextFocusableIdx: () => -1,
  getPrevFocusableIdx: () => -1,
  open: () => {},
  focusNext: () => {},
  focusPrev: () => {},
  close: () => {},
  triggerAction: () => {},
  closeLevel: () => {},
  focusTrapRef: { current: null },
  isMultiSelectable: false,
})

const useListBoxContext = () => useContext(listBoxContext)

export interface ListBoxBaseProps extends ComponentPropsWithoutRef<'ul'> {
  state: ListBoxState
  level?: number
  labelId?: string
  onScrolledToBottom?: () => void
  children: ReactNode
}

export const ListBoxBase = forwardRef(
  (
    {
      state,
      level = 0,
      labelId,
      onScrolledToBottom,
      children,
      ...props
    }: ListBoxBaseProps,
    ref: ForwardedRef<any>,
  ) => {
    const {
      focus,
      setFocus,
      listChildStateRef,
      getNextFocusableIdx,
      activeOptionId,
      isMultiSelectable,
    } = state
    const thisLevelFocus = focus[level]

    const validChildren = _.compact(
      Children.map(children, (child) => (isValidElement(child) ? child : null)),
    )

    let renderedChildren: ReactElement[] = []
    let runningChildrenIdx = 0
    let nextRootActiveOptionFocusIdx: number | undefined
    Children.forEach(validChildren, (child) => {
      if (child.type === Group) {
        const groupChildren = Children.map(child.props.children, (child) => {
          if (child.props.isDisabled) return child
          else {
            const el = cloneElement(child, {
              listIdx: runningChildrenIdx,
            })
            runningChildrenIdx += 1
            return el
          }
        })
        renderedChildren.push(
          cloneElement(child, {
            children: groupChildren,
          }),
        )
      } else if (child.props.isDisabled) renderedChildren.push(child)
      else {
        if (activeOptionId && child.props.id === activeOptionId) {
          nextRootActiveOptionFocusIdx = runningChildrenIdx
        }
        renderedChildren.push(
          cloneElement(child, { listIdx: runningChildrenIdx++ }),
        )
      }
    })

    useEffect(() => {
      const activeOptionIdx =
        level === 0 && nextRootActiveOptionFocusIdx !== undefined
          ? nextRootActiveOptionFocusIdx
          : null
      setFocus((s) => {
        const clone = _.clone(s)
        clone[clone.length - 1] =
          activeOptionIdx === null
            ? getNextFocusableIdx(0, focus.length - 1)
            : activeOptionIdx
        return clone
      })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // sync level child count
    useEffect(() => {
      const listChildState = _.cloneDeep(listChildStateRef.current)
      listChildState[level] = {
        ...listChildState[level],
        count: runningChildrenIdx,
      }
      listChildStateRef.current = listChildState

      return () => {
        const levelChildState = _.clone(listChildStateRef.current)
        levelChildState[level] = null
        listChildStateRef.current = levelChildState.slice(0, level)
      }
    }, [runningChildrenIdx, listChildStateRef, level])

    // correct focus if out of bounds
    useLayoutEffect(() => {
      if (thisLevelFocus > runningChildrenIdx - 1) {
        setFocus((s) => {
          const clone = _.clone(s)
          clone[level] = runningChildrenIdx - 1
          return clone
        })
      }
    }, [thisLevelFocus, level, runningChildrenIdx, setFocus])

    const bottomRef = useRef<any>()
    useScrolledToBottom(bottomRef, onScrolledToBottom)

    return (
      <listBoxContext.Provider value={state}>
        <listLevelContext.Provider value={{ level }}>
          <ul
            style={{
              border: '1px solid blue',
              padding: 0,
              margin: 0,
            }}
            ref={ref}
            role="listbox"
            {...(isMultiSelectable ? { 'aria-multiselectable': 'true' } : {})}
            {...(labelId ? { 'aria-labelledby': labelId } : {})}
            {...props}
          >
            {renderedChildren}
          </ul>
          <div
            ref={bottomRef}
            style={{ transform: 'translateY(-20px)' }} // scrolled to bottom trigger offset
            aria-hidden
          />
        </listLevelContext.Provider>
      </listBoxContext.Provider>
    )
  },
)

interface ItemProps extends Omit<ComponentProps<'li'>, 'onClick'> {
  listIdx?: number
  onClick?: ActionHandler
  triggeredOnHover?: boolean
  isDisabled?: boolean
  value?: any
  activeOptionId?: string
  onVirtualFocusStart?: () => void
  onVirtualFocusEnd?: () => void
  children: ReactNode
}

export const Item = forwardRef(
  (
    {
      id,
      listIdx,
      onClick,
      triggeredOnHover = false,
      isDisabled = false,
      value,
      onVirtualFocusStart,
      onVirtualFocusEnd,
      children,
      ...props
    }: ItemProps,
    ref: ForwardedRef<any>,
  ) => {
    const innerRef = useRef<any>()
    const stableRef = useMemo(() => mergeRefs(ref, innerRef), [ref, innerRef])
    const innerId = useId(id)
    const isMobile = useIsMobile()
    const { focus, setFocus, actionRef, onChange, close, activeOptionId } =
      useListBoxContext()
    const isOpen = !!focus.length
    const wasOpen = usePrevious(isOpen)
    const isSelected = activeOptionId === innerId
    const { level } = useListLevelContext()
    const hasVirtualFocus =
      !_.isUndefined(listIdx) && [listIdx, innerId].includes(focus[level])
    const textValue = !_.isUndefined(value)
      ? value
      : _.isString(children)
      ? children
      : null
    const handleAction = useCallback(() => {
      if (isDisabled) return

      let shouldClose: boolean | undefined
      if (onClick) shouldClose = onClick?.(textValue) ?? true
      else shouldClose = onChange?.(textValue) ?? true

      if (shouldClose !== false) close()
    }, [isDisabled, onClick, onChange, textValue, close])
    const handleHover: MouseEventHandler = () => {
      if (isMobile) return
      if (isDisabled) return
      setFocus((s) => {
        const clone = _.clone(s)
        const sliced = clone.slice(0, level + 1)
        sliced[level] = listIdx
        return sliced
      })
      if (triggeredOnHover) handleAction()
    }

    // register click handler on virtual focus
    useEffect(() => {
      if (hasVirtualFocus && !isMobile) {
        actionRef.current = {
          handler: handleAction || null,
          value: textValue,
        }
        return () => {
          actionRef.current = null
        }
      }
    }, [
      hasVirtualFocus,
      onClick,
      handleAction,
      actionRef,
      children,
      textValue,
      isMobile,
    ])
    const handleMouseDown: MouseEventHandler = (e) => {
      handleAction()
      e.preventDefault()
      e.stopPropagation()
    }
    const scrollIntoView = useCallback(() => {
      if (!wasOpen) return
      innerRef.current.scrollIntoView?.({
        block: 'nearest',
      })
    }, [wasOpen])

    const hadVirtualFocus = usePrevious(hasVirtualFocus)
    useEffect(() => {
      if (!hadVirtualFocus && hasVirtualFocus) {
        onVirtualFocusStart?.()
        scrollIntoView()
      }
      if (hadVirtualFocus && (!hasVirtualFocus || !focus.length))
        onVirtualFocusEnd?.()
    }, [
      focus,
      hadVirtualFocus,
      hasVirtualFocus,
      onVirtualFocusStart,
      onVirtualFocusEnd,
      scrollIntoView,
    ])
    useOnUnmount(() => {
      if (hadVirtualFocus) onVirtualFocusEnd?.()
    }, [hadVirtualFocus, onVirtualFocusEnd])

    return (
      <li
        ref={stableRef}
        role="option"
        aria-selected={isSelected ? 'true' : 'false'}
        aria-disabled={isDisabled ? 'true' : 'false'}
        onMouseOver={handleHover}
        onMouseDown={handleMouseDown}
        style={{
          listStyleType: 'none',
          background: hasVirtualFocus
            ? 'lightblue'
            : isDisabled
            ? 'gray'
            : 'white',
          cursor: isDisabled ? 'not-allowed' : 'default',
        }}
        {...props}
      >
        {children}
      </li>
    )
  },
)

interface FocusableItemProps extends ItemProps {
  isVirtuallyFocusable?: boolean
  children: (props: {
    focusableRef: any
    handleKeyDown: KeyboardEventHandler
  }) => ReactNode
}

export const FocusableItem = forwardRef(
  (
    {
      listIdx = -1,
      isVirtuallyFocusable = true,
      onClick,
      isDisabled,
      children,
      ...props
    }: FocusableItemProps,
    ref: any,
  ) => {
    const focusableRef = useRef<any>(null)
    const state = useListBoxContext()
    const { listChildStateRef } = state
    const { level } = useListLevelContext()
    const handleKeyDown = getListBoxKeyboardEventHandler({
      state,
      isFixed: false,
    })

    // register sticky focus item
    useEffect(() => {
      const clone = _.clone(listChildStateRef.current)
      clone[level] = {
        ...clone[level],
        stickyChildren: {
          ...(clone[level]?.stickyChildren || {}),
          [listIdx]: {
            ref: focusableRef,
            skipVirtualFocus: !isVirtuallyFocusable,
          },
        },
      }
      listChildStateRef.current = clone

      return () => {
        const clone = _.clone(listChildStateRef.current)
        const stickyChildrenClone = _.clone(clone[level]?.stickyChildren)

        if (!stickyChildrenClone) return

        delete stickyChildrenClone[level]

        clone[level] = {
          ...clone[level],
          stickyChildren: stickyChildrenClone,
        }
        listChildStateRef.current = clone
      }
    })

    return (
      <Item
        ref={ref}
        onClick={onClick || (() => false)}
        listIdx={listIdx}
        isDisabled={!isVirtuallyFocusable || isDisabled}
        {...props}
      >
        {children({
          // ref,
          focusableRef,
          handleKeyDown,
        })}
      </Item>
    )
  },
)

interface GroupProps {
  label: ReactNode
  children: ReactNode
}

export const Group = forwardRef(
  ({ label, children }: GroupProps, ref: ForwardedRef<any>) => {
    const groupLabelId = useId()
    return (
      <div ref={ref} role="presentation">
        <div id={groupLabelId} role="presentation" aria-hidden="true">
          {label}
        </div>
        <div role="group" aria-labelledby={groupLabelId}>
          {children}
        </div>
      </div>
    )
  },
)

interface SubListProps {
  id?: string
  trigger: (
    triggerContext: PopoutTriggerContext & {
      id?: string
      listIdx: number
      onClick?: ActionHandler
    },
  ) => ReactNode
  listIdx?: number
  onAction?: () => void
  children: ReactNode[]
}

export const SubList = forwardRef(
  (
    { id, listIdx = -1, trigger, children, ...props }: SubListProps,
    ref: ForwardedRef<any>,
  ) => {
    const innerId = useId(id)
    const isMobile = useIsMobile()
    const state = useListBoxContext()
    const { focus, setFocus, closeLevel, focusTrapRef } = state
    const { level } = useListLevelContext()
    const thisLevel = level + 1
    const isOpen = focus[level] === innerId
    const openSubList = () => {
      setFocus((s) => {
        const clone = _.clone(s)
        clone[level] = innerId
        clone[thisLevel] = 0
        return clone
      })
      return false
    }

    useEffect(() => {
      if (_.last(focus) === innerId)
        setFocus((s) => {
          const clone = _.clone(s)
          clone[clone.length - 1] = listIdx
          return clone
        })
    }, [focus, setFocus, listIdx, innerId])

    if (isMobile)
      return (
        <DialogTrigger
          isOpen={isOpen}
          onClose={() => closeLevel(thisLevel)}
          placement="right"
          trigger={({ ref }) =>
            trigger({
              ref,
              measureRef: null,
              id,
              listIdx,
              onClick: openSubList,
            })
          }
        >
          <Subtray {...props}>
            <ListBoxBase level={thisLevel} ref={ref} state={state}>
              {children}
            </ListBoxBase>
          </Subtray>
        </DialogTrigger>
      )

    return (
      <DialogTrigger
        isOpen={isOpen}
        onClose={() => closeLevel(thisLevel)}
        placement="right"
        trigger={({ ref }) =>
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
        }
      >
        <Popout
          content={{
            initialFocusRef: focusTrapRef,
            noFocusLock: thisLevel > 0,
          }}
          dialog={{ isFocusTakeoverDisabled: true }}
          {...props}
        >
          <ListBoxBase level={thisLevel} ref={ref} state={state}>
            {children}
          </ListBoxBase>
        </Popout>
      </DialogTrigger>
    )
  },
)
