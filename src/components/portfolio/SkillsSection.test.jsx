import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import SkillsSection from "./SkillsSection";

describe("SkillsSection", () => {
  it("uses a readable desktop grid (not 5 tiny columns)", () => {
    const { container } = render(<SkillsSection />);

    // Locate the grid container by finding a known skill group title and walking up.
    const heading = screen.getByRole("heading", { name: "Frontend" });
    const grid = heading.closest("div")?.parentElement?.parentElement;

    expect(grid?.className).toContain("lg:grid-cols-2");
    expect(grid?.className).not.toContain("xl:grid-cols-5");
    expect(container).toBeTruthy();
  });
});

