import { useState, useRef } from 'react'
// import styled from 'styled-components'
import { Dialog, DialogContent } from './components/dialog'
import * as Menu from './components/menu'
import { mergeRefs } from './util/merge-refs'

const DialogExample = () => {
  const [isOpen, setIsOpen] = useState(false)
  const initialFocusRef = useRef<any>(null)
  return (
    <div>
      <button onClick={() => setIsOpen((s) => !s)}>
        {isOpen ? 'close dialog' : 'open dialog'}
      </button>
      <Dialog isOpen={isOpen}>
        <DialogContent initialFocusRef={initialFocusRef}>
          <button>other</button>
          <button ref={initialFocusRef}>initial</button>
          <button onClick={() => setIsOpen(false)}>close</button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const MenuExample = () => {
  return (
    <div>
      <Menu.Menu
        level={0}
        trigger={({ open }) => <button onClick={open}>open</button>}
      >
        <Menu.List>
          <Menu.Item>item 1</Menu.Item>
          <Menu.Item>item 2</Menu.Item>
          <Menu.Item>item 3</Menu.Item>
          <Menu.Submenu
            level={1}
            trigger={({ menuIdx, open }) => (
              <Menu.Item menuIdx={menuIdx} onClick={open}>
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
              <Menu.Submenu
                level={2}
                trigger={({ menuIdx, open }) => (
                  <Menu.Item menuIdx={menuIdx} onClick={open}>
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
                  <Menu.FocusableItem>
                    {({ focusableRef, handleKeyDown }) => (
                      <input ref={focusableRef} onKeyDown={handleKeyDown} />
                    )}
                  </Menu.FocusableItem>
                </Menu.List>
              </Menu.Submenu>
            </Menu.List>
          </Menu.Submenu>
        </Menu.List>
      </Menu.Menu>
    </div>
  )
}

const MenuPopoutExample = () => {
  const [isPopoutOpen, setIsPopoutOpen] = useState(false)
  const initialPopoutFocusRef = useRef<any>(null)

  return (
    <div>
      <Menu.Menu
        level={0}
        trigger={({ open }) => <button onClick={open}>open</button>}
      >
        <Menu.List>
          <Menu.Item>item 1</Menu.Item>
          <Menu.Item>item 2</Menu.Item>
          <Menu.Item>item 3</Menu.Item>
          <Menu.Submenu
            level={1}
            trigger={({ menuIdx, open }) => (
              <Menu.Item menuIdx={menuIdx} onClick={open}>
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
              <Menu.Item onClick={() => setIsPopoutOpen(true)}>
                popout
              </Menu.Item>
            </Menu.List>
          </Menu.Submenu>
        </Menu.List>
      </Menu.Menu>
      <Dialog isOpen={isPopoutOpen}>
        <DialogContent initialFocusRef={initialPopoutFocusRef}>
          <button>other</button>
          <button ref={initialPopoutFocusRef}>initial</button>
          <button onClick={() => setIsPopoutOpen(false)}>close</button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const ComboboxExample = () => {
  const inputRef = useRef<any>(null)
  return (
    <div>
      <Menu.Menu
        noFocusTrap
        level={0}
        trigger={({ stickyTriggerRef, open, handleKeyDown }) => (
          <>
            <input
              ref={mergeRefs(stickyTriggerRef, inputRef)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => {
                open()
                inputRef.current.focus()
              }}
            >
              v
            </button>
          </>
        )}
      >
        <Menu.List>
          <Menu.Item>item 1</Menu.Item>
          <Menu.Item>item 2</Menu.Item>
          <Menu.Item>item 3</Menu.Item>
          <Menu.Submenu
            level={1}
            trigger={({ menuIdx, open }) => (
              <Menu.Item menuIdx={menuIdx} onClick={open}>
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
              <Menu.FocusableItem>
                {({ focusableRef, handleKeyDown }) => (
                  <input ref={focusableRef} onKeyDown={handleKeyDown} />
                )}
              </Menu.FocusableItem>
            </Menu.List>
          </Menu.Submenu>
        </Menu.List>
      </Menu.Menu>
    </div>
  )
}

const DropdownExample = () => {
  const [value, setValue] = useState<string | null>(null)
  return (
    <div>
      <Menu.Menu
        level={0}
        trigger={({ open }) => (
          <button onClick={open}>{value || 'open'}</button>
        )}
      >
        <Menu.List>
          <Menu.Item onClick={() => setValue('1')}>item 1</Menu.Item>
          <Menu.Item onClick={() => setValue('2')}>item 2</Menu.Item>
          <Menu.Item onClick={() => setValue('3')}>item 3</Menu.Item>
          <Menu.Submenu
            level={1}
            trigger={({ menuIdx, open }) => (
              <Menu.Item menuIdx={menuIdx} onClick={open}>
                open
              </Menu.Item>
            )}
          >
            <Menu.List>
              <Menu.Item onClick={() => setValue('1')}>item 1</Menu.Item>
              <Menu.Item onClick={() => setValue('2')}>item 2</Menu.Item>
              <Menu.Item onClick={() => setValue('3')}>item 3</Menu.Item>
              <Menu.Item onClick={() => setValue('4')}>item 4</Menu.Item>
              <Menu.Item onClick={() => setValue('5')}>item 5</Menu.Item>
              <Menu.Submenu
                level={2}
                trigger={({ menuIdx, open }) => (
                  <Menu.Item menuIdx={menuIdx} onClick={open}>
                    open
                  </Menu.Item>
                )}
              >
                <Menu.List>
                  <Menu.Item onClick={() => setValue('1')}>item 1</Menu.Item>
                  <Menu.FocusableItem>
                    {({ focusableRef, handleKeyDown }) => (
                      <input ref={focusableRef} onKeyDown={handleKeyDown} />
                    )}
                  </Menu.FocusableItem>
                  <Menu.Item onClick={() => setValue('2')}>item 2</Menu.Item>
                  <Menu.Item onClick={() => setValue('3')}>item 3</Menu.Item>
                  <Menu.FocusableItem>
                    {({ focusableRef, handleKeyDown }) => (
                      <input ref={focusableRef} onKeyDown={handleKeyDown} />
                    )}
                  </Menu.FocusableItem>
                </Menu.List>
              </Menu.Submenu>
            </Menu.List>
          </Menu.Submenu>
        </Menu.List>
      </Menu.Menu>
    </div>
  )
}

export const App = () => {
  return (
    <section>
      <h1>title</h1>
      <h2>subtitle</h2>
      <button>bla bla</button>
      <DialogExample />
      <MenuExample />
      <MenuPopoutExample />
      <ComboboxExample />
      <DropdownExample />
      <ul>
        <li>hihi</li>
        <li>hoho</li>
        <li>hehe</li>
      </ul>
      {/* <div>
        {Array.from({ length: 200 }).map(() => (
          <p>scroll b</p>
        ))}
      </div> */}
    </section>
  )
}
