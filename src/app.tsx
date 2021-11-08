import React, {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  MutableRefObject,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'
import useOnClickOutside from 'use-onclickoutside'

const closedFocusState = { focus: [], availableFocus: [], selectCb: () => {} }
const defaultOpenFocusState = {
  focus: [0],
  availableFocus: [0],
  selectCb: () => {},
}

// TODO:
// properly apply aria attributes
// trigger click handlers on hover
// many *many* more

interface FocusState {
  focus: number[]
  availableFocus: number[]
  selectCb: () => void
}

type DirX = 'left' | 'right'
type DirY = 'top' | 'bottom'
type Placement = [DirX, DirY]

const PLACEMENT: Placement = ['left', 'bottom']

const useMenu = () => {
  const triggerRef = useRef<any>()
  const [focusState, setFocusState] = useState<FocusState>(closedFocusState)
  const [triggerPos, setTriggerPos] = useState<[number | null, number | null]>([
    null,
    null,
  ])
  const isOpen = !!focusState.focus.length

  const openMenu = () => {
    setFocusState(defaultOpenFocusState)
    setTriggerPos(getCornerPos(triggerRef))
  }
  const closeMenu = () => {
    setFocusState(closedFocusState)
  }
  const openNext = () =>
    setFocusState((s) => ({ ...s, focus: [...s.focus, 0] }))
  const closeTopLevel = () =>
    setFocusState((s) => {
      const focusClone = [...s.focus]
      focusClone.slice(0, focusClone.length)
      return { ...s, focus: focusClone }
    })
  const wrapperProps = {
    onKeyDown: (e: any) => {
      let handled = false
      switch (e.key) {
        case 'ArrowDown':
          setFocusState((s) => {
            const focusClone = [...s.focus]
            const focusNow = s.focus[focusClone.length - 1]
            const maxFocus = 3 // FIXME: get from ctxt

            focusClone[focusClone.length - 1] =
              focusNow >= maxFocus ? maxFocus : focusNow + 1
            return { ...s, focus: focusClone }
          })
          handled = true
          break
        case 'ArrowUp':
          setFocusState((s) => {
            const focusClone = [...s.focus]
            const focusNow = s.focus[focusClone.length - 1]
            console.log({ focusNow })
            focusClone[focusClone.length - 1] = focusNow < 1 ? 0 : focusNow - 1
            return { ...s, focus: focusClone }
          })
          handled = true
          break
        default:
          break
      }
      if (handled) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
  }

  // HERE
  // setting up arrow to focus
  console.log(focusState.focus, focusState.availableFocus)

  useEffect(() => {
    // TODO: allow pass `scrollParent` as ref prop
    const handleScroll = () => closeMenu()
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  const [filterValue, setFilterValue] = useState('')

  return {
    menuProps: {
      isOpen,
      closeMenu,
      openMenu,
      openNext,
      closeTopLevel,
      triggerPos,
      wrapperProps,
      onAvailableFocusChange: (level: number, availableFocus: number) => {
        setFocusState((s) => {
          const clone = [...s.availableFocus]
          clone[level] = availableFocus
          return { ...s, availableFocus: clone }
        })
      },
      ...focusState,
    },
    triggerProps: {
      ref: triggerRef,
      onClick: openMenu,
    },
    filterProps: {
      value: filterValue,
      onChange: (e) => setFilterValue(e.target.value),
    },
  }
}

const Box = styled.div`
  padding: 5px;
  border: 1px solid black;
`

interface MenuContext {
  openNext: () => void
  closeTopLevel: () => void
  parentLevel?: number
  focus: FocusState['focus']
  isOpen: boolean
  onAvailableFocusChange: (level: number, availableFocus: number) => void
}
const menuContext = createContext<MenuContext>({
  openNext: () => {},
  closeTopLevel: () => {},
  focus: closedFocusState.focus,
  isOpen: false,
  onAvailableFocusChange: () => {},
})
const useMenuContext = () => useContext(menuContext)

const Container = ({
  wrapperProps,
  isOpen,
  closeMenu,
  openMenu,
  openNext,
  closeTopLevel,
  focus,
  triggerPos,
  selectCb,
  onAvailableFocusChange,
  children,
}) => {
  const innerRef = useRef<any>()
  const [childrenWithMenuProps, childCount] = cloneMenuChildren(children)
  useOnClickOutside(innerRef, closeMenu)

  useEffect(() => {
    onAvailableFocusChange(0, childCount - 1)
  }, [childCount])

  useEffect(() => {
    if (isOpen) innerRef.current.focus()
  }, [isOpen])

  if (!isOpen) return null
  return (
    <menuContext.Provider
      value={{
        openNext,
        closeTopLevel,
        focus,
        isOpen: focus.length,
        onAvailableFocusChange,
      }}
    >
      <Box
        tabIndex={0}
        style={{
          // FIXME: use absolute relative to anchor
          position: 'fixed',
          left: `${triggerPos[0]}px`,
          top: `${triggerPos[1]}px`,
        }}
        ref={innerRef}
        role="listbox"
        aria-labelledby="lol"
        {...wrapperProps}
      >
        {childrenWithMenuProps}
      </Box>
    </menuContext.Provider>
  )
}

const SubContainer = ({ plainChildren = false, children }) => {
  const menuCtxt = useMenuContext()
  const { focus, parentLevel, onAvailableFocusChange } = menuCtxt
  const level = (parentLevel || 1) + 1
  const isOpen = focus.length >= level
  const { triggerPos } = useSubMenuContext()
  const [childrenToRender, childCount] = plainChildren
    ? [children]
    : cloneMenuChildren(children)

  useEffect(() => {
    onAvailableFocusChange(level, childCount - 1)
  }, [childCount])

  if (!isOpen) return null
  return (
    <menuContext.Provider value={{ ...menuCtxt, parentLevel: level }}>
      <Box
        style={{
          // FIXME: use absolute relative to anchor
          position: 'fixed',
          left: `${triggerPos?.[0]}px`,
          top: `${triggerPos?.[1]}px`,
        }}
        role="idk"
        aria-labelledby="lol"
      >
        {childrenToRender}
      </Box>
    </menuContext.Provider>
  )
}

// const SubPopout = (props) => <SubContainer plainChildren {...props} />

interface MenuItemProps {
  onClick?: () => void
  children: ReactNode
  textValue?: string
  childIndex?: number
}

const Item = forwardRef(
  ({ childIndex, textValue, onClick, children }: MenuItemProps, ref: any) => {
    const { focus } = useMenuContext()
    const { level } = useSubMenuContext()
    const isFocused = focus[level ?? 0] === (childIndex ?? 0)
    // const isChildOpen = focus.length > level + 1

    return (
      <Box
        ref={ref}
        onClick={onClick}
        style={{ borderColor: isFocused ? 'red' : 'black' }}
        role="option"
      >
        {children}
      </Box>
    )
  },
)

interface MenuItemTriggerProps extends MenuItemProps {
  label?: ReactNode
  children: ReactNode
}

interface SubMenuContext {
  triggerPos: [number, number] | null
  level: number
}

const subMenuContext = createContext<SubMenuContext>({
  triggerPos: null,
  level: 0,
})
const useSubMenuContext = () => useContext(subMenuContext)

const ItemTrigger = ({ label, children, ...props }: MenuItemTriggerProps) => {
  // TODO: provide position context
  const { openNext } = useMenuContext()
  const maybeWrappingContext = useSubMenuContext()
  const nextLevel =
    maybeWrappingContext?.level !== undefined
      ? maybeWrappingContext.level + 1
      : 0
  const itemRef = useRef<any>()

  return (
    <Item>
      <subMenuContext.Provider
        value={{
          triggerPos: getCornerPos(itemRef),
          level: nextLevel,
        }}
      >
        <Box onClick={openNext} ref={itemRef} {...props}>
          {label}
        </Box>
        {children}
      </subMenuContext.Provider>
    </Item>
  )
}

const StickyFocus = ({ children }) => {
  const { isOpen } = useMenuContext()
  const innerRef = useRef<any>()

  useEffect(() => {
    if (isOpen) {
      alert('focus')
      innerRef.current.focus()
    }
  }, [isOpen])

  return children(innerRef)
}

interface MenuInputProps {}

const Input = (props: MenuInputProps) => {
  return <input {...props} />
}

export const App = () => {
  const { menuProps, triggerProps, filterProps } = useMenu()

  return (
    <>
      <button
        style={{
          margin: '300px',
          padding: '20px',
        }}
        {...triggerProps}
      >
        open
      </button>
      <Container {...menuProps}>
        <StickyFocus>
          {(ref) => <input ref={ref} {...filterProps} />}
        </StickyFocus>
        <Item>1</Item>
        <Item textValue="two">2</Item>
        <ItemTrigger label={<span>3</span>}>
          <SubContainer>
            <Item>3.1</Item>
            <Item>3.2</Item>
            <ItemTrigger label={<span>3.3</span>}>
              <SubContainer>
                <Item>3.3.1</Item>
                <Item>3.3.2</Item>
              </SubContainer>
            </ItemTrigger>
          </SubContainer>
        </ItemTrigger>
        <Item textValue="four">4</Item>
        <Item textValue="five">5</Item>
        {/* <ItemTrigger label={<span>popout</span>}>
          <SubPopout>hello world</SubPopout>
        </ItemTrigger> */}
      </Container>
    </>
  )
}

const getCornerPos = (
  ref: MutableRefObject<HTMLElement>,
  // placement: Placement,
) => {
  const triggerEl = ref.current
  if (!triggerEl) return [0, 0]
  const triggerRect = triggerEl.getBoundingClientRect()
  return [triggerRect.left, triggerRect.top + triggerRect.height] as any
}

const cloneMenuChildren = (children: any) => {
  let childTextValues: (null | string)[] = []
  const childrenWithProps = Children.map(children, (c) => {
    const childIndex = childTextValues.length
    childTextValues = [
      ...childTextValues,
      c.props.textValue || typeof c.children === 'string' ? c.children : null,
    ]
    return cloneElement(c, { childIndex })
  })

  return [childrenWithProps, childTextValues.length]
}
