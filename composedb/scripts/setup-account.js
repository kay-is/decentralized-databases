import { readFileSync, writeFileSync } from "fs"
import { execSync } from "child_process"

const composeDb = (...args) =>
  execSync("composedb " + args.join(" "), { encoding: "utf-8" }).trim()

const adminKey = composeDb("did:generate-private-key")
writeFileSync("admin-key", adminKey)

const adminDid = composeDb("did:from-private-key", adminKey)

const daemonConfig = JSON.parse(
  readFileSync("daemon.config.json", { encoding: "utf-8" })
)

daemonConfig["http-api"]["admin-dids"].push(adminDid)

writeFileSync("daemon.config.json", JSON.stringify(daemonConfig))
