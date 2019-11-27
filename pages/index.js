import styled from "styled-components";
import { Agent, Environment, utils } from "flocc";
import Eatery from "../entities/eatery";
import tick, { attemptToEat } from "../rules/tick";
import time from "../utils/time";

let environment = null;

const Wrapper = styled.div`
  background: black;
  color: white;
  display: flex;
  justify-content: space-between;
  height: 100vh;
  padding: 20px;
  width: 100vw;
`;

const Input = styled.input`
  appearance: none;
  background: transparent;
  color: white;
  border: none;

  &:focus {
    border-bottom: 1px solid white;
    outline: 0;
  }
`;

const Panel = styled.div`
  border: 1px solid white;
  padding: 20px;
`;

export default class Index extends React.Component {
  inputRef = React.createRef();

  constructor() {
    super();
    this.state = {
      actions: [],
      hunger: 0,
      id: null,
      time: "12:00am"
    };
  }

  componentDidMount() {
    environment = new Environment();
    environment.set("eatery", new Eatery());
    for (let i = 0; i < 100; i++) {
      const agent = new Agent();
      agent.set({
        eating: -1,
        hunger: utils.random(0, 0.5, true),
        auto: true
      });
      agent.addRule(tick);
      environment.addAgent(agent);
      if (i === 100 - 1) {
        agent.set("auto", false);
        this.setState({ id: agent.id }, this.update);
      }
    }
  }

  update = () => {
    environment.tick({ randomizeOrder: true });
    this.setState(
      {
        hunger: environment.getAgentById(this.state.id).get("hunger"),
        time: time(environment)
      },
      () => {
        requestAnimationFrame(this.update);
      }
    );
  };

  submit = e => {
    e.preventDefault();
    const { id, time } = this.state;
    const { value } = this.inputRef.current;
    const newState = {
      actions: this.state.actions
    };
    if (value === "eat") {
      const ableToEat = attemptToEat(environment.getAgentById(id));
      if (ableToEat) {
        newState.actions.push("ate at " + time);
      } else {
        newState.actions.push("too crowded to eat at " + time);
      }
    }
    this.setState(newState, () => {
      this.inputRef.current.value = "";
    });
  };

  render() {
    const { actions, hunger, id, time } = this.state;
    return (
      <Wrapper>
        <div>
          {actions.length > 0 && (
            <pre style={{ margin: 0 }}>{actions.map(a => a + "\n")}</pre>
          )}
          <form onSubmit={this.submit}>
            <Input ref={this.inputRef} placeholder="test type" />
          </form>
        </div>
        <Panel>
          {id}
          <div>
            {environment && environment.get("eatery").agents.map(() => "● ")}
            <br />
            {hunger.toLocaleString()}
            <br />
            {time}
          </div>
        </Panel>
      </Wrapper>
    );
  }
}
