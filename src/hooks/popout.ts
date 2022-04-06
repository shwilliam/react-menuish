import { useState } from 'react'
import { usePopper } from 'react-popper'
import { Modifier, Placement } from '@popperjs/core'

export interface UsePopoutOptions {
  placement: Placement
  modifiers?: Partial<Modifier<unknown, object>>[]
}

export const usePopout = ({ placement, modifiers = [] }: UsePopoutOptions) => {
  const [anchorEl, setAnchorEl] = useState<any>()
  const [popoutEl, setPopoutEl] = useState<any>()
  const [arrowEl, setArrowEl] = useState<any>()
  const { styles, attributes } = usePopper(anchorEl, popoutEl, {
    placement,
    modifiers: [{ name: 'arrow', options: { element: arrowEl } }, ...modifiers],
  })

  return {
    popout: {
      ref: popoutEl,
      set: setPopoutEl,
      styles: styles.popper,
      attributes: attributes.popper,
    },
    anchor: {
      ref: anchorEl,
      set: setAnchorEl,
    },
    arrow: {
      ref: arrowEl,
      set: setArrowEl,
      styles: styles.arrow,
    },
  }
}
