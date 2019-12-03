import styled from "styled-components";
import { sortBy, reverse, identity } from "lodash";
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

  return (
    <div>
      <span style={{ opacity: 0 }}>████████</span>
      <span style={{ position: "absolute", top: 0, left: 0 }}>{output}</span>
    </div>
  );
};

export default ({ agentData }) => {
  const [visible, setVisible] = useState(10);
  const [sort, setSort] = useState(null);
  const [ascending, setAscending] = useState(1);
  const data =
    sort === "hunger"
      ? sortBy(agentData, [a => ascending * a.hunger])
      : sort === "tired"
      ? sortBy(agentData, [a => ascending * a.tired])
      : sort === "name"
      ? (ascending === 1 ? identity : reverse)(sortBy(agentData, [a => a.name]))
      : agentData;
  return (
    <>
      <table>
        <thead>
          <Row>
            <Cell
              onClick={() =>
                sort === "name" ? setAscending(-1 * ascending) : setSort("name")
              }
            >
              name {sort === "name" && (ascending === 1 ? "↑" : "↓")}
            </Cell>
            <Cell
              onClick={() =>
                sort === "hunger"
                  ? setAscending(-1 * ascending)
                  : setSort("hunger")
              }
            >
              hunger {sort === "hunger" && (ascending === 1 ? "↑" : "↓")}
            </Cell>
            <Cell>eating</Cell>
            <Cell
              onClick={() =>
                sort === "tired"
                  ? setAscending(-1 * ascending)
                  : setSort("tired")
              }
            >
              tired {sort === "tired" && (ascending === 1 ? "↑" : "↓")}
            </Cell>
            <Cell>sleeping</Cell>
            <Cell>interests</Cell>
          </Row>
        </thead>
        <tbody>
          {data.slice(0, visible).map((data, i) => {
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
      <div style={{ display: "flex" }}>
        {visible + 10 < data.length && (
          <Button onClick={() => setVisible(visible + 10)}>More</Button>
        )}
        {visible > 10 && (
          <Button onClick={() => setVisible(visible - 10)}>Less</Button>
        )}
      </div>
    </>
  );
};
