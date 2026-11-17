import { expect, test } from "vitest";
import { freshEnv } from "./helpers";

freshEnv();

test("the catalogue starts with the products of the suite, Maya Studio and Nino Studio included", async () => {
  const { listProducts } = await import("@/server/crm");
  const ids = listProducts(true).map((p) => p.id);
  expect(ids).toEqual(expect.arrayContaining(["lamio", "cairn", "tickup", "alfred", "metricove", "nino", "maya"]));
  // Postmelo Studio now lives inside Metricove.
  expect(ids).not.toContain("postmelo-studio");
});

test("a sale goes from prospect to client, and the dashboard follows", async () => {
  const crm = await import("@/server/crm");
  const company = crm.create("company", { name: "Atelier Rhône", kind: "prospect", email: "Hello@Atelier.ch" }, "Antoine");
  expect(crm.getCompany(company)?.company).toMatchObject({ kind: "prospect", email: "hello@atelier.ch" });

  const deal = crm.create("deal", { company_id: company, product_id: "tickup", title: "10 places TickUp", value_cents: 120000, stage: "proposition" }, "Antoine");
  let d = crm.dashboard();
  expect(d.pipelineOpen).toBe(120000);
  expect(d.pipelineWeighted).toBe(60000);

  crm.update("deal", deal, { stage: "gagne" }, "Antoine");
  expect(crm.getCompany(company)?.company.kind).toBe("client");

  crm.create("license", { company_id: company, product_id: "tickup", seats: 10, price_cents: 9900, status: "actif", renewal_date: "2027-01-01" });
  crm.create("license", { company_id: company, product_id: "lamio", seats: 10, price_cents: 5000, status: "essai" });
  d = crm.dashboard();
  expect(d.mrr).toBe(9900);
  expect(d.arr).toBe(9900 * 12);
  expect(d.activeLicenses).toBe(1);
  expect(d.trialLicenses).toBe(1);
  expect(d.byProduct.find((p) => p.id === "tickup")).toMatchObject({ active: 1, mrr: 9900 });
  expect(d.pipelineOpen).toBe(0);

  // Every step left a trace in the history.
  const journal = crm.getCompany(company)!.activities.map((a) => a.body).join("\n");
  expect(journal).toContain("Opportunité « 10 places TickUp » ouverte.");
  expect(journal).toContain("Proposition → Gagné");
  expect(journal).toContain("Licence TickUp ajoutée");

  expect(crm.listCompanies({ q: "rhône" })).toHaveLength(1);
  expect(crm.listCompanies({ kind: "prospect" })).toHaveLength(0);
});

test("bad input is refused in French, and a product with licences cannot be deleted", async () => {
  const crm = await import("@/server/crm");
  expect(() => crm.create("company", { name: "  " })).toThrow("Le nom manque.");
  expect(() => crm.create("company", { name: "X", kind: "roi" })).toThrow("n'est pas une valeur connue");
  expect(() => crm.create("contact", { company_id: "nope", name: "Léa" })).toThrow("Le client n'existe pas.");
  expect(() => crm.create("license", { company_id: crm.listCompanies()[0].id, product_id: "cairn", seats: 0 })).toThrow("nombre de places");
  expect(() => crm.update("product", "cairn", { color: "violet" })).toThrow("#RRGGBB");
  expect(() => crm.remove("product", "tickup")).toThrow("encore des licences");
  expect(() => crm.update("company", "nope", { name: "Y" })).toThrow("n'existe plus");
});

test("a request from the public site becomes a prospect with a contact, a deal and the message", async () => {
  const crm = await import("@/server/crm");
  const id = crm.recordInquiry({ name: "Léa Martin", email: "lea@studio.ch", company: "Studio Léa", product: "nino", message: "Un podcast par semaine." });
  const page = crm.getCompany(id)!;
  expect(page.company).toMatchObject({ name: "Studio Léa", kind: "prospect" });
  expect(page.contacts).toEqual([expect.objectContaining({ name: "Léa Martin", email: "lea@studio.ch" })]);
  expect(page.deals).toEqual([expect.objectContaining({ title: "Demande Nino Studio", stage: "nouveau", product_id: "nino" })]);
  expect(page.activities.some((a) => a.body === "Un podcast par semaine.")).toBe(true);

  // The same person writing again does not duplicate the company or the contact.
  crm.recordInquiry({ name: "Léa Martin", email: "lea@studio.ch", company: "studio léa", message: "Et Maya ?" });
  const again = crm.getCompany(id)!;
  expect(again.contacts).toHaveLength(1);
  expect(again.deals).toHaveLength(2);

  expect(() => crm.recordInquiry({ name: "Robot", email: "pas-un-mail" })).toThrow("adresse e-mail");
});

test("the CSV export neutralises formulas", async () => {
  const crm = await import("@/server/crm");
  crm.create("company", { name: "=HYPERLINK(\"x\")" });
  const csv = crm.exportCsv("clients");
  expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  expect(crm.exportCsv("licences")).toContain("Atelier Rhône;TickUp");
});
