import _ from 'lodash'

const MOBILE_SCREEN_WIDTH = 700

export const useIsMobile = () => {
  if (_.isUndefined(typeof window)) return false
  return window.screen.width <= MOBILE_SCREEN_WIDTH
}
