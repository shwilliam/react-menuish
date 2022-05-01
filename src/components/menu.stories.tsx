import { MouseEventHandler, useRef, useState } from 'react'
import { action } from '@storybook/addon-actions'
import { FocusableItem, Group, Item } from './listbox'
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
  onOpen: action('onOpen'),
  onClose: action('onClose'),
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
      trigger={({ ref }) => (
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
        {...defaultMenuProps}
        isOpen={!!position}
        onClose={() => setPosition(undefined)}
        position={position}
      />
    </div>
  )
}

export const DisabledChildren = () => {
  return (
    <Menu
      {...defaultMenuProps}
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      {fruits.map((fruit) => (
        <Item isDisabled>{fruit}</Item>
      ))}
    </Menu>
  )
}

export const WithTooltips = () => {
  return (
    <Menu
      {...defaultMenuProps}
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
    >
      {fruits.map((fruit) => (
        <Tooltip
          popout={{ placement: 'right' }}
          trigger={(props) => <Item {...props}>{fruit}</Item>}
        >
          more info about {fruit}
        </Tooltip>
      ))}
      <Menu trigger={(props) => <Item {...props}>more fruits</Item>}>
        {moreFruits.map((fruit) => (
          <Tooltip
            popout={{ placement: 'right' }}
            trigger={(props) => <Item {...props}>{fruit}</Item>}
          >
            more info about {fruit}
          </Tooltip>
        ))}
      </Menu>
    </Menu>
  )
}

export const Async = () => {
  const { pokemon, more, loading } = usePokemon()

  return (
    <Menu
      {...defaultMenuProps}
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
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
  )
}

export const KeepOpen = () => {
  return (
    <Menu
      {...defaultMenuProps}
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      onChange={(...args) => {
        action('onChange')(...args)
        return false
      }}
    />
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
    <Menu
      {...defaultMenuProps}
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
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
  )
}

export const Multilevel = () => {
  return (
    <Menu
      {...defaultMenuProps}
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      onChange={action('onChange')}
    >
      {fruits.map((fruit) => (
        <Item>{fruit}</Item>
      ))}
      <Menu
        onOpen={action('onOpen [submenu]')}
        trigger={(props) => <Item {...props}>letters</Item>}
      >
        <Item>a</Item>
        <Item>b</Item>
        <Item>c</Item>
        <Item>d</Item>
      </Menu>
      <Menu trigger={(props) => <Item {...props}>more letters</Item>}>
        <Item>e</Item>
        <Item>f</Item>
        <Item>g</Item>
        <Item>h</Item>
        <Menu trigger={(props) => <Item {...props}>even more letters</Item>}>
          <Item>i</Item>
          <Item>j</Item>
          <Item>k</Item>
          <Item>l</Item>
        </Menu>
      </Menu>
    </Menu>
  )
}

export const WithFilter = () => {
  const [filter, setFilter] = useState('')
  return (
    <Menu
      {...defaultMenuProps}
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
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
      <Menu trigger={(props) => <Item {...props}>letters</Item>}>
        <Item>a</Item>
        <Item>b</Item>
        <Item>c</Item>
        <Item>d</Item>
      </Menu>
      {moreFruits
        .filter((fruit) => fruit.includes(filter.toLowerCase()))
        .map((fruit) => (
          <Item>{fruit}</Item>
        ))}
    </Menu>
  )
}

export const WithMultipleFilter = () => {
  const [filter, setFilter] = useState('')
  const [filter2, setFilter2] = useState('')
  const filteredFruits2 = fruits.filter((fruit) =>
    fruit.includes(filter2.toLowerCase()),
  )
  return (
    <Menu
      {...defaultMenuProps}
      trigger={({ ref, open }) => (
        <button ref={ref} onClick={open}>
          open
        </button>
      )}
      onChange={action('onChange')}
    >
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
      <Menu trigger={(props) => <Item {...props}>all fruits</Item>}>
        {fruits.map((fruit) => (
          <Item>{fruit}</Item>
        ))}
      </Menu>
      <Menu trigger={(props) => <Item {...props}>fruits again</Item>}>
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
      </Menu>
    </Menu>
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
