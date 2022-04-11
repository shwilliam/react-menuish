import { useState, useRef } from 'react'
import * as Menu from './menu'
import { fruits } from '../util/fruits'
import { Popout, PopoutContent } from './popout'
import { Lorem } from './lorem'

export default {
  title: 'Menu',
}

export const Default = () => {
  return (
    <Menu.Menu
      trigger={({ anchorRef, open }) => (
        <button ref={anchorRef} onClick={open}>
          open
        </button>
      )}
    >
      <Menu.List>
        {fruits.map((f, idx) => (
          <Menu.Item key={f} isDisabled={idx === 2}>
            {f}
          </Menu.Item>
        ))}
      </Menu.List>
    </Menu.Menu>
  )
}

export const WithFilter = () => {
  const [filter, setFilter] = useState('')
  return (
    <Menu.Menu
      trigger={({ anchorRef, open }) => (
        <button ref={anchorRef} onClick={open}>
          menu w/ filter
        </button>
      )}
    >
      <Menu.List>
        <Menu.FocusableItem>
          {({ focusableRef, handleKeyDown }) => (
            <input
              ref={focusableRef}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </Menu.FocusableItem>
        <Menu.Group label="group label">
          {fruits
            .filter(
              (f) => !filter || f.toLowerCase().includes(filter.toLowerCase()),
            )
            .map((f) => (
              <Menu.Item key={f}>{f}</Menu.Item>
            ))}
        </Menu.Group>
        <Menu.Group label="another group label">
          {fruits
            .filter(
              (f) => !filter || f.toLowerCase().includes(filter.toLowerCase()),
            )
            .map((f) => (
              <Menu.Item key={f}>{f}</Menu.Item>
            ))}
        </Menu.Group>
        <Menu.FocusableItem>
          {({ focusableRef, handleKeyDown }) => (
            <input
              ref={focusableRef}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </Menu.FocusableItem>
        <Menu.Submenu
          trigger={({ anchorRef, menuIdx, open }) => (
            <Menu.Item ref={anchorRef} menuIdx={menuIdx} onClick={open}>
              open
            </Menu.Item>
          )}
        >
          <Menu.List>
            <Menu.Item>item 1</Menu.Item>
            <Menu.Item>item 2</Menu.Item>
            <Menu.Item>item 3</Menu.Item>
            <Menu.FocusableItem>
              {({ focusableRef, handleKeyDown }) => (
                <input
                  ref={focusableRef}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              )}
            </Menu.FocusableItem>
            <Menu.Item>item 4</Menu.Item>
            <Menu.Item>item 5</Menu.Item>
          </Menu.List>
        </Menu.Submenu>
      </Menu.List>
    </Menu.Menu>
  )
}

export const WithPopout = () => {
  const [isPopoutOpen, setIsPopoutOpen] = useState(false)
  const initialPopoutFocusRef = useRef<any>()
  return (
    <>
      <Menu.Menu
        trigger={({ anchorRef, open }) => (
          <button ref={anchorRef} onClick={open}>
            open
          </button>
        )}
      >
        <Menu.List>
          <Menu.Item>item 1</Menu.Item>
          <Menu.Item>item 2</Menu.Item>
          <Menu.Item>item 3</Menu.Item>
          <Menu.Submenu
            trigger={({ anchorRef, menuIdx, open }) => (
              <Menu.Item ref={anchorRef} menuIdx={menuIdx} onClick={open}>
                open
              </Menu.Item>
            )}
          >
            <Menu.List>
              <Menu.Item>item 1</Menu.Item>
              <Menu.FocusableItem>
                {({ focusableRef, handleKeyDown }) => (
                  <input ref={focusableRef} onKeyDown={handleKeyDown} />
                )}
              </Menu.FocusableItem>
              <Menu.Item>item 2</Menu.Item>
              <Menu.Item>item 3</Menu.Item>
              <Popout
                isOpen={isPopoutOpen}
                onClose={() => setIsPopoutOpen(false)}
                trigger={({ anchorRef, ...forwardedProps }) => (
                  <Menu.Item
                    ref={anchorRef}
                    onClick={() => setIsPopoutOpen(true)}
                    noClose
                    {...forwardedProps}
                  >
                    popout
                  </Menu.Item>
                )}
              >
                <PopoutContent initialFocusRef={initialPopoutFocusRef}>
                  <button>other</button>
                  <button ref={initialPopoutFocusRef}>initial</button>
                  <button onClick={() => setIsPopoutOpen(false)}>close</button>
                </PopoutContent>
              </Popout>
            </Menu.List>
          </Menu.Submenu>
        </Menu.List>
      </Menu.Menu>
    </>
  )
}

export const TwoMenus = () => {
  return (
    <>
      <Default />
      <Default />
      <Lorem paragraphs={10} />
      <Default />
      <Lorem paragraphs={10} />
    </>
  )
}

export const Picker = () => {
  const [value, setValue] = useState<string | null>(null)
  return (
    <Menu.Menu
      trigger={({ anchorRef, open }) => (
        <button ref={anchorRef} onClick={open}>
          {value || 'select fruit'}
        </button>
      )}
    >
      <Menu.List>
        {fruits.map((f) => (
          <Menu.Item
            key={f}
            onClick={() => {
              setValue(f)
              return false
            }}
          >
            {f}
          </Menu.Item>
        ))}
      </Menu.List>
    </Menu.Menu>
  )
}
