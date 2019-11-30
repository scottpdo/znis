export default class Relationship {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.atob = 0;
    this.btoa = 0;
  }

  incrementA() {
    this.atob++;
  }

  incrementB() {
    this.btoa++;
  }

  incrementBoth() {
    this.incrementA();
    this.incrementB();
  }
}
