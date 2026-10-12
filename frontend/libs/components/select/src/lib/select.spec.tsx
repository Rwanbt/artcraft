import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Select } from "./select";

describe("Select", () => {
  it("displays the label corresponding to the selected value", () => {
    render(<Select value="b" options={[{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }]} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Beta/ })).toBeTruthy();
  });

  it("uses placeholder when no option has been selected", () => {
    render(<Select options={[]} placeholder="Choose one" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Choose one/ })).toBeTruthy();
  });
});
