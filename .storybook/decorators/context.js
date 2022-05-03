import React from 'react'
import { InteractBoundary } from '../../src/components/interact-boundary'
import { useSafeViewportHeightVar } from '../../src/hooks/viewport-size'

export const withContext = (Story) => {
  useSafeViewportHeightVar()

  return (
    <InteractBoundary>
      <Story />
    </InteractBoundary>
  )
}
