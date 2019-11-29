import styled from "styled-components";
import { Agent, Environment, utils } from "flocc";
import Eatery from "../entities/eatery";
import tick, { attemptToEat, sleep } from "../rules/tick";
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
      tired: 0,
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
        tired: utils.random(0, 0.5, true),
        sleeping: -1,
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
    const agent = environment.getAgentById(this.state.id);
    const { hunger, tired } = agent.getData();
    if (this.state.tired > 0 && tired === 0) {
      this.setState({
        actions: this.state.actions.concat("woke up at " + time(environment))
      });
    }
    this.setState(
      {
        hunger,
        tired,
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
    const agent = environment.getAgentById(id);
    const { eating, sleeping } = agent.getData();
    const newState = {
      actions: this.state.actions
    };
    if (value === "eat") {
      const ableToEat = attemptToEat(agent);
      if (ableToEat) {
        newState.actions.push("ate at " + time);
      } else {
        newState.actions.push("too crowded to eat at " + time);
      }
    }
    if (value === "sleep") {
      if (eating === -1) {
        sleep(agent);
        newState.actions.push("started sleeping at " + time);
      } else {
        newState.actions.push("can't sleep while eating");
      }
    }
    this.setState(newState, () => {
      this.inputRef.current.value = "";
    });
  };

  render() {
    const { actions, hunger, tired, id, time } = this.state;
    return (
      <Wrapper>
        <div>
          {actions.length > 0 && (
            <pre style={{ margin: 0 }}>{actions.map(a => a + "\n")}</pre>
          )}
          <form onSubmit={this.submit}>
            <Input ref={this.inputRef} placeholder="do something" />
          </form>
        </div>
        <Panel>
          {id}
          <div>
            {environment && environment.get("eatery").agents.map(() => "● ")}
            <br />
            Hunger: {hunger.toLocaleString()}
            <br />
            Tired: {tired.toLocaleString()}
            <br />
            {time}
          </div>
        </Panel>
      </Wrapper>
    );
  }
}
