import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  ChangeEventHandler,
  useEffect,
  useRef,
  KeyboardEventHandler,
} from 'react'
import { Popout } from './popout'
import { ChangeHandler, ListBoxBase, useListBoxState } from './listbox'
import { Tray } from './tray'
import { useIsMobile } from '../hooks/is-mobile'

interface ComboboxProps {
  value?: string
  onChange?: ChangeHandler
  inputValue?: string
  onInputChange?: (value: string) => void
  children: ReactNode
}

export const Combobox = forwardRef(
  (
    { value, onChange, inputValue, onInputChange, ...props }: ComboboxProps,
    ref: ForwardedRef<any>,
  ) => {
    const { state } = useListBoxState({ onChange })
    const {
      focus,
      setFocus,
      triggerAction,
      close,
      focusNext,
      focusPrev,
      closeLevel,
    } = state
    const handleKeyDown: KeyboardEventHandler = (e) => {
      let handled = false
      switch (e.key) {
        case 'ArrowDown':
          if (!focus.length) setFocus([0])
          else focusNext()
          handled = true
          break
        case 'ArrowUp':
          focusPrev()
          handled = true
          break
        case ' ':
        case 'Enter':
          if (focus.length) {
            triggerAction()
            handled = true
          }
          break
        case 'ArrowLeft':
        case 'ArrowRight':
          const target = e.currentTarget
          if (!target) break

          const direction = e.key === 'ArrowLeft' ? 'left' : 'right',
            { selectionStart, selectionEnd } = target,
            isSelectionAtEnd = selectionEnd === inputValue?.length,
            isSelectionAtStart = selectionStart === 0,
            selectionLength = (selectionEnd ?? 0) - (selectionStart ?? 0),
            isEndOfInput =
              !selectionLength &&
              ((direction === 'left' && isSelectionAtStart) ||
                (direction === 'right' && isSelectionAtEnd))

          if (isEndOfInput) {
            if (direction === 'right') triggerAction()
            else closeLevel(focus.length - 1)
            handled = true
          }
          break
        case 'Escape':
          close()
          handled = true
          break
        default:
          break
      }

      if (handled) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleInputChange: ChangeEventHandler = (e) => {
      const value = e.target['value'] || ''
      onInputChange?.(value)
      if (!value) onChange?.(null)
      if (!focus.length) setFocus([0])
    }
    const handleBlur = () => {
      if (value) onInputChange?.((value && String(value)) || '')
      close()
    }

    const isOpen = !!focus.length
    const isMobile = useIsMobile()

    useEffect(() => {
      onInputChange?.((value && String(value)) || '')
    }, [value, onInputChange])

    const listbox = <ListBoxBase state={state} {...props} />
    const inputTriggerRef = useRef<any>()
    // FIXME:
    const focusInputTrigger = () => inputTriggerRef.current?.focus?.()

    if (isMobile)
      return (
        <>
          <button onClick={() => setFocus([0])}>{value || 'open'}</button>
          <Tray
            isOpen={isOpen}
            onOpen={focusInputTrigger}
            onClose={() => setFocus([])}
            content={{
              header: (
                <input
                  ref={inputTriggerRef}
                  value={inputValue}
                  onChange={handleInputChange}
                />
              ),
            }}
          >
            {listbox}
          </Tray>
        </>
      )

    return (
      <Popout
        isOpen={isOpen}
        onClose={() => setFocus([])}
        onOpen={focusInputTrigger}
        trigger={(props) => (
        content={{ isolateDialog: false }}
          <span>
            <input
              {...props}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
            <button
              onClick={() => {
                setFocus([0])
                props.ref.current?.focus?.()
              }}
            >
              ⬇
            </button>
          </span>
        )}
      >
        {listbox}
      </Popout>
    )
  },
)
