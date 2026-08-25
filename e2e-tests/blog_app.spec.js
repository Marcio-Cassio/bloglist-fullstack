import { test, expect } from '@playwright/test'

test.describe('Blog app', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')

    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Marcio Junior',
        username: 'marcio',
        password: 'secret123',
      },
    })

    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Other User',
        username: 'other',
        password: 'secret456',
      },
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  test('user can log in with correct credentials', async ({ page }) => {
    await page.getByLabel('username').fill('marcio')
    await page.getByLabel('password').fill('secret123')
    await page.getByRole('button', { name: 'login' }).click()

    await expect(page.getByText('Marcio Junior logged in', { exact: true })).toBeVisible()
  })

  test('login fails with wrong credentials', async ({ page }) => {
    await page.getByLabel('username').fill('marcio')
    await page.getByLabel('password').fill('wrongpassword')
    await page.getByRole('button', { name: 'login' }).click()

    await expect(page.getByText('wrong username or password')).toBeVisible()
    await expect(page.getByText('Marcio Junior logged in', { exact: true })).not.toBeVisible()
  })

  test.describe('when logged in', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByLabel('username').fill('marcio')
      await page.getByLabel('password').fill('secret123')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()

      await page.getByLabel('title').fill('Playwright blog')
      await page.getByLabel('author').fill('Marcio Junior')
      await page.getByLabel('url').fill('https://playwright.dev')

      await page.getByRole('button', { name: 'create' }).click()

      await expect(page.getByText('Playwright blog Marcio Junior')).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()

      await page.getByLabel('title').fill('Like test blog')
      await page.getByLabel('author').fill('Marcio Junior')
      await page.getByLabel('url').fill('https://example.com')

      await page.getByRole('button', { name: 'create' }).click()
 
      await page.getByRole('button', { name: 'view' }).click()

      await expect(page.getByText('likes 0')).toBeVisible()

      await page.getByRole('button', { name: 'like' }).click()

      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('user who created a blog can remove it', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()

      await page.getByLabel('title').fill('Blog to remove')
      await page.getByLabel('author').fill('Marcio Junior')
      await page.getByLabel('url').fill('https://remove-test.com')

      await page.getByRole('button', { name: 'create' }).click()

      await page.getByRole('button', { name: 'view' }).click()

      page.on('dialog', dialog => dialog.accept())

      await page.getByRole('button', { name: 'remove' }).click()

      await expect(page.getByText('Blog to remove Marcio Junior')).not.toBeVisible()
    })

    test('only the user who added the blog sees the remove button', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()

      await page.getByLabel('title').fill('Owned by Marcio')
      await page.getByLabel('author').fill('Marcio Junior')
      await page.getByLabel('url').fill('https://owner-test.com')

      await page.getByRole('button', { name: 'create' }).click()

      await page.getByRole('button', { name: 'logout' }).click()

      await page.getByLabel('username').fill('other')
      await page.getByLabel('password').fill('secret456')
      await page.getByRole('button', { name: 'login' }).click()

      await page.getByRole('button', { name: 'view' }).click()

      await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })

    test('blogs are arranged in descending order by likes', async ({ page }) => {
      const createBlog = async (title, author, url) => {
        await page.getByRole('button', { name: 'create new blog' }).click()
        await page.getByLabel('title').fill(title)
        await page.getByLabel('author').fill(author)
        await page.getByLabel('url').fill(url)
        await page.getByRole('button', { name: 'create' }).click()
      }

      await createBlog('First blog', 'Marcio', 'https://first.com')
      await createBlog('Second blog', 'Marcio', 'https://second.com')
      await createBlog('Third blog', 'Marcio', 'https://third.com')

      await page.getByText('First blog Marcio').getByRole('button', { name: 'view' }).click()
      await page.getByText('Second blog Marcio').getByRole('button', { name: 'view' }).click()
      await page.getByText('Third blog Marcio').getByRole('button', { name: 'view' }).click()

      const firstBlog = page.getByTestId('blog-item').filter({ hasText: 'First blog Marcio' })
      const secondBlog = page.getByTestId('blog-item').filter({ hasText: 'Second blog Marcio' })
      const thirdBlog = page.getByTestId('blog-item').filter({ hasText: 'Third blog Marcio' })

      await firstBlog.getByRole('button', { name: 'like' }).click()

      await secondBlog.getByRole('button', { name: 'like' }).click()
      await secondBlog.getByRole('button', { name: 'like' }).click()

      await thirdBlog.getByRole('button', { name: 'like' }).click()
      await thirdBlog.getByRole('button', { name: 'like' }).click()
      await thirdBlog.getByRole('button', { name: 'like' }).click()

      const blogs = page.getByTestId('blog-item')

      await expect(blogs.nth(0)).toContainText('Third blog')
      await expect(blogs.nth(1)).toContainText('Second blog')
      await expect(blogs.nth(2)).toContainText('First blog')
    })
  })
})