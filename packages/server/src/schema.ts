import * as path  from 'path';
import {
  objectType,
  queryType,
  mutationType,
  subscriptionField,
  stringArg,
  makeSchema,
  enumType,
} from "@nexus/schema";

export const schema = makeSchema({
  typegenAutoConfig: {
    contextType: "ctx.GraphqlContext",
    sources: [{
      alias: "ctx",
      source: path.join(__dirname, 'schema','context.ts')
    }],
  },
  outputs: {
    schema: path.join(__dirname, 'schema', 'schema.graphql'),
    typegen: path.join(__dirname, 'schema', 'schema.types.d.ts')
  },
  shouldGenerateArtifacts: process.env['BIGTEST_GENERATE_SCHEMA'] === 'true',
  types: [
    queryType({
      rootTyping: {
        name: "OrchestratorState",
        path: path.join(__dirname, 'orchestrator', 'state.ts'),
      },
      definition(t) {
        t.field("echo", {
          type: "String",
          args: {
            text: stringArg({ required: true }),
          },
          resolve: ((_, { text }) => text)
        });

        t.list.field("agents", {
          type: "Agent",
          resolve: (state) => Object.values(state.agents)
        });

        t.field("agent", {
          type: "Agent",
          nullable: true,
          args: {
            id: stringArg({ required: true })
          },
          resolve: (state, { id }) => state.agents[id]
        });

        t.field("manifest", {
          type: "Test",
        });

        t.field("bundler", {
          type: "Bundler"
        });

        t.list.field("testRuns", {
          type: "TestRun",
          resolve: state => Object.values(state.testRuns)
        });

        t.field("testRun", {
          type: "TestRun",
          nullable: true,
          args: {
            id: stringArg({ required: true }),
          },
          resolve: (state, { id }) => state.testRuns[id]
        })
      }
    }),
    mutationType({
      definition(t) {
        t.string("run", {
          resolve(_source, _args, cxt) {
            return cxt.runTest();
          }
        })
      }
    }),
    objectType({
      name: "TestEvent",
      rootTyping: {
        name: "TestEvent",
        path: path.join(__dirname, 'schema', 'test-event.ts')
      },
      definition(t) {
        t.string('type');
        t.string('status', { nullable: true });
        t.id('testRunId');
        t.id('agentId', { nullable: true });
        t.list.string("path", { nullable: true });
        t.field("error", { type: "Error", nullable: true });
        t.boolean("timeout", { nullable: true });
      }
    }),
    subscriptionField('run', {
      type: 'TestEvent',
      subscribe: (_root, _args, cxt) => cxt.runTestSubscribe(),
      resolve: payload => payload
    }),
    objectType({
      name: "Agent",
      definition(t) {
        t.id("agentId");
        t.field("os", {
          nullable: true,
          type: "OS"
        });
        t.field("platform", {
          nullable: true,
          type: "Platform"
        })
        t.field("browser", {
          nullable: true,
          type: "Browser",
        });
        t.field("engine", {
          nullable: true,
          type: "Engine"
        })
      }
    }),
    objectType({
      name: "OS",
      definition(t) {
        t.string("name");
        t.string("version");
        t.string("versionName");
      }
    }),
    objectType({
      name: "Platform",
      definition(t)  {
        t.string("type");
        t.string("vendor");
      }
    }),
    objectType({
      name: "Engine",
      definition(t) {
        t.string("name");
        t.string("version");
      }
    }),
    objectType({
      name: "Browser",
      definition(t) {
        t.string("name");
        t.string("version");
      }
    }),
    objectType({
      name: "Test",
      definition(t) {
        t.string("description");
        t.string("fileName", {
          nullable: true
        });
        t.list.field("steps", {
          type: "Step"
        });
        t.list.field("assertions", {
          type: "Assertion"
        });
        t.list.field("children", {
          type: "Test"
        })
      }
    }),
    enumType({
      name: "BundlerType",
      members: [
        'UNBUNDLED',
        'BUILDING',
        'GREEN',
        'ERRORED'
      ]
    }),
    objectType({
      name: "Bundler",
      definition(t) {
        t.field("type", {
          type: 'BundlerType'
        });
        t.string("path", {
          nullable: true
        }),
        t.list.field("errors", {
          type: "Error",
          nullable: true
        }),
        t.list.field("warnings", {
          type: "Error",
          nullable: true
        })
      }
    }),
    objectType({
      name: "Step",
      definition(t) {
        t.string("description");
      }
    }),
    objectType({
      name: "Assertion",
      definition(t) {
        t.string("description");
      }
    }),
    objectType({
      name: "TestRun",
      rootTyping: {
        name: "TestRunState",
        path: path.join(__dirname, 'orchestrator', 'state.ts')
      },
      definition(t) {
        t.id("testRunId");
        t.string("status");
        t.list.field("agents", {
          type: "TestRunAgent",
          resolve: (testRun) => Object.values(testRun.agents)
        });
        t.field("agent", {
          type: "TestRunAgent",
          args: {
            id: stringArg({ required: true }),
          },
          resolve: (testRun, { id }) => testRun.agents[id]
        });
      }
    }),
    objectType({
      name: "TestRunAgent",
      definition(t) {
        t.string("status");
        t.field("agent", {
          type: "Agent"
        });
        t.field("result", {
          type: "TestResult"
        });
      }
    }),
    objectType({
      name: "TestResult",
      definition(t) {
        t.string("description");
        t.string("status");
        t.list.field("steps", {
          type: "StepResult"
        });
        t.list.field("assertions", {
          type: "AssertionResult"
        });
        t.list.field("children", {
          type: "TestResult"
        })
      }
    }),
    objectType({
      name: "StepResult",
      definition(t) {
        t.string("description");
        t.string("status");
        t.field("error", {
          type: "Error",
          nullable: true
        })
        t.boolean("timeout", { nullable: true });
      }
    }),
    objectType({
      name: "AssertionResult",
      definition(t) {
        t.string("description");
        t.string("status");
        t.field("error", {
          type: "Error",
          nullable: true
        })
      }
    }),
    objectType({
      name: "Error",
      definition(t) {
        t.string("message");
        t.string("fileName", { nullable: true });
        t.int("lineNumber", { nullable: true });
        t.int("columnNumber", { nullable: true });
        t.string("stack", { nullable: true });
      }
    })
  ]
})
