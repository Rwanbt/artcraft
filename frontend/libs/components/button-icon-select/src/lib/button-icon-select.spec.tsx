import { fireEvent, render, screen } from "@testing-library/react";
import { EraserIcon, PencilIcon } from "lucide-react";
import { vi } from "vitest";
import { ButtonIconSelect } from "./button-icon-select";

const options = [
  { value: "draw", icon: PencilIcon, text: "Draw" },
  { value: "erase", icon: EraserIcon, text: "Erase" },
];

describe("ButtonIconSelect", () => {
  it("starts with the first option selected and reports changes", () => {
    const onOptionChange = vi.fn();
    render(<ButtonIconSelect options={options} onOptionChange={onOptionChange} />);
    const draw = screen.getByRole("button", { name: "Draw" });
    expect(draw.className).toContain("border-brand-primary");
    fireEvent.click(screen.getByRole("button", { name: "Erase" }));
    expect(onOptionChange).toHaveBeenCalledExactlyOnceWith("erase");
    expect(screen.getByRole("button", { name: "Erase" }).className).toContain("border-brand-primary");
  });
});
