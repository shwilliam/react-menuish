import { addDecorator } from '@storybook/react'
import { withContext } from './decorators/context'
import { withLoremWrapper } from './decorators/lorem'
import './global.css'

addDecorator(withContext)
addDecorator(withLoremWrapper)

export const parameters = {}
