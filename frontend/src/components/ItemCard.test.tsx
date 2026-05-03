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
