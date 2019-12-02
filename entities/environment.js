import { Environment } from "flocc";
import Fuse from "fuse.js";

export default class SocialEnvironment extends Environment {
  directory = {};

  getAgentByName(name) {
    if (this.directory[name]) return this.directory[name];
    const fuse = new Fuse(this.getAgents(), {
      includeScore: true,
      keys: ["data.name"],
      minMatchCharLength: 3,
      threshold: 0.01
    });
    const search = fuse.search(name);
    if (search.length > 0) {
      const agent = search[0].item;
      this.directory[name] = agent;
      return agent;
    }
    return null;
  }
}
