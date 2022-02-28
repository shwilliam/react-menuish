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
  ReactElement,
  forwardRef,
} from 'react'
import _ from 'lodash'
import useOnClickOutside from 'use-onclickoutside'
import { useId } from '@react-aria/utils'
import { usePopper } from 'react-popper'
import { Dialog, DialogContent } from './dialog'
import { mergeRefs } from '../util/merge-refs'
import { useFocusTakeoverContext } from './focus-takeover'

// TODO: aria attrs

interface ListChildState {
  count: number
  stickyChildren: { [index: number]: MutableRefObject<any> }
}

interface MenuContext {
  focus: number[]
  setFocus: Dispatch<SetStateAction<number[]>>
  closeMenu: () => void
  actionHandlerRef: MutableRefObject<(() => void) | null>
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
  const [focus, setFocus] = useState<number[]>([])
  const actionHandlerRef = useRef<(() => void) | null>(null)
  const listChildStateRef = useRef<ListChildState[]>([])
  const stickyTriggerRef = useRef<any>()
  const focusTrapRef = useRef<any>()
  const closeMenu = () => setFocus([])
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
          setFocus((s) => {
            const clone = _.clone(s)
            clone.pop()
            return clone
          })
          handled = true
          break
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          actionHandlerRef.current?.()
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
    else if (noFocusTrap) stickyTriggerRef.current.focus?.()
    else focusTrapRef.current?.focus?.()
  }, [focus, noFocusTrap])

  return (
    <menuContext.Provider
      value={{
        focus,
        setFocus,
        closeMenu,
        actionHandlerRef,
        keyboardEventHandler,
        listChildStateRef,
        stickyTriggerRef,
        focusTrapRef,
        noFocusTrap,
      }}
    >
      <menuListContext.Provider value={{ level: -1 }}>
        {children}
      </menuListContext.Provider>
    </menuContext.Provider>
  )
}

interface MenuProps extends MenuInnerProps {
  noFocusTrap?: boolean
}

export const Menu = forwardRef(({ noFocusTrap, ...props }: MenuProps, ref) => {
  return (
    <ContextProvider noFocusTrap={noFocusTrap}>
      <MenuInner ref={ref} {...props} />
    </ContextProvider>
  )
})

interface SubmenuProps extends MenuInnerProps {}

export const Submenu = forwardRef((props: SubmenuProps, ref) => {
  return <MenuInner ref={ref} {...props} />
})

interface MenuInnerProps {
  id?: string
  level: number
  trigger: any
  children: any
}

const MenuInner = forwardRef(
  ({ id, level, trigger, children, ...props }: MenuInnerProps, ref) => {
    const innerId = useId(id)
    const {
      focus,
      setFocus,
      keyboardEventHandler,
      stickyTriggerRef,
      focusTrapRef,
      noFocusTrap,
      closeMenu,
    } = useMenuContext()
    const { isActiveFocusBoundary } = useFocusTakeoverContext()
    const isOpen = !_.isUndefined(focus[level])
    const isSubmenu = level > 0
    const [referenceElement, setReferenceElement] = useState<any>()
    const innerRef = useRef<any>()
    const [popperElement, setPopperElement] = useState<any>()
    const [arrowElement, setArrowElement] = useState<any>()
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
      placement: isSubmenu ? 'right-start' : 'bottom',
      modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
    })

    useOnClickOutside(
      innerRef,
      isActiveFocusBoundary(innerId) ? closeMenu : () => {},
    )

    return (
      <>
        {trigger({
          anchorRef: setReferenceElement,
          stickyTriggerRef,
          handleKeyDown: keyboardEventHandler,
          open: () =>
            setFocus((s) => {
              const clone = _.clone(s)
              clone[level] = 0
              return clone
            }),
          ...props,
        })}
        <Dialog id={innerId} isOpen={isOpen}>
          <DialogContent initialFocusRef={focusTrapRef} noFocusLock={level > 0}>
            <div
              ref={mergeRefs(ref, innerRef, setPopperElement)}
              style={styles.popper}
              {...attributes.poppper}
            >
              <span ref={setArrowElement} style={styles.arrow} />
              {noFocusTrap || level > 0 ? null : (
                <span
                  aria-hidden
                  tabIndex={0}
                  ref={focusTrapRef}
                  onKeyDown={keyboardEventHandler}
                />
              )}
              {children}
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  },
)

interface ListProps {
  children: ReactElement[]
}

export const List = forwardRef(({ children }: ListProps, ref: any) => {
  const { focus, setFocus, listChildStateRef } = useMenuContext()
  const { level } = useMenuListContext()
  const levelMax = Children.count(children)
  const thisLevel = level + 1
  const thisLevelFocus = focus[thisLevel]

  // sync level child count
  useEffect(() => {
    const listChildCount = _.cloneDeep(listChildStateRef.current)
    listChildCount[thisLevel] = {
      ...listChildCount[thisLevel],
      count: levelMax,
    }
    listChildStateRef.current = listChildCount

    return () => {
      const listChildCount = _.clone(listChildStateRef.current)
      listChildStateRef.current = listChildCount.slice(0, thisLevel)
    }
  }, [levelMax, listChildStateRef, thisLevel])

  // correct focus if out of bounds
  useLayoutEffect(() => {
    if (thisLevelFocus > levelMax - 1) {
      setFocus((s) => {
        const clone = _.clone(s)
        clone[thisLevel] = levelMax - 1
        return clone
      })
    }
  }, [thisLevelFocus, thisLevel, levelMax, setFocus])

  return (
    <menuListContext.Provider value={{ level: thisLevel }}>
      <ul ref={ref}>
        {Children.map(children, (child, idx) =>
          cloneElement(child, { menuIdx: idx }),
        )}
      </ul>
    </menuListContext.Provider>
  )
})

interface ItemProps {
  onClick?: () => void
  menuIdx?: number
  children: any
}

export const Item = forwardRef(
  ({ onClick, menuIdx = -1, children }: ItemProps, ref: any) => {
    const { focus, setFocus, actionHandlerRef } = useMenuContext()
    const { level } = useMenuListContext()
    const hasVirtualFocus = focus[level] === menuIdx
    const handleHover: MouseEventHandler = () => {
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
        actionHandlerRef.current = onClick || null
        return () => {
          actionHandlerRef.current = null
        }
      }
    }, [hasVirtualFocus, onClick, actionHandlerRef])

    return (
      <li
        ref={ref}
        onClick={onClick}
        onMouseEnter={handleHover}
        style={{ backgroundColor: hasVirtualFocus ? 'pink' : 'white' }}
      >
        [{menuIdx}]{children}
      </li>
    )
  },
)

interface FocusableItemProps {
  onClick?: () => void
  menuIdx?: number
  children: (props: {
    focusableRef: any
    handleKeyDown: KeyboardEventHandler
  }) => ReactNode
}

export const FocusableItem = forwardRef(
  (
    { onClick = () => {}, menuIdx = -1, children }: FocusableItemProps,
    ref: any,
  ) => {
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
      <Item ref={ref} onClick={onClick} menuIdx={menuIdx}>
        {children({ focusableRef, handleKeyDown: keyboardEventHandler })}
      </Item>
    )
  },
)
