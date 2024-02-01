import React from "react";
import { css } from '@emotion/css';

type SudokuNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
interface SudokuGrid extends Array<SudokuNumber | undefined> {
  0: SudokuNumber | undefined;
  length: 81;
}

interface ISudoku {
  values: SudokuGrid;
  fixedIndices: Array<number>;
}

const tableCss = css`
  display: flex;
  flex-wrap: wrap;
  width: 505px;
  border-top: 1px solid black;
  border-right: 1px solid black;
  box-sizing: border-box;
`;

const cellCss = (i: number) => css`
  position: relative;
  width: 56px;
  height: 62px;
  ${i % 3 === 0 ? "border-left: 2px solid black;" : ""}
  border-right: 1px solid black;
  ${Math.floor(i / 9) % 3 === 2 ? "border-bottom: 2px solid black;" : ""}
  border-top: 1px solid black;
  box-sizing: border-box;
  text-align: center;
  line-height: 42px;
  font-weight: bold;
  font-size: 18px;
  color: #555;
`;

const candidatesCss = css`
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  top: 38px;
  height: 20px;
  line-height: 10px;
  font-size: 10px;
  color: #666;
`;

const fixedCss = css`
  line-height: 60px;
  color: black;
`;

const cellInfo = (i: number) => {
  const row = Math.floor(i / 9);
  const col = i % 9;
  const squareRow = Math.floor(row / 3);
  const squareCol = Math.floor(col / 3);
  const square = squareRow * 3 + squareCol;

  return {
    row,
    col,
    squareRow,
    squareCol,
    square
  };
};

const calculateValidValues = (values: SudokuGrid, index: number) => {
  const cell = cellInfo(index);
  const row = values.filter((_value, i) => cellInfo(i).row === cell.row);
  const col = values.filter((_value, i) => cellInfo(i).col === cell.col);
  const square = values.filter(
    (_value, i) => cellInfo(i).square === cell.square
  );

  const allValues: SudokuNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const usedValues = new Set([...row, ...col, ...square]);
  return allValues.filter(value => !usedValues.has(value));
};

export const Sudoku: React.FC<ISudoku> = ({ values, fixedIndices }) => {
  const fixed = new Set(fixedIndices);
  return (
    <div className={tableCss}>
      {values.map((cell, i) => (
        <div className={cellCss(i)}>
          {!fixed.has(i) && (
            <div className={candidatesCss}>
              {calculateValidValues(values, i).join(" ")}
            </div>
          )}
          <div className={fixed.has(i) ? fixedCss : undefined}>{cell}</div>
        </div>
      ))}
    </div>
  );
};
