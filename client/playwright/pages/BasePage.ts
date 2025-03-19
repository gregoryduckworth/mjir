import { Page } from "@playwright/test";
import { BASE_URL } from "../../../playwright.config";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = "/") {
    const url = `${BASE_URL}/${path}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }
}
