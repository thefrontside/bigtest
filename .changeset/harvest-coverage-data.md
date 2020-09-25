---
"@bigtest/agent": minor
---
If the application under test generates a `__coverage__` object, then
it will be harvested after each lane, and the aggregate coverage map
will be sent back to the orchestrator inside the `run:end` event.
