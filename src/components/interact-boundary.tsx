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
  children: ReactNode
}

export const InteractBoundary = ({
  id,
  el = document.body,
  onClose,
  children,
}: InteractBoundaryContextProviderProps) => {
  const innerId = useId(id)
  const parentCtxt = useInteractBoundaryContext()
  const childBoundary = useRef<ChildInteractBoundary | null>(null)

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
    'pointerup',
    (e) => {
      childBoundary.current?.onClose?.()
      childBoundary.current = null
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
