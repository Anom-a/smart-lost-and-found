import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ItemCard } from './ItemCard'
import type { Item } from '../types/models'

test('ItemCard renders title, category, date, location, and status', () => {
  const item: Item = {
    id: 1,
    type: 'lost',
    title: 'Dell XPS 13 Laptop',
    category: 'Electronics',
    date: '2026-04-28T00:00:00.000Z',
    location: 'Engineering Block - Lab 2',
    status: 'open',
    description: 'Silver 13-inch laptop with university sticker on the lid.',
    reportedBy: 'Amina Yusuf',
  }

  render(
    <MemoryRouter>
      <ItemCard item={item} />
    </MemoryRouter>,
  )

  expect(screen.getByText(item.title)).toBeInTheDocument()
  expect(screen.getByText(item.category)).toBeInTheDocument()
  expect(screen.getByText(item.location)).toBeInTheDocument()
  expect(screen.getByText(item.reportedBy)).toBeInTheDocument()
  expect(screen.getByText(item.status)).toBeInTheDocument()
})

test('ItemCard renders image when provided and fallback when not', () => {
  const itemWithImage: Item = { ...((() => ({
    id: 2,
    type: 'found',
    title: 'Wallet',
    category: 'Accessories',
    date: '2026-04-28T00:00:00.000Z',
    location: 'Gate',
    status: 'available',
    description: 'Brown wallet',
    reportedBy: 'Ali',
  }))() as Item), imageUrl: 'http://cdn.test/storage/items/found/wallet.png' }

  render(
    <MemoryRouter>
      <ItemCard item={itemWithImage} />
    </MemoryRouter>,
  )

  expect(screen.getByAltText(/wallet image/i)).toBeInTheDocument()

  const itemWithoutImage: Item = { ...itemWithImage, id: 3, title: 'NoImage', imageUrl: undefined }

  render(
    <MemoryRouter>
      <ItemCard item={itemWithoutImage} />
    </MemoryRouter>,
  )

  expect(screen.getByText(/no image uploaded for this item/i)).toBeInTheDocument()
})
