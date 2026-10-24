import { createContext } from 'react'

export const AdminUIContext = createContext({
  toast: { success: () => {}, error: () => {}, info: () => {} },
  confirm: async () => false,
})
