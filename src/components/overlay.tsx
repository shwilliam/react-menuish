import styled, { StyledComponentPropsWithRef } from 'styled-components'
import { animated } from 'react-spring'

export interface OverlayProps
  extends StyledComponentPropsWithRef<typeof animated.div> {}

export const Overlay = styled(animated.div)<OverlayProps>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 20%);
`
