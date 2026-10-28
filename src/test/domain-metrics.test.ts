import { describe, expect, it } from "vitest";
import { DOMAINS, MODELS, domainMetrics, modelDomainRequests, totalRequests } from "../lib/mock-data";

describe("domain reporting", () => {
  it("reports eight numbered domains", () => {
    expect(DOMAINS).toEqual(["domain1", "domain2", "domain3", "domain4", "domain5", "domain6", "domain7", "domain8"]);
    expect(domainMetrics.map((row) => row.domain)).toEqual(DOMAINS);
    expect(domainMetrics.reduce((sum, row) => sum + row.requestCount, 0)).toBe(totalRequests);
  });

  it("allocates the request-count heatmap across numbered models without losing requests", () => {
    expect(MODELS).toEqual(["model1", "model2", "model3", "model4", "model5", "model6", "model7", "model8"]);
    for (const domain of domainMetrics) {
      const counts = modelDomainRequests.map((row) => row.domains[domain.domain] ?? 0);
      expect(counts.every((count) => Number.isInteger(count) && count >= 0)).toBe(true);
      expect(counts.reduce((sum, count) => sum + count, 0)).toBe(domain.requestCount);
    }
  });
});