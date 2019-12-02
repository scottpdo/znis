import { Environment } from "flocc";

export default class SocialEnvironment extends Environment {
  directory = {};

  getAgentByName(name) {
    if (this.directory[name]) return this.directory[name];
    const agent = this.getAgents().find(
      a => a.get("name").toLowerCase() === name
    );
    if (agent) {
      this.directory[name] = agent;
      return agent;
    }
    return null;
  }
}
