import { Page } from "@playwright/test";

export class BasePage {
  readonly page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url?: string) {
    await this.page.goto(`http://localhost:5001${url ? `/${url}` : ""}`);
    await this.page.waitForLoadState("domcontentloaded");
  }
}
