import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ItemReportForm } from '../components/ItemReportForm'
import { getApiErrorMessage } from '../lib/api'
import { createLostItem } from '../lib/apiData'

export function NewLostItemPage() {
  const navigate = useNavigate()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Report a lost item</h1>
        <p className="text-slate-600">Submit the details to help others identify the item quickly.</p>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5">
        <ItemReportForm
          onSubmit={async (data) => {
            try {
              await createLostItem(data)
              toast.success('Lost item report submitted.')
            } catch (error) {
              toast.error(getApiErrorMessage(error, 'Unable to submit lost item report'))
              return
            }
            navigate('/lost-items')
          }}
        />
      </div>
    </section>
  )
}
