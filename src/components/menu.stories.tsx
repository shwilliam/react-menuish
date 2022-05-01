import { MouseEventHandler, useRef, useState } from 'react'
import { action } from '@storybook/addon-actions'
import { FocusableItem, Group, Item, SubList } from './listbox'
import { Menu, MenuProps } from './menu'
import _ from 'lodash'
import { Tooltip } from './tooltip'
import { fruits, moreFruits } from '../util/fruits'
import { Picker } from './picker'
import { Lorem } from './lorem'
import { Popout } from './popout'
import { DialogContainer, DialogTrigger, PopoverPosition } from './dialog'

const fetchPokemon = async (
  url: string = 'https://pokeapi.co/api/v2/pokemon?limit=10',
) => {
  const res = await fetch(url)
  const resJson = await res.json()
  return { next: resJson.next, results: resJson.results }
}

const usePokemon = () => {
  const [pokemon, setPokemon] = useState<{ name: string }[]>([])
  const nextRef = useRef()
  const [loading, setLoading] = useState(false)
  const more = async () => {
    setLoading(true)
    const { next, results } = await fetchPokemon(nextRef.current)
    setLoading(false)
    if (_.isArray(results)) setPokemon((s) => [...s, ...results])
    nextRef.current = next
  }

  return { pokemon, more, loading }
}

export default {
  title: 'Menu',
}

const defaultMenuProps: MenuProps = {
  onChange: action('onChange'),
  // onOpen: action('onOpen'),
  // onClose: action('onClose'),
  children: fruits.map((fruit) => <Item>{fruit}</Item>),
}

export const Default = () => {
  return (
    <Menu
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      {...defaultMenuProps}
    />
  )
}

export const WithExternalStateTrigger = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Menu
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={() => setIsOpen(true)}>
          open
        </button>
      )}
      {...defaultMenuProps}
    />
  )
}

export const Context = () => {
  const [position, setPosition] = useState<PopoverPosition>()
  const handleContextMenu: MouseEventHandler = (e) => {
    setPosition({ x: e.clientX, y: e.clientY })
    e.preventDefault()
  }

  return (
    <div
      style={{ height: '500px', border: '1px solid blue' }}
      onContextMenu={handleContextMenu}
    >
      right click me
      <Menu
        isOpen={!!position}
        onClose={() => setPosition(undefined)}
        position={position}
        {...defaultMenuProps}
      />
    </div>
  )
}

export const DisabledChildren = () => {
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Menu {...defaultMenuProps}>
        {fruits.map((fruit) => (
          <Item isDisabled>{fruit}</Item>
        ))}
      </Menu>
    </DialogTrigger>
  )
}

export const WithTooltips = () => {
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Menu {...defaultMenuProps}>
        {fruits.map((fruit) => (
          <Tooltip
            popout={{ placement: 'right' }}
            trigger={(props) => <Item {...props}>{fruit}</Item>}
          >
            more info about {fruit}
          </Tooltip>
        ))}
        <SubList trigger={(props) => <Item {...props}>more fruits</Item>}>
          {moreFruits.map((fruit) => (
            <Tooltip
              popout={{ placement: 'right' }}
              trigger={(props) => <Item {...props}>{fruit}</Item>}
            >
              more info about {fruit}
            </Tooltip>
          ))}
        </SubList>
      </Menu>
    </DialogTrigger>
  )
}

export const Async = () => {
  const { pokemon, more, loading } = usePokemon()

  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Menu
        onOpen={() => {
          if (!pokemon.length) more()
        }}
        onChange={action('onChange')}
        onLoadMore={more}
      >
        {pokemon.map((pokemon) => (
          <Item>{pokemon.name}</Item>
        ))}
        {loading ? <Item isDisabled>loading</Item> : null}
      </Menu>
    </DialogTrigger>
  )
}

export const KeepOpen = () => {
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Menu
        {...defaultMenuProps}
        onChange={(...args) => {
          action('onChange')(...args)
          return false
        }}
      />
    </DialogTrigger>
  )
}

// export const AsPicker = () => {
//   const [value, setValue] = useState<number | string | null>(null)
//   const activeOptionId = (!_.isNull(value) && String(value)) || undefined
//   return (
//     <Picker
//       {...defaultMenuProps}
//       value={value}
//       onChange={(...args) => {
//         setValue(args[0])
//         action('onChange')(...args)
//       }}
//       activeOptionId={activeOptionId}
//     >
//       {fruits.map((fruit) => (
//         <Item id={fruit}>{fruit}</Item>
//       ))}
//     </Picker>
//   )
// }

export const Grouped = () => {
  const [value, setValue] = useState<number | string | null>(null)
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Menu
        {...defaultMenuProps}
        value={value}
        onChange={(...args) => {
          setValue(args[0])
          action('onChange')(...args)
        }}
      >
        <Group label={<div>numbers</div>}>
          <Item value={1}>one</Item>
          <Item value={2} isDisabled>
            two (disabled)
          </Item>
          <Item value={3}>three</Item>
          <Item value={4}>four</Item>
        </Group>
        <Group label={<div>letters</div>}>
          <Item>a</Item>
          <Item>b</Item>
          <Item>c</Item>
          <Item>d</Item>
        </Group>
      </Menu>
    </DialogTrigger>
  )
}

