import { useStore } from "effector-react";
import { createInteractor } from "@bigtest/interactor";
import React, { useCallback, useEffect, useState } from "react";
import { InspectorView } from "./interactors/InspectorView";
import { ActionsEditor } from "./interactors/ActionsEditior";
import { $code, $interactors, $isLoading, end, refresh, start } from "./actions";
import {
  Button,
  CheckBox,
  Heading,
  Link,
  MultiSelect,
  RadioButton,
  Select,
  TextField,
} from "./interactors/getInteractors";

export function App() {
  const interactors = useStore($interactors);
  const isLoading = useStore($isLoading);
  const code = useStore($code);

  const runHandler = useCallback(async () => {
    start();
    try {
      await eval(
        `async ({ Button, CheckBox, Heading, Link, MultiSelect, RadioButton, Select, TextField, createInteractor }) => { ${code} }`
      )({ Button, CheckBox, Heading, Link, MultiSelect, RadioButton, Select, TextField, createInteractor });
    } catch (error) {
      throw error;
    } finally {
      refresh();
      end();
    }
  }, [code]);

  return (
    <div className="relative flex bottom-8 left-8 bg-white p-4 w-max">
      <div className="mr-4 flex-shrink-0">
        <div className="max-w-lg min-w-32 min-h-64 max-h-128 overflow-y-auto rounded-lg border-black border p-2">
          <InspectorView interactors={interactors} />
        </div>
      </div>
      <div className="flex flex-col items-start">
        <button
          className="rounded border-gray-500 border shadow outline-none focus:outline-none mb-2"
          onClick={runHandler}
        >
          <span className="m-1">Run</span>
        </button>
        <div className="rounded-lg border-black border p-1 h-full">
          <ActionsEditor />
        </div>
      </div>
      {isLoading ? <div className="top-0 left-0 absolute w-full h-full bg-gray-400 opacity-50" /> : null}
    </div>
  );
}
