import { interactor, isPresent } from '@bigtest/interactor';

@interactor
class AppInteractor {
  hasHeading = isPresent('h1');
}

export default AppInteractor;
