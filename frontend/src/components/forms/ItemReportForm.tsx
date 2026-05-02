import { Button } from '../ui/Button'

interface ItemReportFormProps {
  mode: 'lost' | 'found'
}

export function ItemReportForm({ mode }: ItemReportFormProps) {
  return (
    <form className="form-grid">
      <label>
        Item name
        <input name="title" type="text" placeholder="Backpack, ID card, laptop..." />
      </label>
      <label>
        Category
        <select name="category" defaultValue="">
          <option value="" disabled>
            Select category
          </option>
          <option>Electronics</option>
          <option>Documents</option>
          <option>Bags</option>
          <option>Keys</option>
          <option>Other</option>
        </select>
      </label>
      <label>
        Location
        <input name="location" type="text" placeholder="Library, cafeteria, lab..." />
      </label>
      <label>
        {mode === 'lost' ? 'Date lost' : 'Date found'}
        <input name="date" type="date" />
      </label>
      <label className="full-span">
        Description
        <textarea name="description" rows={5} placeholder="Include color, brand, marks, and other identifiers." />
      </label>
      <div className="form-actions full-span">
        <Button type="submit">Submit report</Button>
      </div>
    </form>
  )
}
