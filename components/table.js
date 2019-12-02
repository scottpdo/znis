import styled from "styled-components";

const Row = styled.tr``;
const Cell = styled.td`
  background: gray;
  ${props => props.center && `text-align: center;`}
`;

export default ({ agents }) => {
  return (
    <table>
      <Row>
        <Cell>name</Cell>
        <Cell>hunger</Cell>
        <Cell>eating</Cell>
        <Cell>tired</Cell>
        <Cell>sleeping</Cell>
      </Row>
      {agents.map((agent, i) => {
        return (
          <Row key={i}>
            <Cell>{agent.get("name")}</Cell>
            <Cell>{Math.round(agent.get("hunger") * 100) / 100}</Cell>
            <Cell center>{agent.isEating() ? "✔︎" : ""}</Cell>
            <Cell>{Math.round(agent.get("tired") * 100) / 100}</Cell>
            <Cell center>{agent.isSleeping() ? "✔︎" : ""}</Cell>
          </Row>
        );
      })}
    </table>
  );
};
