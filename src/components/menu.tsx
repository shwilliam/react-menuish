import {
  useState,
  useRef,
  useContext,
  useEffect,
  useLayoutEffect,
  cloneElement,
  createContext,
  Children,
  KeyboardEventHandler,
  Dispatch,
  SetStateAction,
  MutableRefObject,
  MouseEventHandler,
  ReactNode,
  forwardRef,
  isValidElement,
  useCallback,
  ReactElement,
} from 'react'
import _ from 'lodash'
import styled, { css } from 'styled-components'
import { Subtray, Tray } from './tray'
import { mergeRefs } from '../util/merge-refs'
import { useIsMobile } from '../hooks/is-mobile'
import { Popout, PopoutContent } from './popout'

// TODO: aria attrs

interface ListChildState {
  count: number
  stickyChildren: { [index: number]: MutableRefObject<any> }
}

type ShouldClose = boolean
type ActionHandler = () => ShouldClose | void

interface MenuContext {
  focus: number[]
  setFocus: Dispatch<SetStateAction<number[]>>
  closeMenu: () => void
  closeTopLevel: () => void
  actionHandlerRef: MutableRefObject<ActionHandler | null>
  keyboardEventHandler: KeyboardEventHandler
  listChildStateRef: MutableRefObject<ListChildState[]>
  stickyTriggerRef: MutableRefObject<any>
  focusTrapRef: MutableRefObject<any>
  noFocusTrap: boolean
}
const menuContext = createContext<MenuContext>({
  focus: [],
  setFocus: () => {},
  closeMenu: () => {},
  closeTopLevel: () => {},
  actionHandlerRef: { current: null },
  keyboardEventHandler: () => {},
  listChildStateRef: { current: [] },
  stickyTriggerRef: { current: null },
  focusTrapRef: { current: null },
  noFocusTrap: false,
})
export const useMenuContext = () => useContext(menuContext)

interface MenuListContext {
  level: number
}
const menuListContext = createContext<MenuListContext>({
  level: -1,
})
const useMenuListContext = () => useContext(menuListContext)

interface ContextProviderProps {
  noFocusTrap?: boolean
  children: ReactNode
}

export const ContextProvider = ({
  noFocusTrap = false,
  children,
}: ContextProviderProps) => {
  const isMobile = useIsMobile()
  const [focus, setFocus] = useState<number[]>([])
  const actionHandlerRef = useRef<ActionHandler | null>(null)
  const listChildStateRef = useRef<ListChildState[]>([])
  const stickyTriggerRef = useRef<any>()
  const focusTrapRef = useRef<any>()
  const closeMenu = () => setFocus([])
  const closeTopLevel = () =>
    setFocus((s) => {
      const clone = _.clone(s)
      clone.pop()
      return clone
    })

  const getNextFocusableIdx = (start: number, level: number) => {
    const levelChildStateRef = listChildStateRef.current[level]
    const levelMax = levelChildStateRef?.count
    const thisLevelState = listChildStateRef.current[level]

    if (!thisLevelState) return 0

    if (start > levelMax) return levelMax
    if (thisLevelState.stickyChildren?.[start])
      return getNextFocusableIdx(start + 1, level)
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

  const keyboardEventHandler: KeyboardEventHandler = (e) => {
    let handled = false

    if (!focus.length) {
      if (['Escape', 'Tab'].includes(e.key)) return
      setFocus([0])
      handled = true
    } else {
      const levelFocus = _.last(focus)

      switch (e.key) {
        case 'ArrowDown':
          setFocus((s) => {
            const clone = _.clone(s)
            clone[clone.length - 1] = getNextFocusableIdx(
              levelFocus + 1,
              focus.length - 1,
            )
            return clone
          })
          handled = true
          break
        case 'ArrowUp':
          setFocus((s) => {
            const clone = _.clone(s)
            clone[clone.length - 1] = getPrevFocusableIdx(
              levelFocus - 1,
              focus.length - 1,
            )
            return clone
          })
          handled = true
          break
        case 'ArrowLeft':
          closeTopLevel()
          handled = true
          break
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          const shouldClose = actionHandlerRef.current?.()
          if (shouldClose !== false) closeMenu()
          handled = true
          break
        case 'Escape':
          closeMenu()
          break
        default:
          break
      }
    }

    if (handled) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

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

    if (matchingStickyEl) matchingStickyEl.current?.focus()
    else if (isMobile) return
    else if (noFocusTrap) stickyTriggerRef.current.focus?.()
    else focusTrapRef.current?.focus?.()
  }, [focus, noFocusTrap, isMobile])

  return (
    <menuContext.Provider
      value={{
        focus,
        setFocus,
        closeMenu,
        closeTopLevel,
        actionHandlerRef,
        keyboardEventHandler,
        listChildStateRef,
        stickyTriggerRef,
        focusTrapRef,
        noFocusTrap,
        getNextFocusableIdx,
      }}
    >
      {children}
    </menuContext.Provider>
  )
}