export const Multilevel = () => {
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Menu {...defaultMenuProps} onChange={action('onChange')}>
        {fruits.map((fruit) => (
          <Item>{fruit}</Item>
        ))}
        <SubList trigger={(props) => <Item {...props}>letters</Item>}>
          <Item>a</Item>
          <Item>b</Item>
          <Item>c</Item>
          <Item>d</Item>
        </SubList>
        <SubList trigger={(props) => <Item {...props}>more letters</Item>}>
          <Item>e</Item>
          <Item>f</Item>
          <Item>g</Item>
          <Item>h</Item>
          <SubList
            trigger={(props) => <Item {...props}>even more letters</Item>}
          >
            <Item>i</Item>
            <Item>j</Item>
            <Item>k</Item>
            <Item>l</Item>
          </SubList>
        </SubList>
      </Menu>
    </DialogTrigger>
  )
}

export const WithFilter = () => {
  const [filter, setFilter] = useState('')
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Menu
        {...defaultMenuProps}
        style={{ width: '200px' }}
        onChange={action('onChange')}
        focusResetTrigger={filter}
      >
        <FocusableItem isVirtuallyFocusable={false}>
          {({ focusableRef, handleKeyDown }) => (
            <input
              ref={focusableRef}
              value={filter}
              onChange={(...args) => {
                setFilter(args[0].target.value)
                action('onChange (input)')(...args)
              }}
              onKeyDown={handleKeyDown}
            />
          )}
        </FocusableItem>
        {fruits
          .filter((fruit) => fruit.includes(filter.toLowerCase()))
          .map((fruit) => (
            <Item>{fruit} alkjsdlkfjsdlkj sdlkjf sdlkj sdfkljlsdfjk</Item>
          ))}
        <SubList trigger={(props) => <Item {...props}>letters</Item>}>
          <Item>a</Item>
          <Item>b</Item>
          <Item>c</Item>
          <Item>d</Item>
        </SubList>
        {moreFruits
          .filter((fruit) => fruit.includes(filter.toLowerCase()))
          .map((fruit) => (
            <Item>{fruit}</Item>
          ))}
      </Menu>
    </DialogTrigger>
  )
}

export const WithMultipleFilter = () => {
  const [filter, setFilter] = useState('')
  const [filter2, setFilter2] = useState('')
  const filteredFruits2 = fruits.filter((fruit) =>
    fruit.includes(filter2.toLowerCase()),
  )
  return (
    <DialogTrigger
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      <Menu {...defaultMenuProps} onChange={action('onChange')}>
        <Item>fixed fruit 1</Item>
        <Item>fixed fruit 2</Item>
        <FocusableItem isVirtuallyFocusable={false}>
          {({ focusableRef, handleKeyDown }) => (
            <input
              ref={focusableRef}
              value={filter}
              onChange={(...args) => {
                setFilter(args[0].target.value)
                action('onChange (input)')(...args)
              }}
              onKeyDown={handleKeyDown}
            />
          )}
        </FocusableItem>
        {fruits
          .filter((fruit) => fruit.includes(filter.toLowerCase()))
          .map((fruit) => (
            <Item>{fruit}</Item>
          ))}
        <SubList trigger={(props) => <Item {...props}>all fruits</Item>}>
          {fruits.map((fruit) => (
            <Item>{fruit}</Item>
          ))}
        </SubList>
        <SubList trigger={(props) => <Item {...props}>fruits again</Item>}>
          <Item>fixed fruit 1</Item>
          <Item>fixed fruit 2</Item>
          <FocusableItem isVirtuallyFocusable={false}>
            {({ focusableRef, handleKeyDown }) => (
              <input
                ref={focusableRef}
                value={filter2}
                onChange={(e) => setFilter2(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            )}
          </FocusableItem>
          {filteredFruits2.length ? (
            filteredFruits2.map((fruit) => <Item>{fruit}</Item>)
          ) : (
            <Item>no results</Item>
          )}
        </SubList>
      </Menu>
    </DialogTrigger>
  )
}

// export const WithPopout = () => {
//   const [popoutOpen, setPopoutOpen] = useState(false)

//   return (
//     <Menu {...defaultMenuProps}>
//       {fruits.map((fruit) => (
//         <Item>{fruit}</Item>
//       ))}
//       <Popout
//         isOpen={popoutOpen}
//         onClose={() => setPopoutOpen(false)}
//         trigger={(props) => (
//           <FocusableItem
//             onClick={() => {
//               setPopoutOpen(true)
//               return false
//             }}
//             {...props}
//           >
//             {({ focusableRef, handleKeyDown }) => (
//               <button
//                 ref={focusableRef}
//                 onClick={() => setPopoutOpen(true)}
//                 onKeyDown={handleKeyDown}
//               >
//                 open
//               </button>
//             )}
//           </FocusableItem>
//         )}
//       >
//         <button onClick={() => setPopoutOpen(false)}>close</button>
//         <Lorem paragraphs={5} />
//       </Popout>
//       <Item>yo</Item>
//     </Menu>
//   )
// }
