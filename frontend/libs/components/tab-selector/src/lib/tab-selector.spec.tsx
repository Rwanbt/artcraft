import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { TabSelector } from "./tab-selector";

const tabs = [
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
];

describe("TabSelector", () => {
  it("reports the selected tab id", () => {
    const onTabChange = vi.fn();
    render(<TabSelector tabs={tabs} activeTab="image" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByRole("tab", { name: "Video" }));
    expect(onTabChange).toHaveBeenCalledWith("video");
  });

  it("disables all tabs when the group is disabled", () => {
    const onTabChange = vi.fn();
    render(<TabSelector tabs={tabs} activeTab="image" onTabChange={onTabChange} disabled />);
    const videoTab = screen.getByRole("tab", { name: "Video" }) as HTMLButtonElement;
    expect(videoTab.disabled).toBe(true);
    fireEvent.click(videoTab);
    expect(onTabChange).not.toHaveBeenCalled();
  });
});
