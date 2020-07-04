import { World as CucumberWorld } from 'cucumber';

interface WorldParams {
  attach(content: Buffer | string, mimeType?: string, callback?: () => void): void;
  parameters: Record<string, unknown>;
}

export class World implements CucumberWorld {
  attach: WorldParams['attach'];
  parameters: WorldParams['parameters'];

  public constructor({ attach, parameters }: WorldParams) {
    console.log(attach);
    console.log(parameters);
    this.attach = attach;
    this.parameters = parameters;
  }
}
