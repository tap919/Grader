import { describe, it, expect } from "vitest";

// Inline the function to avoid importing from a file with ESM + top-level side effects (dotenv, express, etc.)
function parseRepoInput(input: string): { owner: string; repo: string } | null {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "");
  cleaned = cleaned.replace(/\.git$/i, "").replace(/\/+$/, "");
  const parts = cleaned.split("/");
  if (parts.length >= 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

describe("parseRepoInput", () => {
  it("parses owner/repo format", () => {
    expect(parseRepoInput("facebook/react")).toEqual({ owner: "facebook", repo: "react" });
  });

  it("parses full GitHub URL", () => {
    expect(parseRepoInput("https://github.com/vercel/next.js")).toEqual({ owner: "vercel", repo: "next.js" });
  });

  it("parses GitHub URL without protocol", () => {
    expect(parseRepoInput("github.com/torvalds/linux")).toEqual({ owner: "torvalds", repo: "linux" });
  });

  it("parses URL with www prefix", () => {
    expect(parseRepoInput("https://www.github.com/microsoft/vscode")).toEqual({ owner: "microsoft", repo: "vscode" });
  });

  it("strips .git suffix", () => {
    expect(parseRepoInput("user/my-repo.git")).toEqual({ owner: "user", repo: "my-repo" });
  });

  it("strips trailing slashes", () => {
    expect(parseRepoInput("user/repo/")).toEqual({ owner: "user", repo: "repo" });
  });

  it("handles URL with .git suffix", () => {
    expect(parseRepoInput("https://github.com/user/repo.git")).toEqual({ owner: "user", repo: "repo" });
  });

  it("returns null for single part input", () => {
    expect(parseRepoInput("just-a-name")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseRepoInput("")).toBeNull();
  });

  it("trims whitespace", () => {
    expect(parseRepoInput("  owner/repo  ")).toEqual({ owner: "owner", repo: "repo" });
  });

  it("is case insensitive for github.com", () => {
    expect(parseRepoInput("HTTPS://GITHUB.COM/OWNER/REPO")).toEqual({ owner: "OWNER", repo: "REPO" });
  });
});
