#!/usr/bin/env node
import semver from "semver"

const required = ">=22.0.0"
const current = process.version

if (!semver.satisfies(current, required)) {
  console.error(
    `\n❌ 当前 Node.js 版本 ${current} 不符合要求，Vite 7 需要 Node.js ${required}\n`
  )
  process.exit(1)
} else {
  console.log(`✅ Node.js 版本 ${current} 符合要求`)
}
