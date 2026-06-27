import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreGauge from "../components/ScoreGauge";

describe("ScoreGauge", () => {
  it("renders the score value", () => {
    render(<ScoreGauge score={85} category="B" />);
    expect(screen.getByText("85")).toBeDefined();
  });

  it("renders grade category", () => {
    render(<ScoreGauge score={95} category="A" />);
    expect(screen.getByText("Grade A")).toBeDefined();
  });

  it("renders health label for high score", () => {
    render(<ScoreGauge score={95} category="A" />);
    expect(screen.getByText("Solid/Healthy")).toBeDefined();
  });

  it("renders at risk label for low score", () => {
    render(<ScoreGauge score={30} category="F" />);
    expect(screen.getByText("At Risk")).toBeDefined();
  });
});
