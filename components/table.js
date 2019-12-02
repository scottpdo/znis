import styled from "styled-components";
import { useState } from "react";
import Button from "../ui/button";

const Row = styled.tr``;
const Cell = styled.td`
  background: gray;
  ${props => props.center && `text-align: center;`}
`;

const display = n => {
  let output = "";
  while (n > 0.125) {
    output += "█";
    n -= 0.125;
  }
  if (n > (0.125 * 3) / 4) {
    output += "▊";
  } else if (n > 0.125 / 2) {
    output += "▌";
  } else if (n > 0.125 / 4) {
    output += "▎";
  }

  return output;
};

export default ({ agentData }) => {
  const [visible, setVisible] = useState(10);
  return (
    <>
      <table>
        <thead>
          <Row>
            <Cell>name</Cell>
            <Cell>hunger</Cell>
            <Cell>eating</Cell>
            <Cell>tired</Cell>
            <Cell>sleeping</Cell>
            <Cell>interests</Cell>
          </Row>
        </thead>
        <tbody>
          {agentData.slice(0, visible).map((data, i) => {
            return (
              <Row key={i}>
                <Cell>{data.name}</Cell>
                <Cell>{display(data.hunger)}</Cell>
                <Cell center>{data.eating >= 0 ? "✔︎" : ""}</Cell>
                <Cell>{display(data.tired)}</Cell>
                <Cell center>{data.sleeping >= 0 ? "✔︎" : ""}</Cell>
                <Cell center>{data.interests}</Cell>
              </Row>
            );
          })}
        </tbody>
      </table>
      <Button onClick={() => setVisible(visible + 10)}>Show more</Button>
    </>
  );
};
