import { addDecorator } from '@storybook/react'
import { withContext } from './decorators/context'

addDecorator(withContext)

export const parameters = {}
