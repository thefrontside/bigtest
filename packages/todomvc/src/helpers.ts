import { Operation } from "effection";

export const self: Operation = ({ resume, context: { parent }}) => resume(parent);
