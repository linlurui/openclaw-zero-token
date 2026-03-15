// Polyfill for browsers that don't support Array.prototype.toSorted (ES2023)
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function<T>(compareFn?: (a: T, b: T) => number): T[] {
    return [...this].sort(compareFn);
  };
}

import "./styles.css";
import "./ui/app.ts";
