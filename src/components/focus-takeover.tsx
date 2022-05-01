import {
  useRef,
  useContext,
  useEffect,
  useMemo,
  createContext,
  ReactNode,
} from 'react'
import _ from 'lodash'
import { useId } from '../hooks/id'
import { useSyncedRef } from '../hooks/synced-ref'

export interface FocusTakeoverContext {
  getIsTopmost: (id: string) => boolean
  getIsDeactivated: (id: string) => boolean
  takeFocus: (id: string, parent?: string, cb?: () => void) => void
  restoreFocus: (id: string, parent?: string) => void
}

const focusTakeoverContext = createContext<FocusTakeoverContext>({
  getIsTopmost: () => false,
  getIsDeactivated: () => false,
  takeFocus: () => {},
  restoreFocus: () => {},
})

export const FocusTakeoverContextProvider = ({ children }) => {
  const focusBoundaries = useRef<
      { parent?: string; boundary: string; cb?: () => void }[]
    >([]),
    ctxt = useMemo(
      () => ({
        getIsTopmost: (id: string) =>
          _.last(focusBoundaries.current) &&
          _.last(focusBoundaries.current).boundary === id,
        getIsDeactivated: (id: string) =>
          !focusBoundaries.current.length ||
          !focusBoundaries.current.some((b) => b.boundary === id),
        takeFocus: (id: string, parentId?: string, cb?: () => void) => {
          const existingParentBoundariesIdx = focusBoundaries.current.findIndex(
            (b) => b.parent === parentId,
          )
          if (existingParentBoundariesIdx > -1) {
            focusBoundaries.current[existingParentBoundariesIdx].cb?.()
            focusBoundaries.current[existingParentBoundariesIdx] = {
              parent: parentId,
              boundary: id,
              cb,
            }
          } else
            focusBoundaries.current = [
              ...focusBoundaries.current,
              { parent: parentId, boundary: id, cb },
            ]

          console.log(focusBoundaries.current)
        },
        restoreFocus: (id: string, parentId?: string) => {
          const existingParentBoundariesIdx = focusBoundaries.current.findIndex(
            (b) => b.parent === parentId && b.boundary === id,
          )
          if (existingParentBoundariesIdx > -1) {
            focusBoundaries.current = focusBoundaries.current.slice(
              0,
              existingParentBoundariesIdx,
            )
          }

          console.log(focusBoundaries.current)
        },
      }),
      [focusBoundaries],
    )

  return (
    <focusTakeoverContext.Provider value={ctxt}>
      {children}
    </focusTakeoverContext.Provider>
  )
}

interface FocusTakeoverBoundaryProps {
  id?: string
  parentId?: string
  isDisabled?: boolean
  onClose?: () => void
  onActivate?: () => void
  onRestore?: () => void
  children: ReactNode
}

export const FocusTakeoverBoundary = ({
  id,
  parentId,
  isDisabled = false,
  onClose,
  onActivate,
  onRestore,
  children,
}: FocusTakeoverBoundaryProps) => {
  const innerId = useId(id),
    { takeFocus, restoreFocus } = useFocusTakeoverContext()

  const onCloseRef = useSyncedRef(onClose)
  const onActivateRef = useSyncedRef(onActivate)
  const onRestoreRef = useSyncedRef(onRestore)
  useEffect(() => {
    if (isDisabled) return
    takeFocus(innerId, parentId, onCloseRef.current)
    onActivateRef.current?.()
    return () => {
      restoreFocus(innerId, parentId)
      onRestoreRef.current?.()
    }
  }, [takeFocus, restoreFocus, innerId, parentId, isDisabled])

  return <>{children}</>
}

export const useFocusTakeoverContext = () => useContext(focusTakeoverContext)
