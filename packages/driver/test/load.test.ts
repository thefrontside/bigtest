import expect from 'expect';
import { describe, it, beforeEach, captureError } from '@effection/mocha';

import { Driver, importDriver } from '../index';

describe('loading a driver', () => {
  describe('when the driver module cannot be found', () => {
    let error: Error;
    beforeEach(function*() {
      error = yield captureError(importDriver({
        module: 'wut'
      }));
    });

    it('throws a driver not found error', function*() {
      expect(error).toBeDefined();
      expect(error.name).toEqual('DriverNotFoundError');
    });
  });

  describe('missing factory function', () => {
    let error: Error;
    beforeEach(function*() {
      error = yield captureError(importDriver({
        module: './test/fixtures/missing-factory-function'
      }));
    });

    it('throws an invalid driver error', function*() {
      expect(error).toBeDefined();
      expect(error.name).toEqual('DriverError');
    });
  });

  describe('when the driver module does not export a driver factory function', () => {
    let error: Error;
    beforeEach(function*() {
      error = yield captureError(importDriver({
        module: './test/fixtures/bad-factory-function'
      }));
    });

    it('throws an invalid driver error', function*() {
      expect(error).toBeDefined();
      expect(error.name).toEqual('DriverError');
    });
  });

  describe('when the driver module is great!', () => {
    let driver: Driver<number>;
    beforeEach(function*() {
      driver = yield importDriver({
        module: './test/fixtures/good-factory-function',
        options: { name: 'speedracer' }
      });
    });

    it('loads the driver', function*() {
      expect(driver).toBeDefined();
      expect(driver.description).toEqual('Driver<speedracer>');
      expect(driver.data).toEqual(42);
    });
  });
});
