import { useRef, useState } from 'react'
import { action } from '@storybook/addon-actions'
import { FocusableItem, Group, Item, SubList } from './listbox'
import { Menu, MenuProps } from './menu'
import _ from 'lodash'
import { Tooltip } from './tooltip'
import { fruits, moreFruits } from '../util/fruits'
import { Picker } from './picker'
import { Lorem } from './lorem'
import { Popout } from './popout'
import { mergeRefs } from '../util/merge-refs'
import { PopoutVariant } from './dialog-variant'

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
  children: moreFruits.map((fruit) => <Item>{fruit}</Item>),
  trigger: ({ ref, open }) => (
    <button ref={ref} onClick={open}>
      open
    </button>
  ),
}

export const Default = () => {
  return <Menu {...defaultMenuProps} />
}

export const DisabledChildren = () => {
  return (
    <Menu {...defaultMenuProps}>
      {fruits.map((fruit) => (
        <Item isDisabled>{fruit}</Item>
      ))}
    </Menu>
  )
}

export const WithTooltips = () => {
  return (
    <Menu {...defaultMenuProps}>
      {fruits.map((fruit) => (
        <Tooltip
          trigger={(props) => <Item {...props}>{fruit}</Item>}
          dialog={{ placement: 'right' }}
        >
          more info about {fruit}
        </Tooltip>
      ))}
      {/* <SubList trigger={(props) => <Item {...props}>more fruits</Item>}>
        {moreFruits.map((fruit) => (
          <Tooltip
            trigger={(props) => <Item {...props}>{fruit}</Item>}
            dialog={{ placement: 'right' }}
          >
            more info about {fruit}
          </Tooltip>
        ))}
      </SubList> */}
    </Menu>
  )
}

export const Async = () => {
  const { pokemon, more, loading } = usePokemon()

  return (
    <Menu
      {...defaultMenuProps}
      dialog={{
        onOpen: () => {
          if (!pokemon.length) more()
        },
      }}
      popout={{ maxHeight: 100 }}
      onChange={action('onChange')}
      onScrolledToBottom={more}
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
      onChange={(...args) => {
        action('onChange')(...args)
        return false
      }}
    />
  )
}

export const AsPicker = () => {
  const [value, setValue] = useState<number | string | null>(null)
  const activeOptionId = (!_.isNull(value) && String(value)) || undefined
  return (
    <Picker
      {...defaultMenuProps}
      value={value}
      onChange={(...args) => {
        setValue(args[0])
        action('onChange')(...args)
      }}
      activeOptionId={activeOptionId}
    >
      {fruits.map((fruit) => (
        <Item id={fruit}>{fruit}</Item>
      ))}
    </Picker>
  )
}

export const Grouped = () => {
  const [value, setValue] = useState<number | string | null>(null)
  return (
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
  )
}

export const MultilevelPicker = () => {
  const [value, setValue] = useState<number | string | null>(null)
  const [popoutOpen, setPopoutOpen] = useState(false)
  return (
    <Menu
      {...defaultMenuProps}
      value={value}
      onChange={(...args) => {
        setValue(args[0])
        action('onChange')(...args)
      }}
    >
      {fruits.map((fruit) => (
        <Item>{fruit}</Item>
      ))}
      <Menu trigger={(props) => <Item {...props}>letters</Item>}>
        {moreFruits.map((fruit) => (
          <Item>{fruit}</Item>
        ))}
        <Item>a</Item>
        <Item>b</Item>
        <Item>c</Item>
        <Item>d</Item>
      </Menu>
      <Menu trigger={(props) => <Item {...props}>more letters</Item>}>
        <Item>e</Item>
        <Item>f</Item>
        <PopoutVariant
          dialog={{
            placement: 'right',
            isOpen: popoutOpen,
            onClose: () => setPopoutOpen(false),
          }}
          trigger={({ ref, open, close, ...props }) => (
            <FocusableItem
              ref={ref}
              onVirtualFocusEnd={() => close()}
              {...props}
            >
              {({ focusableRef, handleKeyDown }) => (
                <button
                  ref={focusableRef}
                  onClick={() => setPopoutOpen(true)}
                  onKeyDown={handleKeyDown}
                >
                  open
                </button>
              )}
            </FocusableItem>
          )}
        >
          <button onClick={() => setPopoutOpen(false)}>close</button>
          <Lorem />
        </PopoutVariant>
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
  const [value, setValue] = useState<number | string | null>(null)
  return (
    <Menu
      {...defaultMenuProps}
      value={value}
      onChange={(...args) => {
        setValue(args[0])
        action('onChange')(...args)
      }}
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
          <Item>{fruit}</Item>
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
  )
}

export const WithMultipleFilter = () => {
  const [filter, setFilter] = useState('')
  const [filter2, setFilter2] = useState('')
  const [value, setValue] = useState<number | string | null>(null)
  const filteredFruits2 = fruits.filter((fruit) =>
    fruit.includes(filter2.toLowerCase()),
  )
  return (
    <Menu
      {...defaultMenuProps}
      value={value}
      onChange={(...args) => {
        setValue(args[0])
        action('onChange')(...args)
      }}
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

const MenuWPopout = () => {
  const [popoutOpen, setPopoutOpen] = useState(false)
  return (
    <Menu {...defaultMenuProps}>
      {fruits.map((fruit) => (
        <Item>{fruit}</Item>
      ))}
      <PopoutVariant
        dialog={{
          placement: 'right',
          isOpen: popoutOpen,
          onClose: () => setPopoutOpen(false),
        }}
        trigger={({ ref, ...props }) => (
          <FocusableItem ref={ref} {...props}>
            {({ focusableRef, handleKeyDown }) => (
              <button
                ref={focusableRef}
                onClick={() => setPopoutOpen(true)}
                onKeyDown={handleKeyDown}
              >
                open
              </button>
            )}
          </FocusableItem>
        )}
      >
        <button onClick={() => setPopoutOpen(false)}>close</button>
        <Lorem />
      </PopoutVariant>
      <Item>yo</Item>
    </Menu>
  )
}

export const WithPopout = () => (
  <>
    <MenuWPopout />
    <MenuWPopout />
  </>
)
