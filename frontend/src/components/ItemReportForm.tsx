import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const reportSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  category: z.string().min(2, 'Category is required'),
  date: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  description: z.string().optional(),
})

type ReportFormData = z.infer<typeof reportSchema>

export function ItemReportForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<ReportFormData>
  onSubmit: (data: ReportFormData) => void | Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormData>({ resolver: zodResolver(reportSchema), defaultValues: initial })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Title</label>
        <input className="mt-1 w-full rounded-md border px-3 py-2" {...register('title')} />
        {errors.title ? <p className="mt-1 text-sm text-red-600">{errors.title.message}</p> : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Category</label>
        <input className="mt-1 w-full rounded-md border px-3 py-2" {...register('category')} />
        {errors.category ? <p className="mt-1 text-sm text-red-600">{errors.category.message}</p> : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Location</label>
        <input className="mt-1 w-full rounded-md border px-3 py-2" {...register('location')} />
        {errors.location ? <p className="mt-1 text-sm text-red-600">{errors.location.message}</p> : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={4} {...register('description')} />
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting...' : 'Submit report'}
        </button>
      </div>
    </form>
  )
}
