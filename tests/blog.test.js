const Page = require('./helpers/page')

let page
beforeEach(async () => {
  page = await Page.build()
  await page.goto('http://localhost:3000')
})

afterEach(async () => {
  await page.close()
})

describe('when loged in, then click create new blog', async () => {
  beforeEach(async () => {
    await page.login()
    await page.click('a[href="/blogs/new"]')
    await page.waitFor('button[type="submit"]')
  })

  test('can see blog create form', async () => {
    const submitBtnText = await page.$eval(
      'button[type="submit"]',
      (btn) => btn.innerHTML
    )

    expect(submitBtnText).toMatch(/Next/)
  })

  describe('and enter invalid inputs and submit', async () => {
    beforeEach(async () => {
      await page.click('button[type="submit"]')
    })
    test('the form shows an error message', async () => {
      const titleError = await page.$eval(
        'input[name="title"] + div',
        (div) => div.innerHTML
      )
      const contentError = await page.$eval(
        'input[name="content"] + div',
        (div) => div.innerHTML
      )
      expect(titleError).toMatch(/You must provide a value/)
      expect(contentError).toMatch(/You must provide a value/)
    })
  })

  describe('and enter valid inputs and submit', async () => {
    const blogTitle = 'test blog 1'
    const blogContent = 'test blog 1 content'

    beforeEach(async () => {
      await page.type('input[name="title"]', blogTitle)
      await page.type('input[name="content"]', blogContent)
      await page.click('button[type="submit"]')
      await page.waitFor('button.green')
    })

    test('should show review page', async () => {
      const formTitle = await page.$eval('form h5', (h5) => h5.innerHTML)

      expect(formTitle).toEqual('Please confirm your entries')
    })

    test('can create a blog', async () => {
      await page.click('button.green')

      await page.waitFor('a[href="/blogs/new"]')
      const blogTitles = await page.$$eval('div.card-content > span', (spans) =>
        spans.map((span) => span.textContent)
      )
      const blogContents = await page.$$eval('div.card-content > p', (ps) =>
        ps.map((p) => p.innerHTML)
      )

      expect(blogTitles[blogTitles.length - 1]).toEqual(blogTitle)
      expect(blogContents[blogContents.length - 1]).toEqual(blogContent)
    })
  })
})

describe('when user is not logged in', async () => {
  test('user cannot create blog posts', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'Helllo', content: 'Worllld' })
      }).then((res) => res.json())
    })

    expect(result).toEqual({ error: 'You must log in!' })
  })

  test('user cannot get to view blog posts list', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs').then((res) => res.json())
    })

    expect(result).toEqual({ error: 'You must log in!' })
  })
})
