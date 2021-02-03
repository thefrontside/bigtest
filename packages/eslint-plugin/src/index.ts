import base from './configs/base';
import { all } from './configs/all';
import { recommended} from './configs/recommended';
import { rules } from './rules';

export { rules } from './rules';

export const configs = {
  all,
  base,
  recommended,
};

export default {
  rules,
  configs
}
