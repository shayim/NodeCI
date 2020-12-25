const puppeteer = require('puppeteer')
const sessionFactory = require('../factories/session.factory')
const userFactory = require('../factories/user.factory')

module.exports = class Page {
  static async build() {
    const browser = await puppeteer.launch({ headless: true, args:['--no-sandbox'] })
    const page = await browser.newPage()
    const customPage = new Page(page)

    return new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || browser[property] || page[property]
      }
    })
  }

  constructor(page) {
    this.page = page
  }

  async login() {
    if(!this.user) { this.user = await userFactory() }
    const { session, session_sig } = sessionFactory(this.user)

    await this.page.setCookie(
      { name: 'session', value: session },
      { name: 'session.sig', value: session_sig }
    )
    await this.page.goto('http://localhost:3000/blogs')
    await this.page.waitFor('a[href="/auth/logout"]')
  }
}
