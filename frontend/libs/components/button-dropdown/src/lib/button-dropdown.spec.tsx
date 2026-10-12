import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ButtonDropdown } from "./button-dropdown";

describe("ButtonDropdown", () => {
  it("opens the menu and invokes the chosen action exactly once", async () => {
    const duplicate = vi.fn();
    const user = userEvent.setup();
    render(<ButtonDropdown label="Actions" options={[{ label: "Duplicate", onClick: duplicate }]} />);

    // The menu's action is intentionally hidden until the user opens it.
    expect(screen.queryByRole("menuitem", { name: "Duplicate" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Duplicate" }));
    expect(duplicate).toHaveBeenCalledOnce();
  });

  it("does not execute a disabled action", async () => {
    const deleteFile = vi.fn();
    const user = userEvent.setup();
    render(<ButtonDropdown label="Actions" options={[{ label: "Delete", onClick: deleteFile, disabled: true }]} />);

    await user.click(screen.getByRole("button", { name: "Actions" }));
    const action = await screen.findByRole("menuitem", { name: "Delete" });
    expect(action.hasAttribute("disabled")).toBe(true);
    await user.click(action);
    expect(deleteFile).not.toHaveBeenCalled();
  });
});
