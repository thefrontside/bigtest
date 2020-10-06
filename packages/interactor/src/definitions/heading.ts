import { createInteractor } from '../create-interactor';
import { isVisible } from 'element-is-visible';

export const Heading = createInteractor<HTMLHeadingElement>('heading')({
  selector: 'h1,h2,h3,h4,h5,h6',
  filters: {
    level: (element) => parseInt(element.tagName[1]),
    visible: { apply: isVisible, default: true },
  }
});
