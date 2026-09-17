import type { DefaultTheme } from 'vitepress'

// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/

// Versions older than 0.5 predate the Chart.js 3 rewrite and have no docs site.
const EXCLUDE = /^0\.[0-4]\./

const PACKAGE = 'chartjs-plugin-zoom'
const REPO = 'chartjs/chartjs-plugin-zoom'

interface Version {
  name: string
  tag: string | null
  parts: [number, number, number]
  prerelease: string | undefined
}

function parse(name: string, tag: string | null): Version | null {
  const matches = SEMVER.exec(name)
  if (!matches || EXCLUDE.test(name)) {
    return null
  }
  return {
    name,
    tag,
    parts: [Number(matches[1]), Number(matches[2]), Number(matches[3])],
    prerelease: matches[4],
  }
}

/** Newest first. A prerelease sorts below the release it leads to. */
function compare(v0: Version, v1: Version): number {
  for (let i = 0; i < 3; i++) {
    if (v0.parts[i] !== v1.parts[i]) {
      return v1.parts[i] - v0.parts[i]
    }
  }
  if (v0.prerelease === v1.prerelease) {
    return 0
  }
  if (v0.prerelease === undefined) {
    return -1
  }
  if (v1.prerelease === undefined) {
    return 1
  }
  return v1.prerelease.localeCompare(v0.prerelease)
}

/** Keeps the newest version of each group, e.g. 2.2 for 2.2.0 and 2.2.1. */
function collapse(versions: Version[], depth: 2 | 3): Version[] {
  const seen = new Set<string>()
  return versions.filter((version) => {
    const key = version.parts.slice(0, depth).join('.')
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * The npm registry does not allow CORS requests, so the published versions come
 * from jsDelivr -- the same source @simonbrunel/vuepress-plugin-versions used.
 * That plugin refreshed the list in the browser on every page load; here the
 * menu is baked in at build time instead, which is enough because the docs are
 * rebuilt and redeployed on every release.
 */
async function fetchVersions(): Promise<Version[]> {
  const url = `https://data.jsdelivr.com/v1/package/npm/${PACKAGE}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url} responded ${response.status}`)
  }

  const json = (await response.json()) as {
    versions: string[]
    tags: Record<string, string>
  }
  const tags = Object.entries(json.tags || {})

  return json.versions
    .map((name) => parse(name, tags.find(([, v]) => v === name)?.[0] ?? null))
    .filter((version): version is Version => version !== null)
    .sort(compare)
}

const suffix = (tag: string | null) => (tag ? ` (${tag})` : '')

/**
 * Builds the version menu shown in the navbar. `docsVersion` is what
 * scripts/docs-config.sh substituted into the config: master, latest, next or
 * an exact version.
 */
export async function versionsNav(
  docsVersion: string
): Promise<DefaultTheme.NavItem> {
  let versions: Version[] = []

  try {
    versions = await fetchVersions()
  } catch (error) {
    // A docs build must not depend on jsDelivr being reachable. Without the
    // list the menu still offers master and whatever version is being built.
    console.warn(`Could not list published versions: ${(error as Error).message}`)
  }

  const documentation: DefaultTheme.NavItemWithLink[] = [
    { text: 'Development (master)', link: '/chartjs-plugin-zoom/master/', target: '_self' },
    ...collapse(versions, 2).map((version) => ({
      text: version.name + suffix(version.tag),
      link: `/chartjs-plugin-zoom/${version.name}/`,
      target: '_self',
    })),
  ]

  const releaseNotes: DefaultTheme.NavItemWithLink[] = collapse(versions, 3)
    .slice(0, 5)
    .map((version) => ({
      text: version.name + suffix(version.tag),
      link: `https://github.com/${REPO}/releases/tag/v${version.name}`,
      target: '_blank',
    }))

  const items: DefaultTheme.NavItemChildren[] = [
    { text: 'Documentation', items: documentation },
  ]

  if (releaseNotes.length) {
    items.push({ text: 'Release notes (5 latest)', items: releaseNotes })
  }

  return {
    text:
      docsVersion === 'master'
        ? 'Development (master)'
        : versions.find((v) => v.tag === docsVersion)?.name ?? docsVersion,
    items,
  }
}
