import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCandidateUrl, classifyCandidate, extractUrls, isEligibleMetadata } from "../scripts/rabbit-holes-ingest.mjs";

test("normalizes public web URLs and removes tracking parameters", () => {
  assert.equal(normalizeCandidateUrl("https://Example.com/demo/?utm_source=hn&x=1#section"), "https://example.com/demo?x=1");
  assert.equal(normalizeCandidateUrl("http://127.0.0.1/admin"), null);
  assert.equal(normalizeCandidateUrl("https://github.com/example/project"), null);
  assert.equal(normalizeCandidateUrl("https://name:secret@example.com/"), null);
});

test("classifies discovery types without treating arbitrary websites as recommendations", () => {
  assert.deepEqual(classifyCandidate("An interactive map of the solar system"), ["Interactive", "Visualizations"]);
  assert.deepEqual(classifyCandidate("A puzzle game in your browser"), ["Games", "Interactive"]);
  assert.deepEqual(classifyCandidate("A simple landing page"), []);
});

test("extracts HTML-escaped URLs from Hacker News comments", () => {
  assert.deepEqual(extractUrls('<a href="https:&#x2F;&#x2F;example.com&#x2F;path?a=1&amp;b=2">link</a>'), ["https://example.com/path?a=1&b=2"]);
});

test("rejects parked, repurposed and unverifiable websites", () => {
  const candidate = { title: "A browser puzzle game", url: "https://example.com/puzzle", categories: ["Games"] };
  assert.equal(isEligibleMetadata(candidate, { status: "ok", requestedUrl: candidate.url, url: candidate.url, title: "Example Puzzle", description: "A playful puzzle game in your browser." }), true);
  assert.equal(isEligibleMetadata(candidate, { status: "ok", requestedUrl: candidate.url, url: candidate.url, title: "Casino Slots", description: "Online gambling games." }), false);
  assert.equal(isEligibleMetadata(candidate, { status: "ok", requestedUrl: candidate.url, url: candidate.url, title: "Example Puzzle", description: "This game is no longer playable." }), false);
  assert.equal(isEligibleMetadata(candidate, { status: "ok", requestedUrl: candidate.url, url: candidate.url, title: "Buy Puzzle.example | Marketplace", description: "Own Puzzle.example today. Secure checkout and guided transfer support." }), false);
  assert.equal(isEligibleMetadata(candidate, { status: "ok", requestedUrl: candidate.url, url: candidate.url, title: "Puzzle.example is for sale", description: "A great premium domain available for sale." }), false);
  assert.equal(isEligibleMetadata(candidate, { status: "ok", requestedUrl: candidate.url, url: candidate.url, title: "", description: "" }), false);
  assert.equal(isEligibleMetadata(candidate, { status: "ok", requestedUrl: candidate.url, url: "https://other.example.net/", title: "Example Puzzle", description: "A playful puzzle game." }), false);
  assert.equal(isEligibleMetadata(candidate, { status: "ok", requestedUrl: "https://example.com/another", url: candidate.url, title: "Example Puzzle", description: "A playful puzzle game." }), false);
  const sensitive = { ...candidate, url: "https://example.com/puzzle?access_token=example" };
  assert.equal(isEligibleMetadata(sensitive, { status: "ok", requestedUrl: sensitive.url, url: sensitive.url, title: "Example Puzzle", description: "A playful puzzle game." }), false);
});
