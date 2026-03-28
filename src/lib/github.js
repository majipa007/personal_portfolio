const sortRepos = (repos, limit = 6) =>
  [...repos]
    .sort((a, b) => {
      if ((b.stargazers_count ?? 0) !== (a.stargazers_count ?? 0)) {
        return (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0)
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
    .slice(0, limit)

export const normalizeRepos = (repos, emptyDescription = 'No description provided.') =>
  repos.map((repo, index) => ({
    id: repo.id ?? `repo-${index}`,
    name: repo.name,
    html_url: repo.html_url,
    description: repo.description || emptyDescription,
    stargazers_count: repo.stargazers_count ?? 0,
    forks_count: repo.forks_count ?? 0,
    language: repo.language || 'Unknown',
    topics: repo.topics || [],
    updated_at: repo.updated_at,
  }))

export async function fetchPortfolioRepos(options = {}) {
  const {
    url,
    fallbackRepos = [],
    limit = 6,
    emptyDescription = 'No description provided.',
  } = options

  try {
    if (!url) {
      throw new Error('GitHub API url is not configured.')
    }

    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
    })

    if (!response.ok) {
      throw new Error(`GitHub API failed with status ${response.status}`)
    }

    const data = await response.json()
    const sorted = sortRepos(normalizeRepos(data, emptyDescription), limit)

    if (!sorted.length) {
      throw new Error('GitHub API returned no repositories.')
    }

    return {
      repos: sorted,
      source: 'api',
    }
  } catch {
    return {
      repos: sortRepos(normalizeRepos(fallbackRepos, emptyDescription), limit),
      source: 'fallback',
    }
  }
}
