import { DatabaseContext } from "@/utils/database.context"
import { definition } from "@/../composites/blog.runtime"
import { DatabaseClient } from "@/utils/database"

const databaseClient = new DatabaseClient(definition)

databaseClient.restoreSession()

export default function App({ Component, pageProps }) {
  return (
    <DatabaseContext.Provider value={databaseClient}>
      <Component {...pageProps} />
    </DatabaseContext.Provider>
  )
}
