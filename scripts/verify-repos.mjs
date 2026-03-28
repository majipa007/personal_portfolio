import { fetchPortfolioRepos } from '../src/lib/github.js'
import portfolioConfig from '../src/config/portfolio.json' with { type: 'json' }

async function run() {
  const { projects } = portfolioConfig

  const successResult = await fetchPortfolioRepos({
    url: projects.apiUrl,
    fallbackRepos: projects.fallbackRepos,
    limit: projects.limit,
    emptyDescription: projects.emptyDescription,
  })

  if (!Array.isArray(successResult.repos) || successResult.repos.length !== projects.limit) {
    throw new Error(`Expected ${projects.limit} repos from API/fallback flow.`)
  }

  const fallbackResult = await fetchPortfolioRepos({
    url: 'https://api.github.com/users/majipa007/this-will-fail',
    fallbackRepos: projects.fallbackRepos,
    limit: projects.limit,
    emptyDescription: projects.emptyDescription,
  })

  if (fallbackResult.source !== 'fallback') {
    throw new Error('Expected fallback path to trigger on failing URL.')
  }

  console.log('Repo fetch test (normal):', successResult.source, successResult.repos.length)
  console.log('Repo fetch test (forced error):', fallbackResult.source, fallbackResult.repos.length)
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
