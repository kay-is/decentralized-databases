import { execSync } from "child_process"
import { readFileSync, readdirSync } from "fs"
import { CeramicClient } from "@ceramicnetwork/http-client"
import { DID } from "dids"
import { Ed25519Provider } from "key-did-provider-ed25519"
import { getResolver } from "key-did-resolver"
import { fromString } from "uint8arrays/from-string"
import { Composite } from "@composedb/devtools"
import {
  createComposite,
  writeEncodedComposite,
} from "@composedb/devtools-node"

const privateKey = fromString(
  readFileSync("admin-key", { encoding: "utf-8" }).trim(),
  "base16"
)

const did = new DID({
  resolver: getResolver(),
  provider: new Ed25519Provider(privateKey),
})
await did.authenticate()

const ceramic = new CeramicClient("http://127.0.0.1:7007")
ceramic.did = did

const composites = await Promise.all(
  readdirSync("schema").map((f) => createComposite(ceramic, `schema/${f}`))
)

const composite = Composite.from(composites)

await writeEncodedComposite(composite, "composites/blog.json")
await composite.startIndexingOn(ceramic)

execSync(
  "composedb composite:compile composites/blog.json composites/blog.runtime.json --ceramic-url=http://0.0.0.0:7007"
)
execSync(
  "composedb composite:compile composites/blog.json composites/blog.runtime.js --ceramic-url=http://0.0.0.0:7007"
)
