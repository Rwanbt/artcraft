import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its label and optional icon", () => {
    render(<Badge label="Draft" icon={<span aria-label="status-icon">!</span>} />);
    expect(screen.getByText("Draft")).toBeTruthy();
    expect(screen.getByLabelText("status-icon")).toBeTruthy();
  });

  it("applies a caller-specified CSS class", () => {
    render(<Badge label="Ready" className="custom-status" />);
    expect(screen.getByText("Ready").className).toContain("custom-status");
  });
});