interface MenuProps extends MenuInnerProps {
  noFocusTrap?: boolean
}

export const Menu = forwardRef(({ noFocusTrap, ...props }: MenuProps, ref) => {
  return (
    <ContextProvider noFocusTrap={noFocusTrap}>
      <menuListContext.Provider value={{ level: 0 }}>
        <MenuInner ref={ref} {...props} />
      </menuListContext.Provider>
    </ContextProvider>
  )
})

interface SubmenuProps extends MenuInnerProps {}

export const Submenu = forwardRef((props: SubmenuProps, ref) => {
  const { level } = useMenuListContext()
  return (
    <menuListContext.Provider value={{ level: level + 1 }}>
      <MenuInner ref={ref} {...props} />
    </menuListContext.Provider>
  )
})

interface MenuInnerProps {
  trigger: any
  menuIdx?: number
  children: any
}

const MenuInner = forwardRef((props: MenuInnerProps, ref: any) => {
  const isMobile = useIsMobile()

  if (isMobile) return <MenuTray ref={ref} {...props} />
  return <MenuPopout ref={ref} {...props} />
})

interface MenuTrayProps extends MenuInnerProps {}

const MenuTray = forwardRef(
  ({ trigger, menuIdx, children, ...props }: MenuTrayProps, ref) => {
    const { focus, setFocus, closeTopLevel, closeMenu } = useMenuContext()
    const { level } = useMenuListContext()
    const isOpen = !_.isUndefined(focus[level])
    const isSubmenu = level > 0
    const innerRef = useRef<any>()
    const TrayComponent = isSubmenu ? Subtray : Tray

    return (
      <>
        <menuListContext.Provider
          value={{ level: isSubmenu ? level - 1 : level }}
        >
          {trigger({
            close: closeMenu,
            open: () => {
              setFocus((s) => {
                const clone = _.clone(s)
                clone[level] = 0
                return clone
              })
              return false // prevent close if passed to menu item
            },
            menuIdx,
            ...props,
          })}
        </menuListContext.Provider>

        <TrayComponent
          ref={mergeRefs(ref, innerRef)}
          isOpen={isOpen}
          onClose={closeTopLevel}
          {...props}
        >
          {children}
        </TrayComponent>
      </>
    )
  },
)

interface MenuPopoutProps extends MenuInnerProps {}

const MenuPopout = forwardRef(
  ({ trigger, menuIdx, children, ...props }: MenuPopoutProps, ref) => {
    const {
      focus,
      setFocus,
      keyboardEventHandler,
      stickyTriggerRef,
      focusTrapRef,
      noFocusTrap,
      closeMenu,
    } = useMenuContext()
    const { level } = useMenuListContext()
    const isOpen = !_.isUndefined(focus[level])
    const isSubmenu = level > 0
    const innerRef = useRef<any>()

    return (
      <>
        <Popout
          isOpen={isOpen}
          onClose={closeMenu}
          placement={isSubmenu ? 'right-start' : 'bottom-end'}
          trigger={({ anchorRef }) => (
            <menuListContext.Provider
              value={{ level: isSubmenu ? level - 1 : level }}
            >
              {trigger({
                anchorRef,
                stickyTriggerRef,
                handleKeyDown: keyboardEventHandler,
                close: closeMenu,
                open: () => {
                  setFocus((s) => {
                    const clone = _.clone(s)
                    clone[level] = 0
                    return clone
                  })
                  return false // prevent close if passed to menu item
                },
                menuIdx,
              })}
            </menuListContext.Provider>
          )}
        >
          <PopoutContent
            ref={mergeRefs(ref, innerRef)}
            initialFocusRef={focusTrapRef}
            noFocusLock={level > 0}
            {...props}
          >
            {noFocusTrap || level > 0 ? null : (
              <span
                aria-hidden
                tabIndex={0}
                ref={focusTrapRef}
                onKeyDown={keyboardEventHandler}
              />
            )}
            {children}
          </PopoutContent>
        </Popout>
      </>
    )
  },
)

interface GroupProps {
  label: ReactNode
  children: ReactNode[]
}

export const Group = forwardRef(({ label, children }: GroupProps, ref: any) => (
  <div ref={ref}>
    <div>{label}</div>
    {children}
  </div>
))

interface ListProps {
  children: ReactNode[]
}

