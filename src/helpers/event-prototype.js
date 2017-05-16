export default class EventPrototype {
  // Noops
  stopPropagation() {}
  stopImmediatePropagation() {}

  // if no arguments are passed then the type is set to "undefined" on
  // chrome and safari.
  initEvent(type = 'undefined', bubbles = false, cancelable = false) {
    this.type = String(type);
    this.bubbles = Boolean(bubbles);
    this.cancelable = Boolean(cancelable);
  }
}
