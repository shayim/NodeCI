
const Page = require('./helpers/page') 

let page

beforeEach(async () => {
  page = await Page.build()
  await page.goto('http://localhost:3000')
})

afterEach(async () => {
  await page.close()
})

test('the header has the correct logo text', async () => {
  const logoText = await page.$eval('a.left.brand-logo', (el) => el.innerHTML)

  expect(logoText).toEqual('Blogster')
})

test('clicking login start oauth flow', async () => {
  await page.click('a[href="/auth/google"]')

  const url = page.url()

  expect(url).toContain('https://accounts.google.com')
})

test('when signed in, show logout button', async () => {
  await page.login()

  const logoutText = await page.$eval(
    'a[href="/auth/logout"]',
    (el) => el.innerHTML
  )

  expect(logoutText).toEqual('Logout')
})


