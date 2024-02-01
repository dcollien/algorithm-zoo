import React, { useState } from "react";
import { css } from '@emotion/css';
import { Button } from "reakit/Button";

interface ISimpleDropdownProps {
  examples: string[];
  onSelect: (example: string) => void;
}

const containerCss = css`
  display: inline-block;
`;

const selectionCss = css`
  display: flex;
`;

const buttonCss = css`
  margin-left: 4px;
`;

export const SimpleSelector: React.FC<ISimpleDropdownProps> = ({
  examples,
  onSelect
}) => {
  const [selected, setSelected] = useState<string>(examples[0]);
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(event.target.value);
  }
  const clickHandler = () => onSelect(selected);
  return (
    <div className={containerCss}>
      <div className={selectionCss}>
        <div>
          <select aria-label="Examples" onChange={handleChange}>
            {examples.map(example => (
              <option key={example} value={example}>
                {example}
              </option>
            ))}
          </select>
        </div>
        <Button className={buttonCss} onClick={clickHandler}>
          Select
        </Button>
      </div>
    </div>
  );
};
