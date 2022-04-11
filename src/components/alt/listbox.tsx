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
  RefCallback,
} from 'react'
import _ from 'lodash'
import { Popout, PopoutTriggerContext } from './popout'
import { useIsMobile } from '../../hooks/is-mobile'
import { Subtray } from './tray'
import { useScrolledToBottom } from '../../hooks/scrolled-to-bottom'
import { mergeRefs } from '../../util/merge-refs'

type ShouldClose = boolean
type ActionHandler = (value?: string) => ShouldClose | void
type Focus = number[]
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
  resetFocus: () => void
  onChange?: ChangeHandler
  triggerAction: () => ShouldClose | void
  closeLevel: (level: number) => void
  focusTrapRef: MutableRefObject<any>
  activeOptionId?: string
}
interface ListChildState {
  count: number
  stickyChildren: { [index: number]: MutableRefObject<any> }
}

interface UseListBoxStateOptions {
  activeOptionId?: string
  onChange?: ChangeHandler
}

interface Action {
  handler?: ActionHandler | null
  value: any
}

export const useListBoxState = (options?: UseListBoxStateOptions) => {
  const { onChange, activeOptionId } = options || {}
  const [focus, setFocus] = useState<Focus>([])
  const focusTrapRef = useRef<any>()
  const actionRef = useRef<Action | null>(null)
  const listChildStateRef = useRef<ListChildState[]>([])
  const open = () => {
    setFocus([-1])
  }
  const getNextFocusableIdx = (start: number, level: number) => {
    const levelChildStateRef = listChildStateRef.current[level]
    const levelMax = levelChildStateRef?.count
    const thisLevelState = listChildStateRef.current[level]

    if (!thisLevelState) {
      console.log('return 0')
      return 0
    }

    if (start > levelMax) {
      console.log('return levelMax')
      return levelMax
    }
    if (thisLevelState.stickyChildren?.[start]) {
      console.log('get again')
      return getNextFocusableIdx(start + 1, level)
    }
    console.log('return start')
    return start
  }
  const getPrevFocusableIdx = (start: number, level: number) => {
    const thisLevelState = listChildStateRef.current[level]

    if (!thisLevelState) return 0

    if (start <= 0) {
      if (thisLevelState.stickyChildren?.[0])
        return getNextFocusableIdx(0, level)
      return 0
    }

    if (thisLevelState.stickyChildren?.[start])
      return getPrevFocusableIdx(start - 1, level)

    return start
  }
  const focusNext = () => {
    setFocus((s) => {
      const lastLevelFocus = _.last(s)
      const clone = _.clone(s)
      clone[clone.length - 1] = getNextFocusableIdx(
        lastLevelFocus + 1,
        focus.length - 1,
      )
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
    console.log('list action')
    actionRef.current?.handler?.(
      _.isUndefined(value) ? actionRef.current?.value : value,
    )
  }
  const resetFocus = () => setFocus([])
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
        _.entries(state.stickyChildren)?.reduce((acc, [idx, ref]) => {
          const clone = _.clone(acc)
          clone[idx] = ref
          return clone
        }, Array.from({ length: state.count })),
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

        if (!!_.compact(passedStickyEls).length) return [actualIdx, stickyEls]
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

    if (matchingStickyEl) {
      console.log('focus matching sticky')
      matchingStickyEl.current?.focus()
    }
    // else if (isMobile) return
    // else if (noFocusTrap) stickyTriggerRef.current.focus?.()
    else focusTrapRef.current?.focus?.()
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
    resetFocus,
    onChange,
    triggerAction,
    closeLevel,
    focusTrapRef,
    activeOptionId,
  }

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
    setFocus,
    resetFocus,
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
          resetFocus()
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
  resetFocus: () => {},
  triggerAction: () => {},
  closeLevel: () => {},
  focusTrapRef: { current: null },
})

const useListBoxContext = () => useContext(listBoxContext)

interface ListBoxBaseProps extends ComponentProps<'div'> {
  state: ListBoxState
  level?: number
  children: ReactNode
}

