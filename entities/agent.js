import { Agent, utils } from "flocc";
import { intersection } from "lodash";
import {
  SECONDS_PER_TICK,
  MINUTES_PER_TICK,
  HOURS_PER_TICK
} from "../utils/time";
import names from "../data/names";
import Relationship from "./relationship";
import interests from "../data/interests";
import { STATUS_CODES } from "../entities/status";

const AMOUNT_TO_EAT = 0.7;
// eat AMOUNT_TO_EAT in 10 minutes
const TURNS_TO_EAT = 10 / MINUTES_PER_TICK;

// recover fully in 8 hours
const RATE_OF_REST = (1 / 8) * HOURS_PER_TICK;

const STATUSES = {
  AVAILABLE: "available",
  EATING: "eating",
  SLEEPING: "sleeping"
};

export const ACTIONS = {
  EAT: "eat",
  SLEEP: "sleep",
  TALK_TO: "talkTo"
};

export default class SocialAgent extends Agent {
  constructor(environment) {
    super();
    this.set({
      eating: -1,
      hunger: utils.random(0, 0.7, true),
      interests: new Array(3).fill(0).map(a => utils.sample(interests)),
      tired: utils.random(0, 0.8, true),
      sleeping: -1,
      status: STATUSES.AVAILABLE,
      auto: true,
      name: names.pop(),
      relationships: new Map()
    });
    environment.addAgent(this);
  }

  isAvailable() {
    return this.get("status") === STATUSES.AVAILABLE;
  }

  isEating() {
    return this.get("status") === STATUSES.EATING;
  }

  isSleeping() {
    return this.get("status") === STATUSES.SLEEPING;
  }

  attemptToEat() {
    const eatery = this.environment.get("eatery");

    if (eatery.isFull() || this.isEating() || this.isSleeping()) {
      const message = this.isEating()
        ? "already eating"
        : this.isSleeping()
        ? "can't eat while sleeping"
        : eatery.isFull()
        ? "too crowded to eat"
        : "";
      return {
        status: STATUS_CODES.FAILURE,
        message
      };
    }

    eatery.addAgent(this);
    this.set("status", STATUSES.EATING);
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

    return {
      status: STATUS_CODES.OK,
      message: "ate"
    };
  }

  eat() {
    this.increment("eating");
    this.decrement("hunger", AMOUNT_TO_EAT / TURNS_TO_EAT);
    this.set("hunger", Math.max(this.get("hunger"), 0));

    if (this.get("eating") === TURNS_TO_EAT) this.stopEating();
  }

  stopEating() {
    this.environment.get("eatery").removeAgent(this);
    this.set("eating", -1);
    this.set("status", STATUSES.AVAILABLE);
  }

  attemptToSleep() {
    if (!this.isAvailable()) {
      return {
        status: STATUS_CODES.FAILURE,
        message: this.isEating()
          ? "can't sleep while eating"
          : this.isSleeping()
          ? "already sleeping"
          : ""
      };
    }

    this.set("status", STATUSES.SLEEPING);
    this.sleep();

    return {
      status: STATUS_CODES.OK,
      message: "went to sleep"
    };
  }

  sleep() {
    this.increment("sleeping");
    this.decrement("tired", RATE_OF_REST);
    this.set("tired", Math.max(this.get("tired"), 0));
    this.set("status", STATUSES.SLEEPING);

    if (this.get("tired") === 0) this.wakeUp();
  }

  wakeUp() {
    this.set("status", STATUSES.AVAILABLE);
    this.set("sleeping", -1);
  }

  attemptToTalkTo(agent) {
    const eatery = this.environment.get("eatery");
    if (!this.isAvailable()) {
      // handle case where both agents are at the eatery
      if (this.isEating() && eatery.agents.includes(agent)) {
        this.talkTo(agent);
        return {
          status: STATUSES.OK,
          message: `talked to ${agent.get("name")} while eating`
        };
      }
      return {
        status: STATUSES.FAILURE,
        message: this.isSleeping()
          ? "can't socialize while sleeping"
          : this.isEating()
          ? `${agent.get("name")} is not nearby`
          : ""
      };
    }
    if (agent.isSleeping()) {
      return {
        status: STATUSES.FAILURE,
        message: `${agent.get("name")} is sleeping`
      };
    }
    if (eatery.agents.includes(agent)) {
      return {
        status: STATUSES.FAILURE,
        message: `${agent.get("name")} is not nearby`
      };
    }
    this.talkTo(agent);
    return {
      status: STATUSES.OK,
      message: `talked to ${agent.get("name")}`
    };
  }

  talkTo(agent) {
    const relationship = this.get("relationships").get(agent);
    if (!relationship) {
      this.get("relationships").set(agent, new Relationship(this, agent));
    } else {
      relationship.incrementBoth();
      intersection(this.get("interests"), agent.get("interests")).forEach(() =>
        relationship.incrementBoth()
      );
    }
  }
}
