import { useRef, useState } from 'react'
import { action } from '@storybook/addon-actions'
import {
  ListBoxItemFocusable,
  ListBoxGroup,
  ListBoxItem,
  SubList,
} from './listbox'
import { Menu, MenuProps } from './menu'
import _ from 'lodash'
import { Tooltip } from './tooltip'
import { fruits, moreFruits } from '../util/fruits'
import { Picker } from './picker'
import { Lorem } from './lorem'
import { Popout } from './popout'

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
  children: fruits.map((fruit) => <ListBoxItem>{fruit}</ListBoxItem>),
}

export const Default = () => {
  return <Menu {...defaultMenuProps} />
}

export const DisabledChildren = () => {
  return (
    <Menu {...defaultMenuProps}>
      {fruits.map((fruit) => (
        <ListBoxItem isDisabled>{fruit}</ListBoxItem>
      ))}
    </Menu>
  )
}

export const WithTooltips = () => {
  return (
    <Menu {...defaultMenuProps}>
      {fruits.map((fruit) => (
        <Tooltip
          popout={{ placement: 'right' }}
          trigger={(props) => <ListBoxItem {...props}>{fruit}</ListBoxItem>}
        >
          more info about {fruit}
        </Tooltip>
      ))}
      <SubList
        trigger={(props) => <ListBoxItem {...props}>more fruits</ListBoxItem>}
      >
        {moreFruits.map((fruit) => (
          <Tooltip
            popout={{ placement: 'right' }}
            trigger={(props) => <ListBoxItem {...props}>{fruit}</ListBoxItem>}
          >
            more info about {fruit}
          </Tooltip>
        ))}
      </SubList>
    </Menu>
  )
}

export const Async = () => {
  const { pokemon, more, loading } = usePokemon()

  return (
    <Menu
      onOpen={() => {
        if (!pokemon.length) more()
      }}
      onChange={action('onChange')}
      onLoadMore={more}
    >
      {pokemon.map((pokemon) => (
        <ListBoxItem>{pokemon.name}</ListBoxItem>
      ))}
      {loading ? <ListBoxItem isDisabled>loading</ListBoxItem> : null}
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
        <ListBoxItem id={fruit}>{fruit}</ListBoxItem>
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
      <ListBoxGroup label={<div>numbers</div>}>
        <ListBoxItem value={1}>one</ListBoxItem>
        <ListBoxItem value={2} isDisabled>
          two (disabled)
        </ListBoxItem>
        <ListBoxItem value={3}>three</ListBoxItem>
        <ListBoxItem value={4}>four</ListBoxItem>
      </ListBoxGroup>
      <ListBoxGroup label={<div>letters</div>}>
        <ListBoxItem>a</ListBoxItem>
        <ListBoxItem>b</ListBoxItem>
        <ListBoxItem>c</ListBoxItem>
        <ListBoxItem>d</ListBoxItem>
      </ListBoxGroup>
    </Menu>
  )
}

export const MultilevelPicker = () => {
  const [value, setValue] = useState<number | string | null>(null)
  return (
    <Picker
      {...defaultMenuProps}
      value={value}
      onChange={(...args) => {
        setValue(args[0])
        action('onChange')(...args)
      }}
    >
      {fruits.map((fruit) => (
        <ListBoxItem>{fruit}</ListBoxItem>
      ))}
      <SubList
        trigger={(props) => <ListBoxItem {...props}>letters</ListBoxItem>}
      >
        <ListBoxItem>a</ListBoxItem>
        <ListBoxItem>b</ListBoxItem>
        <ListBoxItem>c</ListBoxItem>
        <ListBoxItem>d</ListBoxItem>
      </SubList>
      <SubList
        trigger={(props) => <ListBoxItem {...props}>more letters</ListBoxItem>}
      >
        <ListBoxItem>e</ListBoxItem>
        <ListBoxItem>f</ListBoxItem>
        <ListBoxItem>g</ListBoxItem>
        <ListBoxItem>h</ListBoxItem>
        <SubList
          trigger={(props) => (
            <ListBoxItem {...props}>even more letters</ListBoxItem>
          )}
        >
          <ListBoxItem>i</ListBoxItem>
          <ListBoxItem>j</ListBoxItem>
          <ListBoxItem>k</ListBoxItem>
          <ListBoxItem>l</ListBoxItem>
        </SubList>
      </SubList>
    </Picker>
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
      <ListBoxItemFocusable isVirtuallyFocusable={false}>
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
      </ListBoxItemFocusable>
      {fruits
        .filter((fruit) => fruit.includes(filter.toLowerCase()))
        .map((fruit) => (
          <ListBoxItem>{fruit}</ListBoxItem>
        ))}
      <SubList
        trigger={(props) => <ListBoxItem {...props}>letters</ListBoxItem>}
      >
        <ListBoxItem>a</ListBoxItem>
        <ListBoxItem>b</ListBoxItem>
        <ListBoxItem>c</ListBoxItem>
        <ListBoxItem>d</ListBoxItem>
      </SubList>
      {moreFruits
        .filter((fruit) => fruit.includes(filter.toLowerCase()))
        .map((fruit) => (
          <ListBoxItem>{fruit}</ListBoxItem>
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
      <ListBoxItem>fixed fruit 1</ListBoxItem>
      <ListBoxItem>fixed fruit 2</ListBoxItem>
      <ListBoxItemFocusable isVirtuallyFocusable={false}>
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
      </ListBoxItemFocusable>
      {fruits
        .filter((fruit) => fruit.includes(filter.toLowerCase()))
        .map((fruit) => (
          <ListBoxItem>{fruit}</ListBoxItem>
        ))}
      <SubList
        trigger={(props) => <ListBoxItem {...props}>all fruits</ListBoxItem>}
      >
        {fruits.map((fruit) => (
          <ListBoxItem>{fruit}</ListBoxItem>
        ))}
      </SubList>
      <SubList
        trigger={(props) => <ListBoxItem {...props}>fruits again</ListBoxItem>}
      >
        <ListBoxItem>fixed fruit 1</ListBoxItem>
        <ListBoxItem>fixed fruit 2</ListBoxItem>
        <ListBoxItemFocusable isVirtuallyFocusable={false}>
          {({ focusableRef, handleKeyDown }) => (
            <input
              ref={focusableRef}
              value={filter2}
              onChange={(e) => setFilter2(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </ListBoxItemFocusable>
        {filteredFruits2.length ? (
          filteredFruits2.map((fruit) => <ListBoxItem>{fruit}</ListBoxItem>)
        ) : (
          <ListBoxItem>no results</ListBoxItem>
        )}
      </SubList>
    </Menu>
  )
}

export const WithPopout = () => {
  const [popoutOpen, setPopoutOpen] = useState(false)

  return (
    <Menu {...defaultMenuProps}>
      {fruits.map((fruit) => (
        <ListBoxItem>{fruit}</ListBoxItem>
      ))}
      <Popout
        isOpen={popoutOpen}
        onClose={() => setPopoutOpen(false)}
        trigger={(props) => (
          <ListBoxItemFocusable
            onClick={() => {
              setPopoutOpen(true)
              return false
            }}
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
          </ListBoxItemFocusable>
        )}
      >
        <button onClick={() => setPopoutOpen(false)}>close</button>
        <Lorem paragraphs={5} />
      </Popout>
      <ListBoxItem>yo</ListBoxItem>
    </Menu>
  )
}
