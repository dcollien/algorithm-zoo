import React, { useState, useEffect } from "react";
import { storiesOf } from "@storybook/react";

import { Mermaid } from "./Mermaid";


storiesOf("Mermaid", module).add("sample", () => {
  const [isStyled, setIsStyled] = useState<boolean>(false);


  const style = 'style choice fill:#eef,stroke:#e66,stroke-width:3px;';
  const chart = `
    graph TD;
      start("Start");
      doThing["Do Something"];
      choice{"Should I End?"};
      endNode("End");
      start-->doThing;
      doThing-->choice;
      choice-- Yes -->endNode;
      choice-- No -->doThing;
      ${isStyled ? style : ''}
  `;

  return <>
    <Mermaid id="flowchart">
      {chart}
    </Mermaid>
    <button onClick={() => setIsStyled(!isStyled)}>Toggle</button>
  </>;
}, { isSelected: 'selected' });
