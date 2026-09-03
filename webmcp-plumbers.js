/**
 * Thin WebMCP tools for the Tampa plumbers directory.
 * Progressive enhancement: page works without WebMCP.
 * Spec: document.modelContext.registerTool (Chrome WebMCP / WebMCP Challenge 2026)
 */
(function () {
  "use strict";

  const DATA_URL = new URL("./tampa-plumbers.json", document.baseURI).href;
  let plumbersCache = null;

  async function loadPlumbers() {
    if (plumbersCache) return plumbersCache;
    const res = await fetch(DATA_URL, { credentials: "same-origin" });
    if (!res.ok) throw new Error("Failed to load tampa-plumbers.json (" + res.status + ")");
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("tampa-plumbers.json must be an array");
    plumbersCache = data;
    return plumbersCache;
  }

  function summarize(p) {
    return {
      name: p.name,
      city: p.city,
      website: p.website,
      phone: p.phone || null,
    };
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function matchesQuery(p, city, name) {
    const cityQ = city ? norm(city) : "";
    const nameQ = name ? norm(name) : "";
    if (cityQ && !norm(p.city).includes(cityQ)) return false;
    if (nameQ && !norm(p.name).includes(nameQ)) return false;
    return true;
  }

  function findOne(name) {
    const q = norm(name);
    if (!q) return null;
    const exact = plumbersCache.find((p) => norm(p.name) === q);
    if (exact) return exact;
    const partial = plumbersCache.filter((p) => norm(p.name).includes(q));
    if (partial.length === 1) return partial[0];
    return null;
  }

  function modelContext() {
    const ctx = document.modelContext || navigator.modelContext;
    if (ctx && typeof ctx.registerTool === "function") return ctx;
    return null;
  }

  async function registerTools() {
    const ctx = modelContext();
    if (!ctx) {
      console.info("[webmcp] document.modelContext unavailable — tools not registered (enable chrome://flags/#enable-webmcp-testing or use ChatGPT in-app browser).");
      return;
    }

    await loadPlumbers();

    await ctx.registerTool({
      name: "list_plumbers",
      description:
        "List all independent Tampa Bay plumbers in this directory (name, city, website, phone). Public business info only.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      async execute() {
        const list = await loadPlumbers();
        return {
          count: list.length,
          plumbers: list.map(summarize),
          source: DATA_URL,
        };
      },
    });

    await ctx.registerTool({
      name: "search_plumbers",
      description:
        "Search Tampa Bay plumbers by city and/or shop name (case-insensitive substring). Provide at least one of city or name.",
      inputSchema: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "City filter, e.g. Tampa, Clearwater, St. Petersburg, Riverview",
          },
          name: {
            type: "string",
            description: "Shop name substring, e.g. Titan, Cass, On Tap",
          },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      async execute(input) {
        const city = (input && input.city) || "";
        const name = (input && input.name) || "";
        if (!String(city).trim() && !String(name).trim()) {
          return {
            error: "Provide at least one of: city, name",
            count: 0,
            plumbers: [],
          };
        }
        const list = await loadPlumbers();
        const matches = list.filter((p) => matchesQuery(p, city, name)).map(summarize);
        return {
          count: matches.length,
          query: { city: city || null, name: name || null },
          plumbers: matches,
        };
      },
    });

    await ctx.registerTool({
      name: "get_plumber",
      description:
        "Get one plumber shop’s full directory record by name (exact match preferred; unique partial match accepted). Returns name, city, website, phone, and source_url.",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Shop name as listed in the directory",
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      async execute(input) {
        const name = input && input.name;
        if (!name || !String(name).trim()) {
          return { error: "name is required", plumber: null };
        }
        await loadPlumbers();
        const hit = findOne(name);
        if (!hit) {
          const suggestions = plumbersCache
            .filter((p) => norm(p.name).includes(norm(name)))
            .slice(0, 5)
            .map((p) => p.name);
          return {
            error: "No unique match",
            plumber: null,
            suggestions,
          };
        }
        return {
          plumber: {
            name: hit.name,
            city: hit.city,
            website: hit.website,
            phone: hit.phone || null,
            source_url: hit.source_url || hit.website || null,
          },
        };
      },
    });

    console.info("[webmcp] Registered tools: list_plumbers, search_plumbers, get_plumber");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      registerTools().catch(function (err) {
        console.error("[webmcp] registration failed", err);
      });
    });
  } else {
    registerTools().catch(function (err) {
      console.error("[webmcp] registration failed", err);
    });
  }
})();
