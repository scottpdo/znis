import { Agent, utils } from "flocc";
import {
  SECONDS_PER_TICK,
  MINUTES_PER_TICK,
  HOURS_PER_TICK
} from "../utils/time";
import names from "../data/names";
import Relationship from "./relationship";
import interests from "../data/interests";

const AMOUNT_TO_EAT = 0.7;
// eat AMOUNT_TO_EAT in 10 minutes
const TURNS_TO_EAT = 10 / MINUTES_PER_TICK;

// recover fully in 8 hours
const RATE_OF_REST = (1 / 8) * HOURS_PER_TICK;

export default class SocialAgent extends Agent {
  constructor(environment) {
    super();
    this.set({
      eating: -1,
      hunger: utils.random(0, 0.7, true),
      interests: utils.sample(interests),
      tired: utils.random(0, 0.8, true),
      sleeping: -1,
      auto: true,
      name: names.pop(),
      relationships: new Map()
    });
    environment.addAgent(this);
  }

  isEating() {
    return this.get("eating") >= 0;
  }

  isSleeping() {
    return this.get("sleeping") >= 0;
  }

  attemptToEat() {
    const eatery = this.environment.get("eatery");
    if (eatery.isFull()) return false;
    eatery.addAgent(this);
    this.set("eating", 0);

    // when a new agent begins eating, they form a relationship
    // with agents already at the eatery
    if (eatery.agents.length > 1) {
      eatery.agents
        .filter(a => a !== this)
        .forEach(a => {
          if (
            !a.get("relationships").get(this) &&
            !this.get("relationships").get(a)
          ) {
            const r = new Relationship(this, a);
            a.get("relationships").set(this, r);
            this.get("relationships").set(a, r);
          } else {
            this.get("relationships")
              .get(a)
              .incrementBoth();
          }
        });
    }

    return true;
  }

  eat() {
    this.increment("eating");
    this.decrement("hunger", AMOUNT_TO_EAT / TURNS_TO_EAT);
    this.set("hunger", Math.max(this.get("hunger"), 0));

    if (this.get("eating") === TURNS_TO_EAT) {
      this.stopEating();
    }
  }

  stopEating() {
    this.environment.get("eatery").removeAgent(this);
    this.set("eating", -1);
  }

  sleep() {
    this.increment("sleeping");
    this.decrement("tired", RATE_OF_REST);
    this.set("tired", Math.max(this.get("tired"), 0));

    if (this.get("tired") === 0) this.wakeUp();
  }

  wakeUp() {
    this.set("sleeping", -1);
  }

  talkTo(agent) {
    const relationship = this.get("relationships").get(agent);
    if (!relationship) {
      this.get("relationships").set(agent, new Relationship(this, agent));
    } else {
      relationship.incrementBoth();
    }
  }
}
