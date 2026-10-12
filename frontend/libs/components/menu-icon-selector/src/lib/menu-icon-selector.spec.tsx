import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MenuIconSelector } from "./menu-icon-selector";

const menuItems = [
  { id: "image", label: "Image", icon: <span>Image</span> },
  { id: "video", label: "Video", icon: <span>Video</span> },
];

describe("MenuIconSelector", () => {
  it("calls the host when selecting a different menu", () => {
    const onMenuChange = vi.fn();
    render(<MenuIconSelector menuItems={menuItems} activeMenu="image" onMenuChange={onMenuChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Video" }));
    expect(onMenuChange).toHaveBeenCalledExactlyOnceWith("video");
  });

  it("does not change menu while disabled", () => {
    const onMenuChange = vi.fn();
    render(<MenuIconSelector menuItems={menuItems} activeMenu="image" onMenuChange={onMenuChange} disabled />);
    const videoButton = screen.getByRole("button", { name: "Video" }) as HTMLButtonElement;
    expect(videoButton.disabled).toBe(true);
    fireEvent.click(videoButton);
    expect(onMenuChange).not.toHaveBeenCalled();
  });
});
