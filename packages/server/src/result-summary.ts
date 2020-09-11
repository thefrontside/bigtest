import { TestResult } from '@bigtest/suite'

export type Counts = { ok: number; failed: number; disregarded: number };

interface Summary {
  assertionCounts: Counts;
  stepCounts: Counts;
}

function addCounts(a: Counts, b: Counts): Counts {
  return { ok: a.ok + b.ok, failed: a.failed + b.failed, disregarded: a.disregarded + b.disregarded };
}

function addSummaries(a: Summary, b: Summary): Summary {
  return {
    stepCounts: addCounts(a.stepCounts, b.stepCounts),
    assertionCounts: addCounts(a.assertionCounts, b.assertionCounts),
  }
}

export function resultSummary(testResult: TestResult): Summary {
  let own: Summary = {
    stepCounts: {
      ok: testResult.steps.filter((s) => s.status === 'ok').length,
      failed: testResult.steps.filter((s) => s.status === 'failed').length,
      disregarded: testResult.steps.filter((s) => s.status === 'disregarded').length,
    },
    assertionCounts: {
      ok: testResult.assertions.filter((s) => s.status === 'ok').length,
      failed: testResult.assertions.filter((s) => s.status === 'failed').length,
      disregarded: testResult.assertions.filter((s) => s.status === 'disregarded').length,
    }
  }

  return testResult.children.map((c) => resultSummary(c)).reduce(addSummaries, own);
}
