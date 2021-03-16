import { highlight, languages } from "prismjs";
import { useStore } from "effector-react";
import { $code, edit } from "../actions";
import { CodeEditor } from "../CodeEditor";

import "prismjs/themes/prism.css";
import "prismjs/components/prism-javascript";

export function ActionsEditor() {
  const code = useStore($code);

  return (
    <CodeEditor
      value={code}
      onValueChange={edit}
      highlight={(code) => highlight(code, languages.javascript, "javascript")}
      className="p-1"
    />
  );
}
