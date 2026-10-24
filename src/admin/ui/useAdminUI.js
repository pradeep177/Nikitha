import { useContext } from 'react'
import { AdminUIContext } from './adminUiContext'

/** toast.success('Saved'), toast.error('Oops') */
export function useToast() {
  return useContext(AdminUIContext).toast
}

/** const ok = await confirm({ title, message, confirmLabel, danger }) */
export function useConfirm() {
  return useContext(AdminUIContext).confirm
}
