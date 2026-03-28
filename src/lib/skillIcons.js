import {
  siDocker,
  siFastapi,
  siGo,
  siHuggingface,
  siLangchain,
  siMediapipe,
  siNumpy,
  siOllama,
  siOnnx,
  siOpencv,
  siPandas,
  siPostgresql,
  siPython,
  siRedis,
  siYolo,
} from 'simple-icons'

const skillIcons = {
  Python: siPython,
  Go: siGo,
  SQL: siPostgresql,
  YOLOv8: siYolo,
  OpenCV: siOpencv,
  MediaPipe: siMediapipe,
  'ONNX Runtime': siOnnx,
  NumPy: siNumpy,
  Pandas: siPandas,
  LangChain: siLangchain,
  'Hugging Face Transformers': siHuggingface,
  Ollama: siOllama,
  Docker: siDocker,
  FastAPI: siFastapi,
  PostgreSQL: siPostgresql,
  Redis: siRedis,
}

const fallbackLabels = {
  'Azure OpenAI': 'AO',
  'Microsoft Foundry': 'MF',
  vLLM: 'vLLM',
  'Prompt Engineering': 'PE',
  CosmosDB: 'CDB',
  'Azure Service Bus': 'ASB',
  'Azure Deployment Services': 'ADS',
}

export function getSkillIcon(skill) {
  return skillIcons[skill] || null
}

export function getSkillFallbackLabel(skill) {
  return fallbackLabels[skill] || skill.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase()
}
