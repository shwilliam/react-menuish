import { useRef, useEffect } from 'react'

export const useEventListener = (
  eventName: string,
  handler: EventListener,
  element: Element = document.body,
) => {
  const savedHandler = useRef<EventListener>()

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    if (!element || !element.addEventListener || !savedHandler.current) return

    const eventListener: EventListener = (event) =>
      savedHandler.current?.(event)
    element.addEventListener(eventName, eventListener)
    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}
