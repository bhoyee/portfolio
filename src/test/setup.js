import "@testing-library/jest-dom/vitest";

const IntersectionObserverMock =
  globalThis.IntersectionObserver ||
  class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

// Framer Motion expects IntersectionObserver to exist (jsdom doesn't provide it).
globalThis.IntersectionObserver = IntersectionObserverMock;
if (typeof window !== "undefined") {
  window.IntersectionObserver = IntersectionObserverMock;
}
if (typeof global !== "undefined") {
  global.IntersectionObserver = IntersectionObserverMock;
}
