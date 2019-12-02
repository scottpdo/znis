import { utils } from "flocc";

const HUNGER_GAIN = 0.0002;
const HUNGER_GAIN_WHILE_SLEEPING = 0.00005;
const TIRED_GAIN = 0.0001;

/**
 * If value >= always, returns true.
 * If value < never, returns false.
 * Otherwise, returns false or true, increasing sharply
 * as value approaches always.
 */
function CDF(value, never, always) {
  if (value < never) return false;
  const r = Math.random();
  const x = utils.remap(Math.max(value, never), never, always, 0, 1) ** 4;
  return r < x;
}

export default function tick(agent) {
  // if not eating, increment hunger
  // (different amount if sleeping or not)
  if (!agent.isEating()) {
    agent.increment(
      "hunger",
      agent.isSleeping() ? HUNGER_GAIN_WHILE_SLEEPING : HUNGER_GAIN
    );
  }

  // if not sleeping, become more tired
  if (agent.get("sleeping") < 0) agent.increment("tired", TIRED_GAIN);

  const hunger = agent.get("hunger");
  const willEat =
    !agent.isSleeping() && agent.get("auto") && CDF(hunger, 0.7, 1);
  // if currently eating, continue to eat
  if (agent.isEating()) {
    agent.eat();
    // if not sleeping, and an auto agent, and
    // `mightEat` is above threshold, then attempt to eat
  } else if (willEat) {
    agent.attemptToEat();
  }

  const willSleep =
    (agent.isSleeping() && !agent.isEating()) ||
    (agent.get("auto") && CDF(agent.get("tired"), 0.85, 1));
  if (willSleep) agent.sleep();
}
