import { test } from "../fixtures/PageFixtures";

test.describe("Authentication", () => {
  test("should be able to login", async ({ loginPage }) => {
    await loginPage.login("admin", "password");
  });
});
