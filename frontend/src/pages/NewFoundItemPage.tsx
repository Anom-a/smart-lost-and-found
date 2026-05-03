import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ItemReportForm } from '../components/ItemReportForm'
import { getApiErrorMessage } from '../lib/api'
import { createFoundItem } from '../lib/apiData'

export function NewFoundItemPage() {
  const navigate = useNavigate()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Report a found item</h1>
        <p className="text-slate-600">Share item details so the owner can identify it.</p>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5">
        <ItemReportForm
          onSubmit={async (data) => {
            try {
              await createFoundItem(data)
              toast.success('Found item report submitted.')
            } catch (error) {
              toast.error(getApiErrorMessage(error, 'Unable to submit found item report'))
              return
            }
            navigate('/found-items')
          }}
        />
      </div>
    </section>
  )
}