export const ListBoxBase = forwardRef(
  (
    { state, level = 0, children, ...props }: ListBoxBaseProps,
    ref: ForwardedRef<any>,
  ) => {
    const {
      focus,
      setFocus,
      listChildStateRef,
      getNextFocusableIdx,
      activeOptionId,
    } = state
    const thisLevelFocus = focus[level]

    const validChildren = _.compact(
      Children.map(children, (child) => (isValidElement(child) ? child : null)),
    )

    let renderedChildren: ReactElement[] = []
    let runningChildrenIdx = 0
    let nextRootActiveOptionFocusIdx: number | undefined
    Children.forEach(validChildren, (child, idx) => {
      if (child.type === ListBoxGroup) {
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
      console.log('nextRoot: ', nextRootActiveOptionFocusIdx)
      console.log('actualSet: ', activeOptionIdx)
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
      const listChildCount = _.cloneDeep(listChildStateRef.current)
      listChildCount[level] = {
        ...listChildCount[level],
        count: runningChildrenIdx,
      }
      listChildStateRef.current = listChildCount

      return () => {
        const listChildCount = _.clone(listChildStateRef.current)
        listChildStateRef.current = listChildCount.slice(0, level)
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

    return (
      <listBoxContext.Provider value={state}>
        <listLevelContext.Provider value={{ level }}>
          <div ref={ref} {...props}>
            {renderedChildren}
          </div>
        </listLevelContext.Provider>
      </listBoxContext.Provider>
    )
  },
)

interface ListBoxItemProps {
  listIdx?: number
  onClick?: ActionHandler
  isDisabled?: boolean
  value?: any
  activeOptionId?: string
  children: ReactNode
}

export const ListBoxItem = forwardRef(
  (
    {
      listIdx = -1,
      onClick,
      isDisabled,
      value,
      activeOptionId,
      children,
      ...props
    }: ListBoxItemProps,
    ref: ForwardedRef<any>,
  ) => {
    const isMobile = useIsMobile()
    const { focus, setFocus, actionRef, onChange, resetFocus } =
      useListBoxContext()
    const { level } = useListLevelContext()
    const hasVirtualFocus = focus[level] === listIdx
    const textValue = !_.isUndefined(value)
      ? value
      : _.isString(children)
      ? children
      : null
    const handleAction = useCallback(() => {
      console.log('handle')
      if (isDisabled) return

      let shouldClose: boolean | undefined
      if (onClick) shouldClose = onClick?.(textValue) ?? true
      else shouldClose = onChange?.(textValue) ?? true

      if (shouldClose !== false) resetFocus()
    }, [isDisabled, onClick, onChange, textValue, resetFocus])
    const handleHover: MouseEventHandler = () => {
      if (isMobile) return
      if (isDisabled) return
      setFocus((s) => {
        const clone = _.clone(s)
        const sliced = clone.slice(0, level + 1)
        sliced[level] = listIdx
        return sliced
      })
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

    return (
      <div
        ref={ref}
        onMouseOver={handleHover}
        onMouseDown={handleMouseDown}
        {...props}
      >
        {hasVirtualFocus ? '-' : ''}({listIdx}){children}
      </div>
    )
  },
)

interface ListBoxItemFocusableProps {
  listIdx?: number
  children: (props: {
    focusableRef: any
    handleKeyDown: KeyboardEventHandler
  }) => ReactNode
}

export const ListBoxItemFocusable = forwardRef(
  ({ listIdx = -1, children }: ListBoxItemFocusableProps, ref: any) => {
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
          [listIdx]: focusableRef,
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
      <ListBoxItem ref={ref} onClick={() => false} listIdx={listIdx} isDisabled>
        {children({
          focusableRef,
          handleKeyDown,
        })}
      </ListBoxItem>
    )
  },
)

interface ListBoxGroupProps {
  label: ReactNode
  children: ReactNode[]
}

export const ListBoxGroup = forwardRef(
  ({ label, children }: ListBoxGroupProps, ref: ForwardedRef<any>) => (
    <div ref={ref}>
      <div>{label}</div>
      {children}
    </div>
  ),
)

// TODO: move to menu
interface SubListProps {
  trigger: (
    triggerContext: PopoutTriggerContext & {
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
    { listIdx = -1, trigger, children, ...props }: SubListProps,
    ref: ForwardedRef<any>,
  ) => {
    const isMobile = useIsMobile()
    const state = useListBoxContext()
    const { focus, setFocus, closeLevel, focusTrapRef } = state
    const { level } = useListLevelContext()
    const thisLevel = level + 1
    const isOpen = !_.isUndefined(focus[thisLevel])
    const openSubList = () => {
      console.log('open sub list')
      setFocus((s) => [...s, 0])
      return false
    }

    if (isMobile)
      return (
        <>
          {trigger({
            anchorRef: null,
            listIdx,
            onClick: openSubList,
          })}
          <Subtray
            isOpen={isOpen}
            onClose={() => closeLevel(thisLevel)}
            {...props}
          >
            <ListBoxBase level={thisLevel} ref={ref} state={state}>
              {children}
            </ListBoxBase>
          </Subtray>
        </>
      )

    return (
      <Popout
        isOpen={isOpen}
        onClose={() => closeLevel(thisLevel)}
        trigger={(props) =>
          trigger({
            ...props,
            listIdx,
            onClick: openSubList,
          })
        }
        content={{
          initialFocusRef: focusTrapRef,
          noFocusLock: thisLevel > 0,
        }}
        {...props}
      >
        <ListBoxBase level={thisLevel} ref={ref} state={state}>
          {children}
        </ListBoxBase>
      </Popout>
    )
  },
)
