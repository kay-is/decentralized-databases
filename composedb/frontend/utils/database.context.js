import { createContext, useContext } from "react"

export const DatabaseContext = createContext()
export const useDatabaseClient = () => useContext(DatabaseContext)
