import {
  createContext,
  MutableRefObject,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { useEventListener } from '../hooks/event-listener'
import { useId } from '../hooks/id'

type OnInteractBoundaryClose = null | undefined | (() => void)

interface ChildInteractBoundary {
  id: string
  onClose: OnInteractBoundaryClose
}

interface InteractBoundaryContext {
  boundary: MutableRefObject<ChildInteractBoundary | null>
}
const interactBoundaryContext = createContext<InteractBoundaryContext>({
  boundary: { current: null },
})
export const useInteractBoundaryContext = () =>
  useContext(interactBoundaryContext)

interface InteractBoundaryContextProviderProps {
  id?: string
  el?: Element
  onClose?: () => void
  closeOnEscape?: boolean
  children: ReactNode
}

export const InteractBoundary = ({
  id,
  el = document.body,
  onClose,
  closeOnEscape = false,
  children,
}: InteractBoundaryContextProviderProps) => {
  const innerId = useId(id)
  const parentCtxt = useInteractBoundaryContext()
  const childBoundary = useRef<ChildInteractBoundary | null>(null)
  const closeThisBoundary = () => {
    onClose?.()
    parentCtxt.boundary.current = null
  }
  const closeChildBoundary = () => {
    childBoundary.current?.onClose?.()
    childBoundary.current = null
  }

  useEffect(() => {
    // parentCtxt.onClose.current?.()
    parentCtxt.boundary.current = { id: innerId, onClose }
  }, [innerId, onClose, parentCtxt.boundary])

  useEffect(() => {
    return () => {
      if (
        parentCtxt.boundary.current &&
        parentCtxt.boundary.current.id === innerId
      )
        parentCtxt.boundary.current = null
    }
  }, [])

  useEventListener(
    'keyup',
    (e) => {
      const event = e as KeyboardEvent
      if (closeOnEscape && event.key === 'Escape') {
        closeThisBoundary()
        e.stopPropagation()
      }
    },
    el,
  )

  useEventListener(
    'pointerdown',
    (e) => {
      closeChildBoundary()
      e.stopPropagation()
    },
    el,
  )

  return (
    <interactBoundaryContext.Provider value={{ boundary: childBoundary }}>
      {children}
    </interactBoundaryContext.Provider>
  )
}
