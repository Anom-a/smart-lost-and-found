import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCategories } from '../hooks/useCategories'

const reportSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  itemCategoryId: z.coerce.number().positive('Category is required'),
  date: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, {
      message: 'Invalid image file',
    })
    .optional(),
})

type ReportFormData = z.infer<typeof reportSchema>

export function ItemReportForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<ReportFormData>
  onSubmit: (data: ReportFormData) => void | Promise<void>
}) {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormData>({ resolver: zodResolver(reportSchema), defaultValues: initial })

  const selectedImage = watch('image')
  const imagePreviewUrl = useMemo(
    () => (selectedImage instanceof File ? URL.createObjectURL(selectedImage) : null),
    [selectedImage],
  )

  const imageField = register('image', {
    onChange: (event) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      return file
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Title</label>
        <input className="mt-1 w-full rounded-md border px-3 py-2" {...register('title')} />
        {errors.title ? <p className="mt-1 text-sm text-red-600">{errors.title.message}</p> : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Category</label>
        <select className="mt-1 w-full rounded-md border px-3 py-2" disabled={categoriesLoading} {...register('itemCategoryId')}>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        {errors.itemCategoryId ? <p className="mt-1 text-sm text-red-600">{errors.itemCategoryId.message}</p> : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Date</label>
        <input type="date" className="mt-1 w-full rounded-md border px-3 py-2" {...register('date')} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Location</label>
        <input className="mt-1 w-full rounded-md border px-3 py-2" {...register('location')} />
        {errors.location ? <p className="mt-1 text-sm text-red-600">{errors.location.message}</p> : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={4} {...register('description')} />
        {errors.description ? <p className="mt-1 text-sm text-red-600">{errors.description.message}</p> : null}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="item-image">Item image (optional)</label>
        <input
          id="item-image"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="mt-1 w-full rounded-md border px-3 py-2"
          name={imageField.name}
          ref={imageField.ref}
          onBlur={imageField.onBlur}
          onChange={imageField.onChange}
        />
        <p className="mt-1 text-xs text-slate-500">Accepted formats: JPG, JPEG, PNG, WEBP. Max size: 5MB.</p>
        {errors.image ? <p className="mt-1 text-sm text-red-600">{errors.image.message}</p> : null}
        {imagePreviewUrl ? (
          <img
            src={imagePreviewUrl}
            alt="Selected item preview"
            className="mt-3 h-48 w-full rounded-md border border-slate-200 object-cover"
          />
        ) : null}
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
