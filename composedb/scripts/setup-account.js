import { mkdirSync, readFileSync, writeFileSync } from "fs"
import { execSync } from "child_process"

const composeDb = (...args) =>
  execSync("composedb " + args.join(" "), { encoding: "utf-8" }).trim()

mkdirSync("account")
const adminKey = composeDb("did:generate-private-key")
writeFileSync("account/admin-key", adminKey)

const adminDid = composeDb("did:from-private-key", adminKey)
writeFileSync("account/admin-did", adminDid)

const daemonConfig = JSON.parse(
  readFileSync("config/daemon.config.json", { encoding: "utf-8" })
)

daemonConfig["http-api"]["admin-dids"].push(adminDid)

writeFileSync("config/daemon.config.json", JSON.stringify(daemonConfig))
