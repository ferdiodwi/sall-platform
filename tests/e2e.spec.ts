import { test, expect } from '@playwright/test'

test.describe('SALL Platform End-to-End Smoke Tests', () => {
  
  test('unauthenticated user redirected to login', async ({ page }) => {
    // Navigate to protected page
    await page.goto('/home')
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
    
    // Login form should be visible
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitBtn = page.locator('button[type="submit"]')
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitBtn).toBeVisible()
  })

  test('login page elements and link to register page', async ({ page }) => {
    await page.goto('/login')
    
    // Check card title
    await expect(page.locator('[data-slot="card-title"]')).toContainText(/Selamat Datang/i)
    
    // Click register page link
    const registerLink = page.locator('a[href="/register"]')
    await expect(registerLink).toBeVisible()
    await registerLink.click()
    
    // Should be on register page
    await expect(page).toHaveURL(/\/register/)
  })

  test('register page form fields render correctly', async ({ page }) => {
    await page.goto('/register')
    
    await expect(page.locator('[data-slot="card-title"]')).toContainText(/Daftar Akun/i)
    
    // Check input fields
    const nameInput = page.locator('input[id="name"]')
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const classIdInput = page.locator('input[id="classId"]')
    
    await expect(nameInput).toBeVisible()
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(classIdInput).toBeVisible()
  })

  test('student and teacher protected routing policy checks', async ({ page }) => {
    // Try to access teacher dashboard without login
    await page.goto('/teacher/dashboard')
    await expect(page).toHaveURL(/\/login/)
    
    // Try to access placement quiz without login
    await page.goto('/placement-quiz')
    await expect(page).toHaveURL(/\/login/)
  })
})
