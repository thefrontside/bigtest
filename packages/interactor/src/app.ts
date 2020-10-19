import { Interaction } from './interaction';
import { Page } from './page';

export const App = {
  visit(path = '/'): Interaction<void> {
    console.warn('App.visit is deprecated, please use Page.visit instead');
    return Page.visit(path)
  }
}
