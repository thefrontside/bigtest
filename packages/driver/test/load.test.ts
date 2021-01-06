import  expect from 'expect';
import { spawn } from './helpers';

import { Driver, load } from '../index';

describe('loading a driver', () => {
  describe('when the driver module cannot be found', () => {
    let error: Error;
    beforeEach(async () => {
      try {
        await spawn(load({
          module: 'wut'
        }));
      } catch (e) {
        error = e;
      }
    });

    it('throws a driver not found error', () => {
      expect(error).toBeDefined();
      expect(error.name).toEqual('DriverNotFoundError');
    });
  });

  describe('missing factory function', () => {
    let error: Error;
    beforeEach(async () => {
      try {
        await spawn(load({
          module: './test/fixtures/missing-factory-function'
        }));
      } catch (e) {
        error = e;
      }
    });

    it('throws an invalid driver error', () => {
      expect(error).toBeDefined();
      expect(error.name).toEqual('DriverError');
    });
  });

  describe('when the driver module does not export a driver factory function', () => {
    let error: Error;
    beforeEach(async () => {
      try {
        await spawn(load({
          module: './test/fixtures/bad-factory-function'
        }));
      } catch (e) {
        error = e;
      }
    });

    it('throws an invalid driver error', () => {
      expect(error).toBeDefined();
      expect(error.name).toEqual('DriverError');
    });
  });

  describe('when the driver module is great!', () => {
    let driver: Driver<number>;
    beforeEach(async () => {
      driver = await spawn(load({
        module: './test/fixtures/good-factory-function',
        options: 'speedracer'
      }));
    });

    it('loads the driver', () => {
      expect(driver).toBeDefined();
      expect(driver.description).toEqual('Driver<speedracer>');
      expect(driver.data).toEqual(42);
    });
  });
});
