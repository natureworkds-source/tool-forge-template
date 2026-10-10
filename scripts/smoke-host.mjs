#!/usr/bin/env node
/**
 * Host 连调冒烟：确认示例工具已安装、桥可用，并对 sample.run 走 external dispatch。
 * 需要本机已打开「天工智钥」桌面窗口（127.0.0.1:17321）。
 */
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const API = 'http://127.0.0.1:17321'
const PAGE_ORIGIN = 'http://localhost:1420'
const APP_DATA =
  process.env.TOOLFORGE_APP_DATA ||
  join(homedir(), 'Library/Application Support/cn.natureworkds.toolforge')

function fail(msg) {
  console.error(`FAIL: ${msg}`)
  process.exit(1)
}

function readToolId() {
  const manPath = join(process.cwd(), 'tool/manifest.json')
  if (!existsSync(manPath)) fail(`缺少 ${manPath}`)
  const man = JSON.parse(readFileSync(manPath, 'utf8'))
  if (typeof man.id !== 'string' || !man.id.trim()) fail('manifest.id 无效')
  return man.id.trim()
}

async function bootstrap() {
  const res = await fetch(`${API}/api/bootstrap`, {
    headers: { Accept: 'application/json', Origin: PAGE_ORIGIN },
  })
  if (!res.ok) throw new Error(`bootstrap -> ${res.status}`)
  const body = await res.json()
  if (typeof body.bridgeToken !== 'string' || !body.bridgeToken.trim()) {
    throw new Error('bootstrap 无 bridgeToken')
  }
  return body.bridgeToken.trim()
}

async function get(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      Origin: PAGE_ORIGIN,
    },
  })
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  return res.json()
}

async function post(path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
      Origin: PAGE_ORIGIN,
    },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  return { status: res.status, json }
}

async function main() {
  const toolId = readToolId()
  const toolDir = join(APP_DATA, 'tools', toolId)
  if (!existsSync(join(toolDir, 'manifest.json'))) {
    fail(`工具未安装: ${toolDir}（先跑 pnpm install:host）`)
  }
  const man = JSON.parse(readFileSync(join(toolDir, 'manifest.json'), 'utf8'))
  if (man.id !== toolId) fail(`manifest.id=${man.id}，期望 ${toolId}`)
  console.log('ok: installed', toolDir)

  let token
  try {
    token = await bootstrap()
  } catch (e) {
    fail(`桥不可达（请先打开天工智钥桌面窗口）: ${e.message}`)
  }
  console.log('ok: bootstrap token')

  let health
  try {
    health = await get('/api/tools', token)
  } catch (e) {
    fail(`catalog 失败: ${e.message}`)
  }
  const tools = health.tools || health || []
  const listed = Array.isArray(tools) ? tools : tools.tools
  const hit = (listed || []).find((t) => t.id === toolId)
  if (!hit) {
    console.warn(`warn: catalog 未列出 ${toolId}，仍尝试 invoke（刷新目录或重启壳层）`)
  } else {
    console.log('ok: catalog lists', toolId, 'origin=', hit.origin)
  }

  const sample = {
    toolId,
    actionId: 'sample.run',
    presentation: 'background',
    input: {},
  }

  const first = await post('/api/invoke', sample, token)
  console.log('invoke sample.run:', first.status, JSON.stringify(first.json).slice(0, 400))

  if (first.json?.confirm) {
    const confirmToken = first.json.confirm.confirmToken
    if (!confirmToken) fail('confirm 无 confirmToken')
    const second = await post(
      '/api/invoke',
      { ...sample, confirm: 'allow', confirmToken },
      token,
    )
    console.log('confirm allow:', second.status, JSON.stringify(second.json).slice(0, 500))
    if (second.json?.dispatch === 'external') {
      console.log('ok: external dispatch issued；打开工具 UI 后由壳层投递 invoke，工具须回 result')
      process.exit(0)
    }
    if (second.json?.ok === false) fail(second.json.error || 'invoke failed after confirm')
  } else if (first.json?.dispatch === 'external') {
    console.log('ok: external dispatch (no confirm gate)')
    process.exit(0)
  } else if (first.json?.ok === false) {
    fail(first.json.error || 'invoke failed')
  }

  console.log('ok: smoke invoke path exercised')
}

main().catch((e) => {
  fail(e.stack || e.message)
})
