import styled, { css } from "styled-components";
import { utils, Histogram } from "flocc";
import Eatery from "../entities/eatery";
import tick from "../rules/tick";
import time from "../utils/time";
import SocialAgent from "../entities/agent";
import SocialEnvironment from "../entities/environment";
import Wrapper from "../ui/wrapper";
import Input from "../ui/input";
import Column from "../ui/column";
import Panel from "../ui/panel";
import Table from "../components/table";

let environment = null;

let t = new Date();

export default class Index extends React.Component {
  inputRef = React.createRef();

  constructor() {
    super();
    this.state = {
      actions: [],
      id: null,
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

    // const container = document.createElement("div");
    // const histogram = new Histogram(environment, {
    //   buckets: 10,
    //   min: 0,
    //   max: 1,
    //   aboveMax: true,
    //   width: 600
    // });
    // histogram.mount(container);
    // histogram.metric("hunger");
    // document.body.appendChild(container);
  }

  update = () => {
    // console.log("time passed", new Date() - t);
    t = new Date();
    environment.tick({ randomizeOrder: true });
    requestAnimationFrame(this.update);
    this.setState({
      time: time(environment)
    });
  };

  submit = e => {
    e.preventDefault();
    const { id, time } = this.state;
    const { value } = this.inputRef.current;
    const agent = environment.getAgentById(id);
    const newState = {
      actions: this.state.actions
    };
    if (value === "eat") {
      const { message } = agent.attemptToEat();
      newState.actions.push(message + " [" + time + "]");
    }
    if (value === "sleep") {
      const { message } = agent.attemptToSleep();
      newState.actions.push(message + " [" + time + "]");
    }
    if (value.slice(0, 7) === "talk to") {
      const name = value.slice(8).toLowerCase();
      const other = environment.getAgentByName(name);
      if (other) {
        const { message } = agent.attemptToTalkTo(other);
        newState.actions.push(message + " [" + time + "]");
      } else {
        newState.actions.push(`no one named ${name}`);
      }
    }
    this.setState(newState, () => {
      this.inputRef.current.value = "";
    });
  };

  render() {
    const { actions, id, time } = this.state;
    const agent = environment ? environment.getAgentById(id) : null;
    const hunger = agent ? agent.get("hunger") : null;
    const tired = agent ? agent.get("tired") : null;
    const relationships = agent ? agent.get("relationships") : null;
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
            {agent && `hunger: ${hunger.toLocaleString()}`}
            <br />
            {agent && `tired: ${tired.toLocaleString()}`}
            <br />
            {relationships && relationships.size > 0 && (
              <div>
                relationships
                <br />
                {Array.from(relationships.entries()).map(([other, r], i) => (
                  <div key={i}>
                    - {other.get("name")} ({r.to(other)})
                    <br />
                  </div>
                ))}
              </div>
            )}
          </div>
          {time}
        </Panel>
        {environment && (
          <Panel style={{ width: 600 }}>
            <Table agentData={environment.getAgents().map(a => a.getData())} />
          </Panel>
        )}
      </Wrapper>
    );
  }
}
