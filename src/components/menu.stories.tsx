import { useState, useRef } from 'react'
import * as Menu from './menu'
import { fruits } from '../util/fruits'
import { Popout, PopoutContent } from './popout'

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
        {fruits.map((f) => (
          <Menu.Item key={f}>{f}</Menu.Item>
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
        {fruits
          .filter(
            (f) => !filter || f.toLowerCase().includes(filter.toLowerCase()),
          )
          .map((f) => (
            <Menu.Item key={f}>{f}</Menu.Item>
          ))}
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
            <Menu.Item>item 4</Menu.Item>
            <Menu.Item>item 5</Menu.Item>
          </Menu.List>
        </Menu.Submenu>
      </Menu.List>
    </Menu.Menu>
  )
}

export const WithPopout = () => {
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
                trigger={({ open, anchorRef, ...forwardedProps }) => (
                  <Menu.Item ref={anchorRef} onClick={open} {...forwardedProps}>
                    popout
                  </Menu.Item>
                )}
              >
                <PopoutContent initialFocusRef={initialPopoutFocusRef}>
                  <button>other</button>
                  <button ref={initialPopoutFocusRef}>initial</button>
                  <button>other</button>
                </PopoutContent>
              </Popout>
            </Menu.List>
          </Menu.Submenu>
        </Menu.List>
      </Menu.Menu>
    </>
  )
}