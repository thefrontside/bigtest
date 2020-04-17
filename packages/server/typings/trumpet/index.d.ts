/**
 * @source: https://github.com/coolreader18/palooza/blob/master/src/types.d.ts#L16
 */
declare module "trumpet" {
  import { Duplex } from "stream";

  namespace Trumpet {
    export interface Attributes {
      [name: string]: string;
    }

    export interface AsyncElement {
      /**
       * The element name as a lower-case string.
       * @example 'div'
       */
      name: string;

      /**
       * When the selector for elem matches, query the case-insensitive
       * attribute called name with `cb(value)`.
       * @returns itself.
       */
      getAttribute(name: string, cb: (value: string) => void): AsyncElement;

      /**
       * Get all the attributes in `cb(attributes)` as an object `attributes` with
       * lower-case keys
       * @returns itself;
       */
      getAttributes(cb: (attrs: Attributes) => void): AsyncElement;

      /**
       * When the selector for elem matches, replace the case-insensitive
       * attribute called name with value. If the attribute doesn't exist,
       * it will be created in the output stream.
       * @returns itself.
       */
      setAttribute(name: string, value: string): AsyncElement;

      /**
       * When the selector for elem matches, remove the attribute called name if
       * it exists.
       * @returns itself.
       */
      removeAttribute(name: string): AsyncElement;

      /**
       * Create a new readable stream with the html content under `elem`.
       */
      createReadStream(): NodeJS.ReadableStream;

      /**
       * Create a new write stream to replace the html content under `elem`.
       */
      createWriteStream(): NodeJS.WritableStream;

      /**
       * Create a new readable writable stream that outputs the content under
       * `elem` and replaces the content with the data written to it.
       */
      createStream(): NodeJS.ReadWriteStream;
    }

    export interface Element {
      /**
       * The element name as a lower-case string.
       * @example 'div'
       */
      name: string;

      /**
       * Get the value of the attribute `name` as a string.
       */
      getAttribute(name: string, cb?: (value: string) => void): string;

      /**
       * Get all the attributes as an object `attributes` with lower-case keys
       */
      getAttributes(cb?: (attrs: Attributes) => void): Attributes;

      /**
       * Replace the case-insensitive attribute called name with value. If the
       * attribute doesn't exist, it will be created in the output stream.
       */
      setAttribute(name: string, value: string): void;

      /**
       * Remove the attribute called name if it exists.
       */
      removeAttribute(name: string): void;

      /**
       * Create a new readable stream with the html content under `elem`.
       */
      createReadStream(): NodeJS.ReadableStream;

      /**
       * Create a new write stream to replace the html content under `elem`.
       */
      createWriteStream(): NodeJS.WritableStream;

      /**
       * Create a new readable writable stream that outputs the content under
       * `elem` and replaces the content with the data written to it.
       */
      createStream(): NodeJS.ReadWriteStream;
    }
  }

  import AsyncElement = Trumpet.AsyncElement;
  import Element = Trumpet.Element;

  class Trumpet extends Duplex {
    /**
     * Return a result object `elem` for the first element matching `selector`.
     */
    select(selector: string, cb?: (elem: Element) => void): AsyncElement;

    /**
     * Get a result object `elem` for every element matching `selector`.
     */
    selectAll(selector: string, cb?: (elem: Element) => void): AsyncElement;

    /**
     * Short-hand for `tr.select(sel).createStream(opts)`.
     */
    createStream(selector: string): NodeJS.ReadWriteStream;

    /**
     * Short-hand for `tr.select(sel).createReadStream(opts)`.
     */
    createReadStream(selector: string): NodeJS.ReadableStream;

    /**
     * Short-hand for `tr.select(sel).createWriteStream(opts)`.
     */
    createWriteStream(selector: string): NodeJS.WritableStream;
  }

  export = Trumpet;
}