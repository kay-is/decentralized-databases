import { ComposeClient } from "@composedb/client"
import { definition } from "../../composites/blog.runtime"
import { DIDSession } from "did-session"
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum"
import { ethers } from "ethers"

let compose

export function init() {
  compose = new ComposeClient({
    ceramic: `https://kay-is-curly-space-spork-rx94w5xqrq254pw-7007.preview.app.github.dev/`,
    definition,
  })
  console.log(compose)
}

export async function login() {
  const ethProvider = ethers.getDefaultProvider()
  const addresses = await ethProvider.request({ method: "eth_requestAccounts" })
  const accountId = await getAccountId(ethProvider, addresses[0])
  const authMethod = await EthereumWebAuth.getAuthMethod(ethprovider, accountId)

  const { did } = await DIDSession.authorize(authMethod, {
    resources: compose.resources,
  })
  compose.setDID(did)
}

export async function loadProfile() {
  const result = await compose.executeQuery(`
  {
    viewer {
      id
      profile {
        id
        name
        bio
        image
      }
    }
  }
  `)

  console.log(result)

  return result
}
