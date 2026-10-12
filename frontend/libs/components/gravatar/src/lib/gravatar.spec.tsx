import { fireEvent, render, screen } from "@testing-library/react";
import { Gravatar } from "./gravatar";

describe("Gravatar", () => {
  it("displays the user's accessible name and requested dimensions", () => {
    render(<Gravatar size={64} username="Sample" email_hash="abc123" />);
    const image = screen.getByAltText("Sample's gravatar") as HTMLImageElement;
    expect(image.width).toBe(64);
    expect(image.height).toBe(64);
  });

  it("falls back to a local avatar when the remote image fails", () => {
    render(<Gravatar size={32} username="Sample" email_hash="bad" />);
    const image = screen.getByAltText("Sample's gravatar") as HTMLImageElement;
    fireEvent.error(image);
    expect(image.getAttribute("src")).toBe("/resources/avatars/0.webp");
  });
});
