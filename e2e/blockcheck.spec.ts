import { expect, test } from "@playwright/test";

const first = {
  label: "350 5 AVENUE, New York, NY, USA",
  houseNumber: "350",
  street: "5 AVENUE",
  borough: "Manhattan",
  postcode: "10118",
  latitude: 40.748441,
  longitude: -73.985656,
  bbl: "1008350041",
  bin: "1015862",
};
const second = {
  label: "20 HENRY STREET, Brooklyn, NY, USA",
  houseNumber: "20",
  street: "HENRY STREET",
  borough: "Brooklyn",
  postcode: "11201",
  latitude: 40.70094,
  longitude: -73.99369,
  bbl: "3000000001",
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/search?*", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      json: {
        results: url.searchParams.get("q")?.includes("20") ? [second] : [first],
      },
    });
  });
});

test("homepage search selects an address and opens its report", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "NYC address" }).fill("350 5");
  await page.getByRole("option", { name: /350 5 avenue/i }).click();
  await expect(
    page.getByRole("heading", { name: /350 5 avenue/i }),
  ).toBeVisible();
  await expect(page.getByText("Building Health Indicator")).toBeVisible();
});

test("report comparison can add a second address", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "NYC address" }).fill("350 5");
  await page.getByRole("option", { name: /350 5 avenue/i }).click();
  await page.getByRole("link", { name: "Compare this address" }).click();
  await page.getByRole("combobox", { name: "NYC address" }).fill("20 Henry");
  await page.getByRole("option", { name: /20 henry street/i }).click();
  await expect(
    page.getByRole("columnheader", { name: /20 henry street/i }),
  ).toBeVisible();
});
