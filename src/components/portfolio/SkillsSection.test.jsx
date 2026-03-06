import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import SkillsSection from "./SkillsSection";

describe("SkillsSection", () => {
  it("uses a readable desktop grid (not 5 tiny columns)", () => {
    render(<SkillsSection />);

    const grid = screen.getByTestId("skills-grid");
    expect(grid.className).toContain("lg:grid-cols-2");
    expect(grid.className).not.toContain("xl:grid-cols-5");
  });
});
