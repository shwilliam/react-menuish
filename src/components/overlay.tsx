import styled from 'styled-components'
import { animated } from 'react-spring'

export const Overlay = styled(animated.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5px solid blue;
`
