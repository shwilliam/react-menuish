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
} from 'react'
import _ from 'lodash'
import styled from 'styled-components'
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
  const keyboardEventHandler: KeyboardEventHandler = (e) => {
    let handled = false

    if (!focus.length) {
      if (['Escape', 'Tab'].includes(e.key)) return
      setFocus([0])
      handled = true
    } else {
      const levelFocus = _.last(focus)
      const levelMax = _.last(listChildStateRef.current).count

      switch (e.key) {
        case 'ArrowDown':
          setFocus((s) => {
            const clone = _.clone(s)
            clone[clone.length - 1] = Math.min(levelFocus + 1, levelMax)
            return clone
          })
          handled = true
          break
        case 'ArrowUp':
          setFocus((s) => {
            const clone = _.clone(s)
            clone[clone.length - 1] = Math.max(0, levelFocus - 1)
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
    const matchingLevel = childrenStickyEls.find(
      (stickyEls) => !!_.compact(stickyEls).length,
    )
    const matchingStickyEl = matchingLevel?.reverse()?.find((stickyEl, idx) => {
      const actualIdx = matchingLevel.length - idx - 1
      return focus[level] >= actualIdx && !!stickyEl
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
    const { focus, setFocus, closeTopLevel } = useMenuContext()
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
          trigger={({ anchorRef }) => (
            <menuListContext.Provider
              value={{ level: isSubmenu ? level - 1 : level }}
            >
              {trigger({
                anchorRef,
                stickyTriggerRef,
                handleKeyDown: keyboardEventHandler,
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

interface ListProps {
  children: ReactNode[]
}

export const List = forwardRef(({ children }: ListProps, ref: any) => {
  const { focus, setFocus, listChildStateRef } = useMenuContext()
  const { level } = useMenuListContext()
  const levelMax = Children.count(children)
  const thisLevelFocus = focus[level]
  const validChildren = _.compact(
    Children.map(children, (child) => (isValidElement(child) ? child : null)),
  )

  // sync level child count
  useEffect(() => {
    const listChildCount = _.cloneDeep(listChildStateRef.current)
    listChildCount[level] = {
      ...listChildCount[level],
      count: levelMax,
    }
    listChildStateRef.current = listChildCount

    return () => {
      const listChildCount = _.clone(listChildStateRef.current)
      listChildStateRef.current = listChildCount.slice(0, level)
    }
  }, [levelMax, listChildStateRef, level])

  // correct focus if out of bounds
  useLayoutEffect(() => {
    if (thisLevelFocus > levelMax - 1) {
      setFocus((s) => {
        const clone = _.clone(s)
        clone[level] = levelMax - 1
        return clone
      })
    }
  }, [thisLevelFocus, level, levelMax, setFocus])

  return (
    <menuListContext.Provider value={{ level }}>
      <StyledUl ref={ref}>
        {Children.map(validChildren, (child, idx) =>
          cloneElement(child, { menuIdx: idx }),
        )}
      </StyledUl>
    </menuListContext.Provider>
  )
})

const StyledUl = styled.ul`
  margin: 0;
  padding: 0;
`

interface ItemProps {
  onClick?: () => void | boolean
  noClose?: boolean
  menuIdx?: number
  children: any
}

export const Item = forwardRef(
  (
    { onClick, noClose, menuIdx = -1, children, ...props }: ItemProps,
    ref: any,
  ) => {
    const isMobile = useIsMobile()
    const { closeMenu, focus, setFocus, actionHandlerRef } = useMenuContext()
    const { level } = useMenuListContext()
    const hasVirtualFocus = focus[level] === menuIdx
    const handleClick = useCallback(() => {
      const handlerDisabledClose = onClick?.()
      const shouldClose = !noClose && handlerDisabledClose !== false
      if (shouldClose) closeMenu()
      return shouldClose
    }, [onClick, closeMenu, noClose])
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
        onClick={handleClick}
        onMouseEnter={handleHover}
        style={{ backgroundColor: hasVirtualFocus ? 'pink' : 'white' }}
        {...props}
      >
        [{menuIdx}]{children}
      </StyledLi>
    )
  },
)

const StyledLi = styled.li`
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
      <Item ref={ref} onClick={() => false} menuIdx={menuIdx}>
        {children({ focusableRef, handleKeyDown: keyboardEventHandler })}
      </Item>
    )
  },
)
