import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  ChangeEventHandler,
  useEffect,
  useRef,
  KeyboardEventHandler,
} from 'react'
import { ChangeHandler, ListBoxBase, useListBoxState } from './listbox'
import { useIsMobile } from '../hooks/is-mobile'
import { useId } from '../hooks/id'
import { PopoutVariant, TrayVariant } from './dialog-variant'

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
    const { state } = useListBoxState({
      onChange,
      focusResetTrigger: inputValue,
    })
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
      if (isMobile) onInputChange?.('')
      else if (value) onInputChange?.((value && String(value)) || '')
      close()
    }

    const isOpen = !!focus.length
    const isMobile = useIsMobile()

    useEffect(() => {
      if (isMobile) onInputChange?.('')
      else onInputChange?.((value && String(value)) || '')
    }, [value, onInputChange, isMobile])

    const listBoxId = useId()
    const listbox = <ListBoxBase id={listBoxId} state={state} {...props} />
    const inputRef = useRef<any>()
    const focusInputTrigger = () => inputRef.current?.focus?.()

    if (isMobile)
      return (
        <TrayVariant
          trigger={({ ref }) => (
            <button ref={ref} onClick={() => setFocus([0])}>
              {value || 'open'}
            </button>
          )}
          dialog={{
            isOpen,
            onClose: () => setFocus([]),
            onOpen: focusInputTrigger,
          }}
          header={
            <input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              type="search"
              aria-controls={listBoxId}
            />
          }
        >
          {listbox}
        </TrayVariant>
      )

    return (
      <PopoutVariant
        trigger={({ ref, open }) => (
          <span ref={ref}>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={listBoxId}
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
            />
            <button
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              onClick={() => {
                setFocus([0])
                inputRef.current?.focus?.()
              }}
            >
              ⬇
            </button>
          </span>
        )}
        dialog={{
          isOpen,
          onClose: () => setFocus([]),
          isolateDialog: false,
          placement: 'bottom',
        }}
        width="trigger"
      >
        {listbox}
      </PopoutVariant>
    )
  },
)
