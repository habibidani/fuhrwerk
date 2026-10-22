import { test, expect, type Page } from '@playwright/test'

async function ask(page: Page, q: string) {
  await page.goto('/#/frage')
  await page.getByLabel('Ihre Frage').fill(q)
  await page.getByRole('button', { name: 'Frage stellen' }).click()
}

test.describe('Fuhrwerk v2', () => {
  test('Flow A: E-Transporter, Beispieltouren, Antwort mit Zahl', async ({ page }) => {
    await ask(page, 'Lohnt sich ein E-Transporter für meine Touren?')
    await expect(page.getByRole('heading', { name: 'So hat Fuhrwerk Ihre Frage verstanden.' })).toBeVisible()
    await expect(page.getByText('Elektrifizierung: Welche Ihrer Touren')).toBeVisible()
    await expect(page.getByText('Lieferzonen und Halteverbote')).toBeVisible()
    await page.getByRole('button', { name: 'Antwort berechnen' }).click()
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/von 9 Touren fahren mit einem E-Transporter/)
    await expect(page.getByText('Alle 9 Touren im Einzelnen')).toBeVisible()
    await expect(page.getByText('Beispielrechnung mit 9 synthetischen Touren')).toBeVisible()
  })

  test('Flow B: Halten in Mitte, schematische Karte', async ({ page }) => {
    await page.goto('/#/frage')
    await page.getByRole('button', { name: 'Mitte', exact: true }).click()
    await ask(page, 'Wo dürfen meine Fahrzeuge in Mitte halten, ohne Knöllchen?')
    await expect(page.getByText('Halten und Parken: Wo stehen Fahrzeuge')).toBeVisible()
    await page.getByRole('button', { name: 'Antwort berechnen' }).click()
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/Beispieladressen in Mitte/)
    await expect(page.getByRole('img', { name: /Schematische Karte/ })).toBeVisible()
  })

  test('Flow C: Fuhrparkgröße rechnet mit eigenen Touren', async ({ page }) => {
    await page.goto('/#/touren')
    await page.getByRole('button', { name: 'Beispieltouren laden' }).click()
    await expect(page.getByText('9 Touren ·')).toBeVisible()
    await page.getByLabel('Name').fill('Tour Test, Mittwoch')
    await page.getByLabel('Strecke pro Tag').fill('40')
    await page.getByLabel('Start', { exact: true }).fill('09:00')
    await page.getByLabel('Ende', { exact: true }).fill('11:00')
    for (const d of ['Mo', 'Di', 'Do', 'Fr']) await page.getByRole('button', { name: d, exact: true }).click()
    await page.getByRole('button', { name: 'Tour speichern' }).click()
    await expect(page.getByText('10 Touren ·')).toBeVisible()
    await ask(page, 'Brauche ich wirklich 6 Fahrzeuge?')
    await expect(page.getByText('Aus „Meine Touren“ auf diesem Gerät')).toBeVisible()
    await page.getByRole('button', { name: 'Antwort berechnen' }).click()
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/Fahrzeugen schaffen Sie alle Touren|Sie brauchen alle|Ihnen fehl/)
    await expect(page.getByText('Gerechnet mit Ihren Touren von diesem Gerät')).toBeVisible()
  })

  test('Unbekannte Frage wird ehrlich abgelehnt, nicht erraten', async ({ page }) => {
    await ask(page, 'Wie wird das Wetter morgen in Berlin für die Baustelle?')
    await expect(page.getByRole('heading', { name: 'Diese Frage kann Fuhrwerk noch nicht beantworten.' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Antwort berechnen' })).toBeDisabled()
    await page.getByRole('button', { name: 'Brauche ich wirklich so viele Fahrzeuge?' }).click()
    await expect(page.getByRole('button', { name: 'Antwort berechnen' })).toBeEnabled()
  })

  test('Zu kurze Eingabe: Fehlermeldung statt Antwort', async ({ page }) => {
    await ask(page, 'E-Auto')
    await expect(page.getByRole('alert')).toContainText('ganze Frage')
    await expect(page.getByRole('heading', { name: 'Was wollen Sie über Ihren Fuhrpark wissen?' })).toBeVisible()
  })

  test('Zurückgeben: Zusage wird lokal vorgemerkt, nichts gesendet', async ({ page }) => {
    await ask(page, 'Lohnt sich ein E-Transporter für meine Touren?')
    await page.getByRole('button', { name: 'Antwort berechnen' }).click()
    await page.getByRole('button', { name: 'Weiter: Zurückgeben, optional' }).click()
    await expect(page.getByText('Was nie rausgeht')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ohne Beitrag abschließen' })).toBeVisible()
    await page.getByRole('checkbox').first().check()
    await page.getByRole('button', { name: 'Beitrag vormerken (Demo)' }).click()
    await expect(page.getByRole('heading', { name: 'Vorgemerkt. Nichts wurde gesendet.' })).toBeVisible()
    await page.goto('/#/verlauf')
    await expect(page.getByText('1 Zusage vorgemerkt')).toBeVisible()
  })

  test('Feedback landet im Verlauf', async ({ page }) => {
    await ask(page, 'Lohnt sich ein E-Transporter für meine Touren?')
    await page.getByRole('button', { name: 'Antwort berechnen' }).click()
    await page.getByLabel('Kommentar zur Antwort').fill('Ladezeiten fehlen')
    await page.getByRole('button', { name: 'Nein', exact: true }).click()
    await page.goto('/#/verlauf')
    await expect(page.getByText('nicht hilfreich')).toBeVisible()
    await expect(page.getByText('„Ladezeiten fehlen“')).toBeVisible()
  })

  test('Datenquellen zeigen die Lücke', async ({ page }) => {
    await page.goto('/#/quellen')
    await expect(page.getByRole('heading', { name: /Woher die Zahlen kommen/ })).toBeVisible()
    await expect(page.getByText('Lieferzonen und Halteverbote')).toBeVisible()
    await expect(page.getByText('kein Datensatz', { exact: false }).first()).toBeVisible()
  })
})
