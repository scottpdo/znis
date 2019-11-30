import { Agent, utils } from "flocc";
import names from "../data/names";

export default class SocialAgent extends Agent {
  constructor() {
    super();
    this.set({
      eating: -1,
      hunger: utils.random(0, 0.7, true),
      tired: utils.random(0, 0.5, true),
      sleeping: -1,
      auto: true,
      name: utils.sample(names),
      relationships: new Map()
    });
  }
}
