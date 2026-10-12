import { fireEvent, render, screen } from "@testing-library/react";
import { XIcon } from "lucide-react";
import { vi } from "vitest";
import { ButtonIcon } from "./button-icon";

describe("ButtonIcon", () => {
  it("calls the provided click handler when enabled", () => {
    const onClick = vi.fn();
    render(<ButtonIcon icon={XIcon} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("prevents interactions when disabled", () => {
    const onClick = vi.fn();
    render(<ButtonIcon icon={XIcon} onClick={onClick} disabled />);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
