import { fetchPortfolioRepos } from '../src/lib/github.js'

async function run() {
  const successResult = await fetchPortfolioRepos()
  if (!Array.isArray(successResult.repos) || successResult.repos.length !== 6) {
    throw new Error('Expected 6 repos from API/fallback flow.')
  }

  const fallbackResult = await fetchPortfolioRepos('https://api.github.com/users/majipa007/this-will-fail')
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
