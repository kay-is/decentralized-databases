import Head from "next/head"
import {
  loadSession,
  createProfile,
  loadProfile,
  logout,
} from "@/utils/database"

export default function Home() {
  function loginToDb() {
    loadSession()
  }

  function logoutFromDb() {
    logout()
  }

  function create() {
    createProfile({ name: "Kay", bio: "I am a technical writer!" })
  }

  function load() {
    loadProfile()
  }

  return (
    <>
      <Head>
        <title>ComposeDB Blog</title>
      </Head>
      <h1>ComposeDB Blog</h1>
      <button onClick={loginToDb}>login</button>
      <button onClick={logoutFromDb}>logout</button>
      <hr></hr>
      <button onClick={create}>create</button>
      <button onClick={load}>load</button>
    </>
  )
}
