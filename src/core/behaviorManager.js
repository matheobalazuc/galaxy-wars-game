class BehaviorManager {
  constructor(owner) {
    this.owner = owner;
    this.behaviors = new Map();
  }

  addBehavior(name, fn, opts = {}) {
    this.behaviors.set(name, {
      fn,
      enabled: opts.enabled ?? true,
      weight: opts.weight ?? 1
    });
  }

  removeBehavior(name) {
    this.behaviors.delete(name);
  }

  enableBehavior(name) {
    const b = this.behaviors.get(name);
    if (b) b.enabled = true;
  }

  disableBehavior(name) {
    const b = this.behaviors.get(name);
    if (b) b.enabled = false;
  }

  setWeight(name, weight) {
    const b = this.behaviors.get(name);
    if (b) b.weight = weight;
  }

  run(context = {}) {
    const total = createVector(0, 0);
    for (const [, b] of this.behaviors) {
      if (!b.enabled) continue;
      const force = b.fn(this.owner, context);
      if (force && force.copy) {
        total.add(force.copy().mult(b.weight));
      }
    }
    return total;
  }

  saveProfile(name) {
    const payload = [];
    for (const [key, b] of this.behaviors) {
      payload.push({ key, enabled: b.enabled, weight: b.weight });
    }
    localStorage.setItem(`galaxywars.behavior.${name}`, JSON.stringify(payload));
  }

  loadProfile(name) {
    const raw = localStorage.getItem(`galaxywars.behavior.${name}`);
    if (!raw) return false;
    const payload = JSON.parse(raw);
    for (const entry of payload) {
      const b = this.behaviors.get(entry.key);
      if (!b) continue;
      b.enabled = entry.enabled;
      b.weight = entry.weight;
    }
    return true;
  }
}