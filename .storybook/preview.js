import { addDecorator } from '@storybook/react'
import { withContext } from './decorators/context'
import './global.css'

addDecorator(withContext)

export const parameters = {}
