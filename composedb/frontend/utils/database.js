import { ComposeClient } from "@composedb/client"
import { definition } from "../../composites/blog.runtime"
import { DIDSession } from "did-session"
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum"

let compose
let session

const login = async () => {
  const ethProvider = window.ethereum
  const addresses = await ethProvider.request({
    method: "eth_requestAccounts",
  })
  const accountId = await getAccountId(ethProvider, addresses[0])
  const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)

  const session = await DIDSession.authorize(authMethod, {
    resources: compose.resources,
  })

  localStorage.setItem("didsession", session.serialize())

  return session
}

export const logout = () => {
  compose = null
  session = null
  localStorage.removeItem("didsession")
  console.log("Logged out!")
}

export const loadSession = async () => {
  console.log("Checking active session...")
  if (session && !session.isExpired) return console.log("Active session found!")

  console.log("No active session found! Loading from localstorage...")

  const sessionStr = localStorage.getItem("didsession")

  if (sessionStr) {
    session = await DIDSession.fromSession(sessionStr)
    console.log("Session loaded!")
  }

  compose = new ComposeClient({
    ceramic:
      "https://kay-is-curly-space-spork-rx94w5xqrq254pw-7007.preview.app.github.dev/",
    definition,
  })

  if (!session || (session.hasSession && session.isExpired)) {
    console.log("Session not found or expired! Starting login...")
    session = await login()
  }

  compose.setDID(session.did)
  console.log("Session active!", session)

  return compose
}

export async function loadProfile() {
  const compose = await loadSession()

  const result = await compose.executeQuery(`
  {
    viewer {
      id
      profile { id name bio image }
    }
  }
  `)

  return result.data
}

export async function createProfile({ name, bio, image }) {
  const compose = await loadSession()

  const result = await compose.executeQuery(
    `
    mutation CreateNewProfile($i: CreateProfileInput!) {
      createProfile(input: $i) {
        document { id name bio image }
      }
    }
  `,
    { i: { content: { name, bio, image } } }
  )

  return result.data
}
