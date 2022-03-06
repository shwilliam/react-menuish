import React from 'react'
import { FocusTakeoverContextProvider } from '../../src/components/focus-takeover'
import { useSafeViewportHeightVar } from '../../src/hooks/viewport-size'

export const withContext = (Story) => {
  const safeViewportHeightVar = useSafeViewportHeightVar()
  return (
    <div style={safeViewportHeightVar}>
      <FocusTakeoverContextProvider>
        <Story />
      </FocusTakeoverContextProvider>
    </div>
  )
}
