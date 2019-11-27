export default class Eatery {
  static MAX_SIZE = 3;

  constructor() {
    this.agents = [];
  }

  addAgent(agent) {
    if (!this.isFull()) this.agents.push(agent);
  }

  removeAgent(agent) {
    if (this.agents.indexOf(agent) >= 0) {
      this.agents.splice(this.agents.indexOf(agent), 1);
    }
  }

  isFull() {
    return this.agents.length === Eatery.MAX_SIZE;
  }
}
