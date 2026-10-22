import { describe, expect, it } from "vitest";
import { parseIntent } from "@/lib/ai/intentParser";

describe("parseIntent", () => {
  it("parses a swap/replace command", () => {
    const intent = parseIntent("Day 2 evening may rain, swap to something indoor");
    expect(intent.type).toBe("swap");
    if (intent.type === "swap") {
      expect(intent.day).toBe(2);
      expect(intent.timeOfDay).toBe("evening");
      expect(intent.reason).toBe("rain");
    }
  });

  it("parses a replace-with-cheaper command", () => {
    const intent = parseIntent("Replace the day 1 lunch with a cheaper place");
    expect(intent.type).toBe("swap");
    if (intent.type === "swap") {
      expect(intent.day).toBe(1);
      expect(intent.reason).toBe("cheap");
    }
  });

  it("parses an add command", () => {
    const intent = parseIntent("Add a cafe on day 3 afternoon");
    expect(intent.type).toBe("add");
    if (intent.type === "add") {
      expect(intent.day).toBe(3);
      expect(intent.timeOfDay).toBe("afternoon");
      expect(intent.category).toBe("cafe");
    }
  });

  it("parses a remove command", () => {
    const intent = parseIntent("Remove the market visit");
    expect(intent.type).toBe("remove");
    if (intent.type === "remove") {
      expect(intent.target).toContain("market");
    }
  });

  it("parses a move command", () => {
    const intent = parseIntent("Move City Palace to day 2 morning");
    expect(intent.type).toBe("move");
    if (intent.type === "move") {
      expect(intent.day).toBe(2);
      expect(intent.timeOfDay).toBe("morning");
      expect(intent.target.toLowerCase()).toContain("city palace");
    }
  });

  it("parses a relax-the-pace command", () => {
    const intent = parseIntent("Make day 1 more relaxed");
    expect(intent.type).toBe("pace");
    if (intent.type === "pace") {
      expect(intent.direction).toBe("relax");
      expect(intent.day).toBe(1);
    }
  });

  it("parses a pack-more-in pace command", () => {
    const intent = parseIntent("Pack more into day 3");
    expect(intent.type).toBe("pace");
    if (intent.type === "pace") {
      expect(intent.direction).toBe("pack");
      expect(intent.day).toBe(3);
    }
  });

  it("parses a budget-fit command with an amount", () => {
    const intent = parseIntent("Fit the plan into ₹20,000");
    expect(intent.type).toBe("budget");
    if (intent.type === "budget") {
      expect(intent.amount).toBe(20000);
    }
  });

  it("parses a weather question", () => {
    const intent = parseIntent("What's the weather on day 2?");
    expect(intent.type).toBe("weatherQuestion");
    if (intent.type === "weatherQuestion") {
      expect(intent.day).toBe(2);
    }
  });

  it("parses a spending question", () => {
    const intent = parseIntent("How much have I spent on food?");
    expect(intent.type).toBe("spendingQuestion");
    if (intent.type === "spendingQuestion") {
      expect(intent.category).toBe("food");
    }
  });

  it("parses a places question", () => {
    const intent = parseIntent("Suggest vegetarian food near my hotel");
    expect(intent.type).toBe("placesQuestion");
  });

  it("parses a naturally-phrased places question", () => {
    const intent = parseIntent("where do i eat if i want italian");
    expect(intent.type).toBe("placesQuestion");
  });

  it("falls back to unknown for an unsupported request", () => {
    const intent = parseIntent("Book me a flight to Mars");
    expect(intent.type).toBe("unknown");
  });
});
