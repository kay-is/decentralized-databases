import { execSync } from "child_process"
import { readFileSync } from "fs"
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

const profileComposite = await createComposite(
  ceramic,
  "schema/profile.graphql"
)

const articleSchema = readFileSync("schema/article.graphql", {
  encoding: "utf-8",
}).replace("$PROFILE_ID", profileComposite.modelIDs[0])

const articleComposite = await Composite.create({
  ceramic,
  schema: articleSchema,
})

const commentSchema = readFileSync("schema/comment.graphql", {
  encoding: "utf-8",
}).replace("$ARTICLE_ID", articleComposite.modelIDs[1])

const commentComposite = await Composite.create({
  ceramic,
  schema: commentSchema,
})

const articleCommentSchema = readFileSync("schema/article.comment.graphql", {
  encoding: "utf-8",
})
  .replace("$ARTICLE_ID", articleComposite.modelIDs[1])
  .replace("$COMMENT_ID", commentComposite.modelIDs[1])

const articleCommentComposite = await Composite.create({
  ceramic,
  schema: articleCommentSchema,
})

const composite = Composite.from([
  profileComposite,
  articleComposite,
  commentComposite,
  articleCommentComposite,
])

await writeEncodedComposite(composite, "composites/blog.json")
await composite.startIndexingOn(ceramic)

execSync(
  "composedb composite:compile composites/blog.json composites/blog.runtime.json --ceramic-url=http://0.0.0.0:7007"
)
execSync(
  "composedb composite:compile composites/blog.json composites/blog.runtime.js --ceramic-url=http://0.0.0.0:7007"
)
