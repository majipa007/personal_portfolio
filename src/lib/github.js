const GITHUB_API_URL = 'https://api.github.com/users/majipa007/repos?sort=updated&per_page=100'

export const fallbackRepos = [
  {
    id: 'fallback-1',
    name: 'Quantization-YOLOv8',
    html_url: 'https://github.com/majipa007/Quantization-YOLOv8',
    description:
      'Static quantization of YOLOv8 for edge deployment. 22% faster inference, 72% smaller model (12.8MB → 3.6MB), CPU-only.',
    stargazers_count: 26,
    forks_count: 12,
    language: 'Jupyter Notebook',
    topics: ['onnx', 'yolov8', 'quantization', 'edge-ai'],
    updated_at: '2025-03-01T00:00:00Z',
  },
  {
    id: 'fallback-2',
    name: 'fall_detection',
    html_url: 'https://github.com/majipa007/fall_detection',
    description: 'Real-time fall detection using pose estimation and computer vision.',
    stargazers_count: 3,
    forks_count: 0,
    language: 'Python',
    topics: ['computer-vision', 'pose-estimation', 'realtime'],
    updated_at: '2025-02-15T00:00:00Z',
  },
  {
    id: 'fallback-3',
    name: 'mindscape',
    html_url: 'https://github.com/majipa007/mindscape',
    description:
      'Mental health platform with LLM-powered psychiatrist chatbot (Aimee), guided meditation, breathing exercises, and appointment scheduling.',
    stargazers_count: 1,
    forks_count: 1,
    language: 'Python',
    topics: ['llm', 'mental-health', 'chatbot'],
    updated_at: '2025-01-29T00:00:00Z',
  },
  {
    id: 'fallback-4',
    name: 'NaturalQuery-Executor-Using-Phi-3',
    html_url: 'https://github.com/majipa007/NaturalQuery-Executor-Using-Phi-3',
    description: 'Natural language to SQL using Phi-3 for non-technical database access.',
    stargazers_count: 1,
    forks_count: 1,
    language: 'Jupyter Notebook',
    topics: ['phi-3', 'text-to-sql', 'nlp'],
    updated_at: '2025-01-24T00:00:00Z',
  },
  {
    id: 'fallback-5',
    name: 'RetailMetrics-Modern-Data-Stack',
    html_url: 'https://github.com/majipa007/RetailMetrics-Modern-Data-Stack',
    description:
      'Full-stack retail analytics with Airflow, dbt, PostgreSQL, and real-time dashboards.',
    stargazers_count: 1,
    forks_count: 0,
    language: 'Python',
    topics: ['airflow', 'dbt', 'analytics-engineering'],
    updated_at: '2025-01-14T00:00:00Z',
  },
  {
    id: 'fallback-6',
    name: 'Automated-Surveillance-System',
    html_url: 'https://github.com/majipa007/Automated-Surveillance-System',
    description: 'CV-based automated surveillance with real-time detection and alerting.',
    stargazers_count: 0,
    forks_count: 0,
    language: 'Python',
    topics: ['opencv', 'surveillance', 'detection'],
    updated_at: '2025-01-09T00:00:00Z',
  },
]

const sortRepos = (repos) =>
  [...repos]
    .sort((a, b) => {
      if ((b.stargazers_count ?? 0) !== (a.stargazers_count ?? 0)) {
        return (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0)
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
    .slice(0, 6)

export const normalizeRepos = (repos) =>
  repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    html_url: repo.html_url,
    description: repo.description || 'No description provided.',
    stargazers_count: repo.stargazers_count ?? 0,
    forks_count: repo.forks_count ?? 0,
    language: repo.language || 'Unknown',
    topics: repo.topics || [],
    updated_at: repo.updated_at,
  }))

export async function fetchPortfolioRepos(url = GITHUB_API_URL) {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
    })

    if (!response.ok) {
      throw new Error(`GitHub API failed with status ${response.status}`)
    }

    const data = await response.json()
    const sorted = sortRepos(normalizeRepos(data))

    if (!sorted.length) {
      throw new Error('GitHub API returned no repositories.')
    }

    return {
      repos: sorted,
      source: 'api',
    }
  } catch {
    return {
      repos: sortRepos(fallbackRepos),
      source: 'fallback',
    }
  }
}
