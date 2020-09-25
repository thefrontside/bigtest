import { rollup } from 'rollup';
import { rollupEslintPlugin } from '../../src/rollup-plugin-eslint/rollup-plugin-eslint';
import expect from 'expect';

describe('roolup-eslint-plugin', () => {
  it('should not fail with default export', async () => {
    await rollup({
      input: 'test/fixtures/default-export.test.ts',
      plugins: [
        rollupEslintPlugin({ testFiles: ["test/fixtures/default-export.test.ts"]  }),
      ]
    })
  });

  it('should fail with no default export', async () => {
    try {
      await rollup({
        input: 'test/fixtures/no-default-export.test.ts',
        plugins: [
          rollupEslintPlugin({ testFiles: ["test/fixtures/no-default-export.test.ts"]  }),
        ]
      });
    } catch (err) {
      expect(err.name).toEqual('@bigtest/require-default-export');
    }
  });
});