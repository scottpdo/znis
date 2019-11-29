import {
  SECONDS_PER_TICK,
  MINUTES_PER_TICK,
  HOURS_PER_TICK
} from "../utils/time";
import { utils } from "flocc";

const AMOUNT_TO_EAT = 0.6;
// eat AMOUNT_TO_EAT in 12 minutes
const TURNS_TO_EAT = 12 / MINUTES_PER_TICK;

// recover fully in 8 hours
const RATE_OF_REST = (1 / 8) * HOURS_PER_TICK;

export function attemptToEat(agent) {
  const eatery = agent.environment.get("eatery");
  if (eatery.isFull()) return false;
  eatery.addAgent(agent);
  agent.set("eating", 0);
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
  if (agent.get("eating") < 0) agent.increment("hunger", 0.0002);
  if (agent.get("sleeping") < 0) agent.increment("tired", 0.0001);

  const hunger = agent.get("hunger");
  const mightEat = utils.remap(hunger, 0.7, 1, 0, 1) ** 4;
  if (agent.get("auto") && hunger > 0.7 && Math.random() < mightEat) {
    attemptToEat(agent);
  }

  if (agent.get("eating") >= 0) {
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
