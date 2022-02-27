import {
  useState,
  useRef,
  useContext,
  useEffect,
  cloneElement,
  createContext,
  Children,
  KeyboardEventHandler,
  Dispatch,
  SetStateAction,
  MutableRefObject,
  MouseEventHandler,
} from 'react'
import _ from 'lodash'
import { Dialog, DialogContent } from './dialog'

// TODO: aria attrs

interface ListChildState {
  count: number
  stickyChildren: { [index: number]: MutableRefObject<any> }
}

interface MenuContext {
  focus: number[]
  setFocus: Dispatch<SetStateAction<number[]>>
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
  actionHandlerRef: { current: null },
  keyboardEventHandler: () => {},
  listChildStateRef: { current: [] },
  stickyTriggerRef: { current: null },
  focusTrapRef: { current: null },
  noFocusTrap: false,
})
const useMenuContext = () => useContext(menuContext)

interface MenuListContext {
  level: number
}
const menuListContext = createContext<MenuListContext>({
  level: -1,
})
const useMenuListContext = () => useContext(menuListContext)

export const ContextProvider = ({ noFocusTrap = false, children }) => {
  const [focus, setFocus] = useState<number[]>([])
  const actionHandlerRef = useRef<(() => void) | null>(null)
  const listChildStateRef = useRef<ListChildState[]>([])
  const stickyTriggerRef = useRef<any>()
  const focusTrapRef = useRef<any>()
  const keyboardEventHandler: KeyboardEventHandler = (e) => {
    if (!focus.length) {
      setFocus([0])
      return
    }

    const levelFocus = _.last(focus)
    const levelMax = _.last(listChildStateRef.current).count

    switch (e.key) {
      case 'ArrowDown':
        setFocus((s) => {
          const clone = _.clone(s)
          clone[clone.length - 1] = Math.min(levelFocus + 1, levelMax)
          return clone
        })
        break
      case 'ArrowUp':
        setFocus((s) => {
          const clone = _.clone(s)
          clone[clone.length - 1] = Math.max(0, levelFocus - 1)
          return clone
        })
        break
      case 'ArrowLeft':
        setFocus((s) => {
          const clone = _.clone(s)
          clone.pop()
          return clone
        })
        break
      case 'ArrowRight':
      case ' ':
      case 'Enter':
        actionHandlerRef.current?.()
        break
      default:
        break
    }
  }

  // focus sticky child
  useEffect(() => {
    const level = focus.length - 1
    if (level < 0) return

    const stuff = _.clone(listChildStateRef.current)
      .reverse()
      .map((state) =>
        _.entries(state.stickyChildren)?.reduce((acc, [idx, ref]) => {
          const clone = _.clone(acc)
          clone[idx] = ref
          return clone
        }, Array.from({ length: state.count })),
      )
    const matchingLevel = stuff.find((stickyEls, idx) => !!stickyEls.length)
    const matchingStickyEl = matchingLevel?.reverse().find((stickyEl, idx) => {
      const actualIdx = matchingLevel.length - idx - 1
      return focus[level] >= actualIdx && !!stickyEl
    })
    if (matchingStickyEl) matchingStickyEl.current?.focus()
    else if (noFocusTrap) stickyTriggerRef.current.focus?.()
    else document.getElementById('trap')?.focus()
  }, [focus, noFocusTrap])

  return (
    <menuContext.Provider
      value={{
        focus,
        setFocus,
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

export const Menu = ({ level, trigger, children, ...props }) => {
  const {
    focus,
    setFocus,
    keyboardEventHandler,
    stickyTriggerRef,
    focusTrapRef,
    noFocusTrap,
  } = useMenuContext()
  const isOpen = !_.isUndefined(focus[level])

  return (
    <>
      {trigger({
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
      <Dialog isOpen={isOpen}>
        <DialogContent initialFocusRef={focusTrapRef} noFocusLock={level > 0}>
          {noFocusTrap ? null : (
            <span
              id="trap"
              tabIndex={0}
              ref={focusTrapRef}
              onKeyDown={keyboardEventHandler}
            />
          )}
          {children}
        </DialogContent>
      </Dialog>
    </>
  )
}

export const List = ({ children }) => {
  const { listChildStateRef } = useMenuContext()
  const { level } = useMenuListContext()
  const levelMax = children.length
  const thisLevel = level + 1

  // sync level child count
  useEffect(() => {
    const listChildCount = _.clone(listChildStateRef.current)
    listChildCount[thisLevel] = {
      ...listChildCount[thisLevel],
      count: levelMax - 1,
    }
    listChildStateRef.current = listChildCount

    return () => {
      const listChildCount = _.clone(listChildStateRef.current)
      listChildStateRef.current = listChildCount.slice(0, thisLevel)
    }
  }, [levelMax, listChildStateRef, thisLevel])

  return (
    <menuListContext.Provider value={{ level: thisLevel }}>
      <ul>
        {Children.map(children, (child, idx) =>
          cloneElement(child, { menuIdx: idx }),
        )}
      </ul>
    </menuListContext.Provider>
  )
}

export const Item = ({ onClick = () => {}, menuIdx = -1, children }) => {
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
      actionHandlerRef.current = onClick
      return () => {
        actionHandlerRef.current = null
      }
    }
  }, [hasVirtualFocus, onClick, actionHandlerRef])

  return (
    <li
      onClick={onClick}
      onMouseEnter={handleHover}
      style={{ backgroundColor: hasVirtualFocus ? 'pink' : 'white' }}
    >
      [{menuIdx}]{children}
    </li>
  )
}

export const FocusableItem = ({
  onClick = () => {},
  menuIdx = -1,
  children,
}) => {
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
  }, [listChildStateRef, level, focusableRef, menuIdx])

  return (
    <Item onClick={onClick} menuIdx={menuIdx}>
      {children({ focusableRef, handleKeyDown: keyboardEventHandler })}
    </Item>
  )
}
