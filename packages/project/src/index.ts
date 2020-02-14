import { Operation } from 'effection';

export class Project {
  static *find(): Operation {
    return new Project();
  }
}
