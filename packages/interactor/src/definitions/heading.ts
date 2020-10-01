import { createInteractor } from '../create-interactor';

export const Heading = createInteractor<HTMLHeadingElement>('heading')({
  selector: 'h1,h2,h3,h4,h5,h6',
  filters: {
    level: (element) => parseInt(element.tagName[1])
  }
});
