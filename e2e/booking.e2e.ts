import { expect, test } from './fixtures.ts'

const consultation = {
  id: 'konsultatsiya',
  title: 'Консультация',
  description: 'Обсудим вопросы по проекту',
  durationMinutes: 30,
}
const review = { ...consultation, id: 'razbor', title: 'Разбор', durationMinutes: 60 }

test.use({
  timezoneId: 'America/Los_Angeles',
  viewport: { width: 375, height: 812 },
  appOptions: {
    eventTypes: [consultation, review],
    now: () => new Date('2026-11-26T21:00:00Z'),
  },
})

test('the guest can retry a stale slot with another day and keep their name', async ({ page, request }) => {
  await page.goto('/book/konsultatsiya')
  const days = page.getByRole('group', { name: 'День звонка' })
  await days.getByRole('radio', { name: 'понедельник, 30 ноября' }).check()
  const slots = page.getByRole('group', { name: 'Время звонка' })
  await slots.getByRole('radio', { name: '10:30–11:00', exact: true }).check()
  const guestName = page.getByRole('textbox', { name: 'Ваше имя' })
  await guestName.fill('Анна', { timeout: 4000 })

  const competitor = await request.post('/api/bookings', {
    data: { eventTypeId: review.id, startsAt: '2026-11-30T07:00:00Z', guestName: 'Борис' },
  })
  expect(competitor.status()).toBe(201)
  const confirm = page.getByRole('button', { name: 'Подтвердить запись' })
  await confirm.click()

  await expect(page.getByRole('alert')).toHaveText('Это время уже занято. Выберите другой слот')
  await expect(guestName).toHaveValue('Анна')
  await expect(slots.getByRole('radio', { name: /10:30–11:00.*Занято/ })).toBeDisabled()
  await expect(confirm).toBeDisabled()

  await days.getByRole('radio', { name: 'вторник, 1 декабря' }).check()
  await slots.getByRole('radio', { name: '11:00–11:30', exact: true }).check()
  await expect(guestName).toHaveValue('Анна')
  await confirm.click()

  await expect(page.getByRole('status')).toContainText('Запись подтверждена')
  await expect(page.getByText(/1 декабря 2026 г\..*11:00–11:30/)).toBeVisible()
})
