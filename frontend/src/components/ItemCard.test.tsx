import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ItemCard } from './ItemCard'
import { items } from '../lib/mockData'

test('ItemCard renders title, category, date, location, and status', () => {
  const item = items[0]
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
