import { createInteractor, perform } from '../src/index';

const Link = createInteractor<HTMLLinkElement>('link')({
  selector: 'a',
  filters: {
    href: (element) => element.href,
  },
  actions: {
    click: perform(element => { element.click() }),
  }
});

const MainNav = createInteractor('main nav')({
  selector: 'nav',
  children: {
    link: Link,
    itemLink: {
      find(interactor, item: number) {
        return interactor.find(Link(`Item ${item}`))
      }
    }
  }
});

// valid simple child
MainNav().link()
MainNav().link('Foo')
MainNav().link({ href: 'http' })
MainNav().link('Foo', { href: 'http' })

// valid custom child
MainNav().itemLink(3)

// using actions through child
MainNav().link('Foo').click()
MainNav().itemLink(3).click()

// simple child filter does not exist
// $ExpectError
MainNav().link({ doesNotExist: 'http' })

// simple child filter has wrong type
// $ExpectError
MainNav().link({ href: 4 })

// custom child no argument
// $ExpectError
MainNav().itemLink()

// custom child incorrectly typed argument
// $ExpectError
MainNav().itemLink('foo')
