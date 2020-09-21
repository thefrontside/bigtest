import { describe, it } from 'mocha';
import * as expect from 'expect';

import { TestResult } from '@bigtest/suite';
import { resultSummary } from '../src/result-summary';

const RESULT: TestResult = {
  description: 'some test',
  status: 'pending',
  steps: [
    { description: 'step one', status: 'ok' },
    { description: 'step two', status: 'ok' },
  ],
  assertions: [
    { description: 'assertion one', status: 'ok' },
    { description: 'assertion two', status: 'failed' },
    { description: 'assertion three', status: 'failed' },
  ],
  children: [
    {
      description: 'another test',
      status: 'pending',
      steps: [
        { description: 'child step one', status: 'ok' },
        { description: 'child step two', status: 'failed' },
        { description: 'child step three', status: 'disregarded' },
        { description: 'child step four', status: 'disregarded' },
      ],
      assertions: [
        { description: 'child assertion one', status: 'disregarded' },
        { description: 'child assertion two', status: 'disregarded' },
        { description: 'child assertion three', status: 'disregarded' },
      ],
      children: []
    }
  ]
}

describe('result summary', () => {
  it('counts steps and assertions', async () => {
    let summary = resultSummary(RESULT);
    expect(summary.stepCounts.ok).toEqual(3)
    expect(summary.stepCounts.failed).toEqual(1)
    expect(summary.stepCounts.disregarded).toEqual(2)
    expect(summary.assertionCounts.ok).toEqual(1)
    expect(summary.assertionCounts.failed).toEqual(2)
    expect(summary.assertionCounts.disregarded).toEqual(3)
  });
});
