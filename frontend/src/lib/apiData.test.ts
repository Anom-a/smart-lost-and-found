import { beforeEach, expect, test, vi } from 'vitest'
import { createFoundItem, createLostItem } from './apiData'

const apiPost = vi.hoisted(() => vi.fn())

vi.mock('./api', () => ({
  api: {
    post: apiPost,
  },
  STORAGE_URL: 'http://cdn.example.test/storage',
}))

beforeEach(() => {
  apiPost.mockReset()
})

test('createLostItem submits FormData and maps image URL from storage base', async () => {
  const image = new File(['image'], 'lost.png', { type: 'image/png' })
  apiPost.mockResolvedValueOnce({
    data: {
      data: {
        id: 1,
        title: 'Lost phone',
        description: 'Black phone with a cracked screen.',
        lost_location: 'Library',
        lost_at: '2026-05-01T10:00:00.000Z',
        status: 'open',
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
        image_path: 'items/lost/lost.png',
      },
    },
  })

  const result = await createLostItem({
    title: 'Lost phone',
    itemCategoryId: 7,
    location: 'Library',
    description: 'Black phone with a cracked screen.',
    date: '2026-05-01T10:00:00.000Z',
    image,
  })

  expect(apiPost).toHaveBeenCalledWith(
    '/lost-items',
    expect.any(FormData),
    expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }),
  )

  const formData = apiPost.mock.calls[0][1] as FormData
  expect(Array.from(formData.entries())).toEqual(
    expect.arrayContaining([
      ['item_category_id', '7'],
      ['title', 'Lost phone'],
      ['description', 'Black phone with a cracked screen.'],
      ['lost_location', 'Library'],
      ['lost_at', '2026-05-01T10:00:00.000Z'],
      ['image', image],
    ]),
  )

  expect(result.imageUrl).toBe('http://cdn.example.test/storage/items/lost/lost.png')
})

test('createFoundItem submits FormData and maps image URL from storage base', async () => {
  apiPost.mockResolvedValueOnce({
    data: {
      data: {
        id: 2,
        title: 'Found wallet',
        description: 'Brown wallet found near the gate.',
        found_location: 'Gate',
        found_at: '2026-05-02T09:00:00.000Z',
        status: 'available',
        created_at: '2026-05-02T09:00:00.000Z',
        updated_at: '2026-05-02T09:00:00.000Z',
        image_path: null,
      },
    },
  })

  const result = await createFoundItem({
    title: 'Found wallet',
    itemCategoryId: 8,
    location: 'Gate',
    description: 'Brown wallet found near the gate.',
    date: '2026-05-02T09:00:00.000Z',
  })

  const formData = apiPost.mock.calls[0][1] as FormData
  expect(Array.from(formData.entries())).toEqual(
    expect.arrayContaining([
      ['item_category_id', '8'],
      ['title', 'Found wallet'],
      ['description', 'Brown wallet found near the gate.'],
      ['found_location', 'Gate'],
      ['found_at', '2026-05-02T09:00:00.000Z'],
    ]),
  )

  expect(result.imageUrl).toBeUndefined()
})

test('createLostItem submits multipart FormData with the selected image', async () => {
  const image = new File(['image'], 'item.png', { type: 'image/png' })
  apiPost.mockResolvedValueOnce({ data: { data: { id: 1, title: 'Lost laptop', description: 'A black laptop with a sticker.', lost_location: 'Main library', lost_at: null, image_path: 'items/lost/item.png', status: 'open', created_at: '2026-05-03T00:00:00.000Z', updated_at: '2026-05-03T00:00:00.000Z' } } })

  await createLostItem({ title: 'Lost laptop', itemCategoryId: 1, location: 'Main library', description: 'A black laptop with a sticker.', image })

  const [, body, config] = apiPost.mock.calls[0]

  expect(body).toBeInstanceOf(FormData)
  expect((body as FormData).get('image')).toBe(image)
  expect((body as FormData).get('item_category_id')).toBe('1')
  expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
})

test('createFoundItem submits multipart FormData without an image', async () => {
  apiPost.mockResolvedValueOnce({ data: { data: { id: 1, title: 'Found ID card', description: 'A student ID card found near the cafeteria.', found_location: 'Cafeteria', found_at: null, image_path: null, status: 'available', created_at: '2026-05-03T00:00:00.000Z', updated_at: '2026-05-03T00:00:00.000Z' } } })

  await createFoundItem({ title: 'Found ID card', itemCategoryId: 2, location: 'Cafeteria', description: 'A student ID card found near the cafeteria.' })

  const [, body, config] = apiPost.mock.calls[0]

  expect(body).toBeInstanceOf(FormData)
  expect((body as FormData).get('image')).toBeNull()
  expect((body as FormData).get('found_location')).toBe('Cafeteria')
  expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
})
