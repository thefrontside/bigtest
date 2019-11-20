import { createOrchestrator } from '../src/orchestrator';

export default createOrchestrator({
  appPort: 24100,
  proxyPort: 24101,
  commandPort: 24102,
  connectionPort: 24103,
  agentPort: 24104,
})
