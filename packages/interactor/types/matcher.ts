import { createInteractor, Matcher } from '../src/index';

function shouted(value: string): Matcher<string> {
  return {
    match(actual: string): boolean {
      return actual === value.toUpperCase();
    },
    format(): string {
      return value.toUpperCase();
    }
  }
}

let isEven: Matcher<number> = {
  match(actual: number): boolean {
    return actual % 2 === 0;
  },
  format(): string {
    return "is even";
  }
}

let Link = createInteractor<HTMLLinkElement>('whatever')
  .filters({
    href: (element) => element.href,
    number: () => 3
  })

//// With filter

Link({ href: shouted("Foobar") });
Link({ number: isEven });

// $ExpectError
Link({ href: isEven });

// $ExpectError
Link({ href: { not: "a matcher" } });

//// With filter matcher

Link().has({ href: shouted("Foobar") });
Link().has({ number: isEven });

// $ExpectError
Link().has({ href: { not: "a matcher" } });

// $ExpectError
Link().has({ href: isEven });

//// With locator

Link(shouted("Foobar"));

// $ExpectError
Link(isEven);

// $ExpectError
Link({ not: "a matcher" });
