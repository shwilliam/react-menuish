import React from 'react'
import { Lorem } from '../../src/components/lorem'

export const withLoremWrapper = (Story) => {
  return (
    <>
      <Lorem paragraphs={5} />
      <Story />
      <Lorem paragraphs={10} />
    </>
  )
}
