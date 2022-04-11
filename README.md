# react-menuish

`react-menuish` aims to provide customizable primitives with sensible defaults
to build declarative and accessible menu-type components with react. this
library also exposes several other components and utilities, useful in other
contexts.

## menuish components

- action menu
- dropdown menu/picker
- TODO: combobox

## others

- tray
- modal
- popover
- TODO: tooltip
- popout
- dialog
- TODO: visually hidden
- portal
- TODO: announcer

## todo

- [ ] standardize DialogVariantProps
- [ ] basic styling
- [ ] better prop forwarding
- [ ] aria attrs
- [ ] try focus next menu item after sticky (if `noVirtualFocus`)
- [ ] create alert helpers (announcer)

## limitations/todo

- parent menu items are not expected to change as a child menu is open
- focusable listbox items except at least 1 focusable child after it
- comboboxes cannot have focusable children
- these components do not handle filtering

- builtin rtl support
- select example
- context menu

- [ ] select
- [ ] multi-select (checkbox menu)
- [ ] action menu
- [ ] combobox
- [ ] filterable dropdown
- [ ] popout
- [ ] menu popout
- [ ] context menu
