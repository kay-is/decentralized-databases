import Head from "next/head"
import { init, loadProfile } from "@/utils/database"

export default function Home() {
  function initDatabase() {
    init()
    loadProfile()
  }

  return (
    <>
      <Head>
        <title>ComposeDB Blog</title>
      </Head>
      <h1>ComposeDB Blog</h1>
      <button onClick={initDatabase}>Init Database</button>
    </>
  )
}
