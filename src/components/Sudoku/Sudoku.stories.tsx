import React from "react";
import { storiesOf } from "@storybook/react";

import { Sudoku } from "./Sudoku";

const X = undefined;

storiesOf("Sudoku", module).add("sample", () =>  <Sudoku values={[
  X, X, X, X, X, X, X, X, X,
  X, X, X, X, X, 3, X, 8, 5,
  X, X, 1, X, 2, X, X, X, X,
  X, X, X, 5, X, 7, X, X, X,
  X, X, 4, X, X, X, 1, X, X,
  X, 9, X, X, X, X, X, X, X,
  5, X, X, X, X, X, X, 7, 3,
  X, X, 2, X, 1, X, X, X, X,
  X, X, X, X, 4, X, X, X, 9
]} />);
