import { describe, it } from 'mocha';
import expect from 'expect'

import { test, validateTest } from '../src/index';

// eslint-disable-next-line @typescript-eslint/no-empty-function
let noop = async () => {};

describe('validateTest', () => {
  it('returns true for a valid test', async () => {
    let example = test('foo');

    expect(validateTest(example)).toEqual(true);
  });

  it('returns true for a valid test with steps, assertions and children', async () => {
    let example =
      test('foo')
        .step('step one', noop)
        .step('step two', noop)
        .assertion('assertion one', noop)
        .assertion('assertion two', noop)
        .child('child one', test => test
          .step('child step one', noop)
          .step('child step two', noop)
          .assertion('child assertion one', noop)
          .assertion('child assertion two', noop)
        )
        .child('child two', test => test
          .step('child step one', noop)
          .step('child step two', noop)
          .assertion('child assertion one', noop)
          .assertion('child assertion two', noop)
        )

    expect(validateTest(example)).toEqual(true);
  });

  it('returns true for a valid test with multiple steps with the same description', async () => {
    let example =
      test('foo')
        .step('step', noop)
        .step('step', noop)
        .step('step', noop)
        .assertion('assertion one', noop)

    expect(validateTest(example)).toEqual(true);
  });

  it('is invalid with multiple assertions with same description', async () => {
    let example =
      test('foo')
        .assertion('assertion', noop)
        .assertion('assertion', noop)

    expect(() => { validateTest(example) }).toThrowError('Invalid Test')
  });

  it('is invalid with multiple children with same description', async () => {
    let example =
      test('foo')
        .child('child', test => test)
        .child('child', test => test)

    expect(() => { validateTest(example) }).toThrowError('Invalid Test')
  });

  it('is invalid with an invalid child', async () => {
    let example =
      test('foo')
        .child('child two', test => test
          .assertion('assertion', noop)
          .assertion('assertion', noop)
        )

    expect(() => { validateTest(example) }).toThrowError('Invalid Test')
  });

  it('is invalid if it exceeds maximum depth', async () => {
    let example =
      test('foo')
        .child('child', test => test
          .child('child', test => test
            .child('child', test => test
              .child('child', test => test
                .child('child', test => test
                  .child('child', test => test
                    .child('child', test => test
                      .child('child', test => test
                        .child('child', test => test
                          .child('child', test => test
                            .child('child', test => test)))))))))))

    expect(() => { validateTest(example) }).toThrowError('Invalid Test')
  });

  it('is invalid with no required fields', () => {
    let example = { namedExport: test("No default export") }

    expect(() => { validateTest(example) }).toThrowError('Invalid Test')
  });

  it('is invalid with no children', () => {
    let example = {
      description: 'foo',
      assertions: [noop]
    }

    expect(() => { validateTest(example) }).toThrowError('Invalid Test')
  });


  it('is invalid with no assertions', () => {
    let example = {
      description: 'foo',
      children: []
    }

    expect(() => { validateTest(example) }).toThrowError('Invalid Test')
  });
})
