import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ButtonDropdown } from "./button-dropdown";

describe("ButtonDropdown", () => {
  it("renders actions and calls the selected action", () => {
    const duplicate = vi.fn();
    render(<ButtonDropdown label="Actions" options={[{ label: "Duplicate", onClick: duplicate }]} />);
    expect(screen.getByText("Actions")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Duplicate/ }));
    expect(duplicate).toHaveBeenCalledOnce();
  });
});
