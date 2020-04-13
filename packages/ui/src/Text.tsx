import { Text as InkText } from "ink";
import React from "react";
import { useFocus } from "./Focusable";

export const Text = ({ children, ...props }) => {
  const { isFocused } = useFocus();
  console.log('isFocused', isFocused)
  return (
    <InkText underline={isFocused} {...props}>{children}</InkText>
  );
};