export const List = forwardRef(({ children }: ListProps, ref: any) => {
  const { focus, setFocus, listChildStateRef, getNextFocusableIdx } =
    useMenuContext()
  const { level } = useMenuListContext()
  const thisLevelFocus = focus[level]
  const validChildren = _.compact(
    Children.map(children, (child) => (isValidElement(child) ? child : null)),
  )

  let renderedChildren: ReactElement[] = []
  let runningChildrenIdx = 0
  Children.forEach(validChildren, (child, idx) => {
    if (child.type === Group) {
      const groupChildren = Children.map(child.props.children, (child) => {
        if (child.isDisabled) return child
        else {
          const el = cloneElement(child, { menuIdx: runningChildrenIdx })
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
    else
      renderedChildren.push(
        cloneElement(child, { menuIdx: runningChildrenIdx++ }),
      )
  })

  useEffect(() => {
    setFocus((s) => {
      const clone = _.clone(s)
      clone[clone.length - 1] = getNextFocusableIdx(0, focus.length - 1)
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
    <menuListContext.Provider value={{ level }}>
      <StyledUl ref={ref}>{renderedChildren}</StyledUl>
    </menuListContext.Provider>
  )
})

const StyledUl = styled.ul`
  box-shadow: rgba(22, 23, 24, 0.35) 0px 10px 38px -10px,
    rgba(22, 23, 24, 0.2) 0px 10px 20px -15px;
  background-color: white;
  border-radius: 3px;
  margin: 0;
  padding: 0;
`

interface ItemProps {
  onClick?: () => void | boolean
  isDisabled?: boolean
  noClose?: boolean
  menuIdx?: number
  children: any
}

export const Item = forwardRef(
  (
    {
      onClick,
      noClose,
      isDisabled,
      menuIdx = -1,
      children,
      ...props
    }: ItemProps,
    ref: any,
  ) => {
    const isMobile = useIsMobile()
    const { closeMenu, focus, setFocus, actionHandlerRef } = useMenuContext()
    const { level } = useMenuListContext()
    const hasVirtualFocus = focus[level] === menuIdx
    const handleClick = useCallback(
      (e) => {
        e.preventDefault()
        e.stopPropagation()

        const handlerDisabledClose = onClick?.()
        const shouldClose = !noClose && handlerDisabledClose !== false
        if (shouldClose) closeMenu()
        return shouldClose
      },
      [onClick, closeMenu, noClose],
    )
    const handleHover: MouseEventHandler = () => {
      if (isMobile) return
      setFocus((s) => {
        const clone = _.clone(s)
        const sliced = clone.slice(0, level + 1)
        sliced[level] = menuIdx
        return sliced
      })
    }

    // register click handler on virtual focus
    useEffect(() => {
      if (hasVirtualFocus) {
        actionHandlerRef.current = handleClick || null
        return () => {
          actionHandlerRef.current = null
        }
      }
    }, [hasVirtualFocus, handleClick, actionHandlerRef, isMobile])

    return (
      <StyledLi
        ref={ref}
        {...(isDisabled
          ? {}
          : {
              // onClick: handleClick,
              onMouseDown: handleClick,
              onMouseEnter: handleHover,
            })}
        hasVirtualFocus={!isMobile && hasVirtualFocus}
        {...props}
      >
        [{menuIdx}]{children}
      </StyledLi>
    )
  },
)

interface StyledLiProps {
  hasVirtualFocus?: boolean
}

const StyledLi = styled.li<StyledLiProps>`
  ${({ hasVirtualFocus }) =>
    hasVirtualFocus
      ? css`
          background-color: blue;
          color: white;
        `
      : ''}
  padding: 3px 10px;
  border-radius: 3px;
  list-style-type: none;
  cursor: pointer;
`

interface FocusableItemProps {
  menuIdx?: number
  children: (props: {
    focusableRef: any
    handleKeyDown: KeyboardEventHandler
  }) => ReactNode
}

export const FocusableItem = forwardRef(
  ({ menuIdx = -1, children }: FocusableItemProps, ref: any) => {
    const focusableRef = useRef<any>(null)
    const { keyboardEventHandler, listChildStateRef } = useMenuContext()
    const { level } = useMenuListContext()

    // register sticky focus item
    useEffect(() => {
      const clone = _.clone(listChildStateRef.current)
      clone[level] = {
        ...clone[level],
        stickyChildren: {
          ...(clone[level]?.stickyChildren || {}),
          [menuIdx]: focusableRef,
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
      <Item ref={ref} onClick={() => false} menuIdx={menuIdx} isDisabled>
        {children({ focusableRef, handleKeyDown: keyboardEventHandler })}
      </Item>
    )
  },
)
