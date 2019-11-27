const AMOUNT_TO_EAT = 0.6;
const TURNS_TO_EAT = 12;

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

export default function tick(agent) {
  agent.increment("hunger", 0.0002);

  if (agent.get("hunger") > 0.7 && agent.get("auto")) {
    attemptToEat(agent);
  }

  if (agent.get("eating") >= 0) {
    eat(agent);
  }

  if (agent.get("eating") === TURNS_TO_EAT) {
    stopEating(agent);
  }
}
