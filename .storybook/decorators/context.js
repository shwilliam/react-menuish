import React from 'react'
import { FocusTakeoverContextProvider } from '../../src/components/focus-takeover'
import { useSafeViewportHeightVar } from '../../src/hooks/viewport-size'

export const withContext = (Story) => {
  useSafeViewportHeightVar()

  return (
    <FocusTakeoverContextProvider>
      <Story />
    </FocusTakeoverContextProvider>
  )
}
