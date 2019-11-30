import {
  SECONDS_PER_TICK,
  MINUTES_PER_TICK,
  HOURS_PER_TICK
} from "../utils/time";
import { utils } from "flocc";
import Relationship from "../entities/relationship";

const HUNGER_GAIN = 0.0002;
const HUNGER_GAIN_WHILE_SLEEPING = 0.00005;
const TIRED_GAIN = 0.0001;

const AMOUNT_TO_EAT = 0.7;
// eat AMOUNT_TO_EAT in 10 minutes
const TURNS_TO_EAT = 10 / MINUTES_PER_TICK;

// recover fully in 8 hours
const RATE_OF_REST = (1 / 8) * HOURS_PER_TICK;

export function attemptToEat(agent) {
  const eatery = agent.environment.get("eatery");
  if (eatery.isFull()) return false;
  eatery.addAgent(agent);
  agent.set("eating", 0);

  // when a new agent begins eating, they form a relationship
  // with agents already at the eatery
  if (eatery.agents.length > 1) {
    eatery.agents
      .filter(a => a !== agent)
      .forEach(a => {
        if (
          !a.get("relationships").get(agent) &&
          !agent.get("relationships").get(a)
        ) {
          const r = new Relationship(agent, a);
          a.get("relationships").set(agent, r);
          agent.get("relationships").set(a, r);
        } else {
          agent
            .get("relationships")
            .get(a)
            .incrementBoth();
        }
      });
  }

  return true;
}

function eat(agent) {
  agent.increment("eating");
  agent.decrement("hunger", AMOUNT_TO_EAT / TURNS_TO_EAT);
  agent.set("hunger", Math.max(agent.get("hunger"), 0));
}

function stopEating(agent) {
  agent.environment.get("eatery").removeAgent(agent);
  agent.set("eating", -1);
}

export function sleep(agent) {
  agent.increment("sleeping");
  agent.decrement("tired", RATE_OF_REST);
  agent.set("tired", Math.max(agent.get("tired"), 0));
}

function wakeUp(agent) {
  agent.set("sleeping", -1);
}

export default function tick(agent) {
  if (agent.get("eating") < 0) {
    agent.increment(
      "hunger",
      agent.get("sleeping") < 0 ? HUNGER_GAIN : HUNGER_GAIN_WHILE_SLEEPING
    );
  }
  if (agent.get("sleeping") < 0) agent.increment("tired", TIRED_GAIN);

  const hunger = agent.get("hunger");
  const mightEat = utils.remap(hunger, 0.7, 1, 0, 1) ** 4;
  if (agent.get("auto") && hunger > 0.7 && Math.random() < mightEat) {
    attemptToEat(agent);
  } else if (agent.get("eating") >= 0) {
    eat(agent);
  }

  if (agent.get("eating") === TURNS_TO_EAT) {
    stopEating(agent);
  }

  if (agent.get("sleeping") >= 0 && agent.get("tired") === 0) {
    wakeUp(agent);
  } else if (
    agent.get("sleeping") >= 0 ||
    (agent.get("tired") > 0.9 && agent.get("auto"))
  ) {
    sleep(agent);
  }
}
