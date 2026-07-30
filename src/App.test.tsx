import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders links to both training programs", () => {
  render(<App />);

  expect(screen.getByRole("link", { name: /general awareness training/i })).toHaveAttribute(
    "href",
    "#awareness"
  );
  expect(screen.getByRole("link", { name: /software development security/i })).toHaveAttribute(
    "href",
    "#sdlc"
  );
});
