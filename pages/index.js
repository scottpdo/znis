import styled from "styled-components";
import { utils, Histogram } from "flocc";
import Eatery from "../entities/eatery";
import tick from "../rules/tick";
import time from "../utils/time";
import SocialAgent from "../entities/agent";
import SocialEnvironment from "../entities/environment";

let log = [];

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

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Panel = styled(Column)`
  border: 1px solid white;
  padding: 20px;
  width: 320px;
`;

export default class Index extends React.Component {
  inputRef = React.createRef();

  constructor() {
    super();
    this.state = {
      actions: [],
      hunger: 0,
      tired: 0,
      time: "12:00am"
    };
  }

  componentDidMount() {
    environment = new SocialEnvironment();
    environment.set("eatery", new Eatery());
    for (let i = 0; i < 100; i++) {
      const agent = new SocialAgent(environment);
      agent.addRule(tick);
      if (i === 100 - 1) {
        // agent.set("auto", false);
        this.setState({ id: agent.id }, this.update);
      }
    }

    const container = document.createElement("div");
    const histogram = new Histogram(environment, {
      buckets: 10,
      min: 0,
      max: 1,
      aboveMax: true,
      width: 600
    });
    histogram.mount(container);
    histogram.metric("hunger");
    document.body.appendChild(container);
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
    log.push(environment.get("eatery").agents.length);
    if (environment.time % 360 === 0) {
      console.log(time(environment) + ": " + utils.mean(log));
      log = [];
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
      if (sleeping >= 0) {
        newState.actions.push("can't eat while sleeping");
      } else {
        const ableToEat = agent.attemptToEat();
        if (ableToEat) {
          newState.actions.push("ate at " + time);
        } else {
          newState.actions.push("too crowded to eat at " + time);
        }
      }
    }
    if (value === "sleep") {
      if (eating === -1) {
        agent.sleep();
        newState.actions.push("started sleeping at " + time);
      } else {
        newState.actions.push("can't sleep while eating");
      }
    }
    if (value.slice(0, 7) === "talk to") {
      const name = value.slice(8).toLowerCase();
      const other = environment.getAgentByName(name);
      if (other) {
        agent.talkTo(other);
        newState.actions.push(`talked to ${name} at ${time}`);
      }
    }
    this.setState(newState, () => {
      this.inputRef.current.value = "";
    });
  };

  render() {
    const { actions, hunger, tired, id, time } = this.state;
    const agent = environment ? environment.getAgentById(id) : null;
    const status = !agent
      ? ""
      : agent.get("eating") >= 0
      ? "eating"
      : agent.get("sleeping") >= 0
      ? "sleeping"
      : "";
    return (
      <Wrapper>
        <Column>
          {actions.length > 0 ? (
            <pre style={{ margin: 0 }}>{actions.map(a => a + "\n")}</pre>
          ) : (
            <div />
          )}
          <form onSubmit={this.submit}>
            <Input ref={this.inputRef} placeholder="do something" />
          </form>
        </Column>
        <Panel>
          <div>
            {agent && agent.get("name") + (status ? ` (${status})` : "")}
            <br />
            {environment && environment.get("eatery").agents.map(() => "● ")}
            <br />
            Hunger: {hunger.toLocaleString()}
            <br />
            Tired: {tired.toLocaleString()}
            <br />
            {agent && agent.get("relationships").size > 0 && (
              <div>
                Relationships
                <br />
                {Array.from(agent.get("relationships").entries()).map(
                  ([agent, r], i) => (
                    <div key={i}>
                      - {agent.get("name")} ({r.atob})
                      <br />
                    </div>
                  )
                )}
              </div>
            )}
          </div>
          {time}
        </Panel>
      </Wrapper>
    );
  }
}
