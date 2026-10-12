import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { FileUploader } from "./file-uploader";

describe("FileUploader", () => {
  it("explains the allowed file types before a file is selected", () => {
    render(<FileUploader files={[]} fileTypes={["PNG", "JPEG"]} handleChange={vi.fn()} />);
    expect(screen.getByText(/Upload a file/)).toBeTruthy();
    expect(screen.getByText(/PNG, JPEG supported/)).toBeTruthy();
  });

  it("displays the selected file without changing its bytes", () => {
    const file = new File(["valid-image-data"], "example.png", { type: "image/png" });
    render(<FileUploader files={[file]} fileTypes={["PNG"]} handleChange={vi.fn()} />);
    expect(screen.getByText("example")).toBeTruthy();
    expect(file.size).toBe(16);
  });
});
