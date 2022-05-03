import { useRef, useState, ReactNode } from 'react'
import { fruits } from '../util/fruits'
import { mergeRefs } from '../util/merge-refs'
import { PopoutVariant, PopoverPosition } from './dialog-variant'
import { FocusableItem, Item, ListBox } from './listbox'
import { Lorem } from './lorem'

export default {
  title: 'Popout',
}

export const Default = ({ children = 'hello' }: { children?: ReactNode }) => {
  return (
    <PopoutVariant
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      {children}
    </PopoutVariant>
  )
}

export const TwoPopouts = () => {
  return (
    <>
      <Default />
      <Default>
        bla bla bla
        <Default />
      </Default>
    </>
  )
}

export const ExternalState = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <PopoutVariant
        trigger={({ ref, open }) => (
          <button ref={ref} onClick={() => setIsOpen(true)}>
            open
          </button>
        )}
        dialog={{
          isOpen,
          onClose: () => setIsOpen(false),
        }}
      >
        <Lorem paragraphs={5} />
      </PopoutVariant>
      <Lorem paragraphs={50} />
    </>
  )
}

new Date().getTime()

export const ContextMenu = () => {
  const [anchorPosition, setAnchorPosition] =
    useState<PopoverPosition | null>(null)

  return (
    <div
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      onContextMenu={(e) => {
        e.preventDefault()
        setAnchorPosition({ x: e.clientX, y: e.clientY })
        e.stopPropagation()
      }}
    >
      Right click me
      <PopoutVariant
        dialog={{
          isOpen: !!anchorPosition,
          position: anchorPosition,
          onClose: () => setAnchorPosition(null),
        }}
      >
        hello
      </PopoutVariant>
    </div>
  )
}

export const WithInfoSection = () => {
  const [popoutOpen, setPopoutOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const initialFocusRef = useRef<any>()
  const [virtuallyFocused, setVirtuallyFocused] = useState<string>()
  return (
    <>
      <PopoutVariant
        style={{ display: 'flex' }}
        dialog={{
          isOpen: popoutOpen,
          onClose: () => setPopoutOpen(false),
          // initialFocusRef,
        }}
        trigger={({ ref, open }) => (
          <button ref={ref} onClick={() => setPopoutOpen(true)}>
            open
          </button>
        )}
      >
        <div>
          <ListBox
            ref={initialFocusRef}
            options={{
              onChange: (fruit) => {
                setPopoutOpen(false)
              },
            }}
          >
            <FocusableItem isVirtuallyFocusable={false}>
              {({ focusableRef }) => (
                <input
                  ref={mergeRefs(focusableRef)}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              )}
            </FocusableItem>
            {fruits
              .filter((fruit) => fruit.includes(filter.toLowerCase()))
              .map((fruit) => (
                <Item
                  key={fruit}
                  onVirtualFocusStart={() => setVirtuallyFocused(fruit)}
                >
                  {fruit}
                </Item>
              ))}
          </ListBox>
        </div>
        <div>more about {virtuallyFocused}</div>
      </PopoutVariant>
      <Lorem paragraphs={50} />
    </>
  )
}
