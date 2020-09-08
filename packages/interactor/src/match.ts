import { Locator } from './locator';
import { Filter } from './filter';
import { InteractorSpecification } from './specification';
import { escapeHtml } from './escape-html';

const check = (value: unknown): string => value ? "✓" : "⨯";

export class Match<E extends Element, S extends InteractorSpecification<E>> {
  public matchLocator: MatchLocator<E>;
  public matchFilter: MatchFilter<E, S>;
  public matches: boolean;

  constructor(
    public locator: Locator<E>,
    public filter: Filter<E, S>,
    public element: E
  ) {
    this.matchLocator = new MatchLocator(locator, element);
    this.matchFilter = new MatchFilter(filter, element);
    this.matches = this.matchLocator.matches && this.matchFilter.matches;
  }

  asTableRow(): string[] {
    return [this.matchLocator.format(), ...this.matchFilter.asTableRow()]
  }

  get sortWeight(): number {
    return this.matchLocator.sortWeight + this.matchFilter.sortWeight;
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
    public locator: Locator<E>,
    public element: E
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

export class MatchFilter<E extends Element, S extends InteractorSpecification<E>> {
  public matches: boolean;
  public items: MatchFilterItem<E, S>[];

  constructor(
    public filter: Filter<E, S>,
    public element: E,
  ) {
    this.items = Object.entries(filter.all).map(([key, expected]) => {
      return new MatchFilterItem(filter, element, key, expected)
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

export class MatchFilterItem<E extends Element, S extends InteractorSpecification<E>> {
  public actual: unknown;
  public matches: boolean;

  constructor(
    public filter: Filter<E, S>,
    public element: E,
    public key: string,
    public expected: unknown
  ) {
    let definition = (this.filter.specification.filters || {})[this.key];
    if(typeof(definition) === 'function') {
      this.actual = definition(this.element);
    } else {
      this.actual = definition.apply(this.element);
    }
    this.matches = this.actual === this.expected;
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
