import {
  siApacheairflow,
  siDocker,
  siFastapi,
  siHuggingface,
  siJavascript,
  siKubernetes,
  siLangchain,
  siMediapipe,
  siNumpy,
  siOnnx,
  siOpencv,
  siOpenjdk,
  siPandas,
  siPostgresql,
  siPython,
  siPytorch,
  siRedis,
  siScikitlearn,
  siTensorflow,
  siYolo,
} from 'simple-icons'

const skillIcons = {
  Python: siPython,
  Java: siOpenjdk,
  JavaScript: siJavascript,
  SQL: siPostgresql,
  PyTorch: siPytorch,
  'TensorFlow/Keras': siTensorflow,
  'Scikit-learn': siScikitlearn,
  YOLOv8: siYolo,
  OpenCV: siOpencv,
  MediaPipe: siMediapipe,
  'ONNX Runtime': siOnnx,
  NumPy: siNumpy,
  Pandas: siPandas,
  LangChain: siLangchain,
  'Hugging Face Transformers': siHuggingface,
  Docker: siDocker,
  'AKS/Kubernetes': siKubernetes,
  FastAPI: siFastapi,
  PostgreSQL: siPostgresql,
  Redis: siRedis,
  'Apache Airflow': siApacheairflow,
}

const fallbackLabels = {
  'Azure OpenAI': 'AO',
  'Prompt Engineering': 'PE',
  CosmosDB: 'CDB',
  dbt: 'DBT',
  'Azure Service Bus': 'ASB',
}

export function getSkillIcon(skill) {
  return skillIcons[skill] || null
}

export function getSkillFallbackLabel(skill) {
  return fallbackLabels[skill] || skill.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase()
}
