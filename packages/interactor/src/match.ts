import isEqual from 'lodash.isequal';
import { Locator } from './locator';
import { Filter } from './filter';
import { Filters } from './specification';
import { escapeHtml } from './escape-html';

const check = (value: unknown): string => value ? "✓" : "⨯";

export class Match<E extends Element, F extends Filters<E>> {
  public matchLocator?: MatchLocator<E>;
  public matchFilter: MatchFilter<E, F>;
  public matches: boolean;

  constructor(
    public element: E,
    public filter: Filter<E, F>,
    public locator?: Locator<E>,
  ) {
    this.matchLocator = locator && new MatchLocator(element, locator);
    this.matchFilter = new MatchFilter(element, filter);
    this.matches = (this.matchLocator ? this.matchLocator.matches : true) && this.matchFilter.matches;
  }

  asTableHeader(name: string): string[] {
    if(this.matchLocator) {
      return [name, ...this.filter.asTableHeader()];
    } else {
      return this.filter.asTableHeader();
    }
  }

  asTableRow(): string[] {
    if(this.matchLocator) {
      return [this.matchLocator.format(), ...this.matchFilter.asTableRow()]
    } else {
      return this.matchFilter.asTableRow();
    }
  }

  get sortWeight(): number {
    return (this.matchLocator?.sortWeight || 0) + this.matchFilter.sortWeight;
  }

  elementDescription(): string {
    let tag = this.element.tagName.toLowerCase();
    let attrs = Array.from(this.element.attributes).map((attr) => {
      return `${attr.name}="${escapeHtml(attr.value)}"`
    });
    return `<${[tag, ...attrs].join(' ')}>`;
  }
}

export class MatchLocator<E extends Element> {
  public matches: boolean;
  public expected: string | null;
  public actual: string | null;

  constructor(
    public element: E,
    public locator: Locator<E>,
  ) {
    this.expected = locator.value;
    this.actual = locator.locatorFn(element);
    this.matches = this.actual === this.expected;
  }

  formatActual(): string {
    return JSON.stringify(this.actual);
  }

  format(): string {
    return `${check(this.matches)} ${this.formatActual()}`;
  }

  get sortWeight(): number {
    return this.matches ? 10 : 0;
  }
}

export class MatchFilter<E extends Element, F extends Filters<E>> {
  public matches: boolean;
  public items: MatchFilterItem<E, F>[];

  constructor(
    public element: E,
    public filter: Filter<E, F>,
  ) {
    this.items = Object.entries(filter.all).map(([key, expected]) => {
      return new MatchFilterItem(element, filter, key, expected)
    });
    this.matches = this.items.every((match) => match.matches)
  }

  asTableRow(): string[] {
    return this.items.map((f) => f.format());
  }

  get sortWeight(): number {
    return this.items.reduce((agg, i) => agg + i.sortWeight, 0);
  }
}

export class MatchFilterItem<E extends Element, F extends Filters<E>> {
  public actual: unknown;
  public matches: boolean;

  constructor(
    public element: E,
    public filter: Filter<E, F>,
    public key: string,
    public expected: unknown
  ) {
    if(this.filter.specification.filters && this.filter.specification.filters[this.key]) {
      let definition = this.filter.specification.filters[this.key];
      if(typeof(definition) === 'function') {
        this.actual = definition(this.element);
      } else {
        this.actual = definition.apply(this.element);
      }
      this.matches = isEqual(this.actual, this.expected);
    } else {
      throw new Error(`interactor does not define a filter named ${JSON.stringify(this.key)}`);
    }
  }

  formatActual(): string {
    return JSON.stringify(this.actual);
  }

  format(): string {
    return `${check(this.matches)} ${this.formatActual()}`;
  }

  get sortWeight(): number {
    return this.matches ? 1 : 0;
  }
}
