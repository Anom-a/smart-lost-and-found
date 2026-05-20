import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCategories } from '../hooks/useCategories'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function isFileLike(value: unknown): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'size' in value &&
    'type' in value &&
    typeof (value as File).name === 'string' &&
    typeof (value as File).size === 'number' &&
    typeof (value as File).type === 'string'
  )
}

function normalizeImageValue(value: unknown): unknown {
  if (isFileLike(value)) {
    return value
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'length' in value &&
    'item' in value &&
    typeof (value as FileList).length === 'number' &&
    typeof (value as FileList).item === 'function'
  ) {
    return (value as FileList).item(0) ?? undefined
  }

  return value
}

const reportSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  itemCategoryId: z.coerce.number().positive('Category is required'),
  date: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  contactPhone: z
    .string()
    .min(1, 'Contact phone is required')
    .regex(/^\+251\d{9}$/, 'Must be a valid Ethiopian phone number starting with +251 (e.g. +251912345678)'),
  image: z.preprocess(
    normalizeImageValue,
    z.custom<File | undefined>((value) => value === undefined || isFileLike(value), {
      message: 'Invalid image file',
    })
      .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), 'Use a JPG, PNG, or WEBP image')
      .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, 'Image must be 5MB or smaller')
      .optional(),
  ),
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormData>({ resolver: zodResolver(reportSchema), defaultValues: initial })

  const selectedImage = watch('image')
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    let currentUrl: string | null = null
    const previewImage = normalizeImageValue(selectedImage)

    if (isFileLike(previewImage)) {
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        currentUrl = URL.createObjectURL(previewImage)
      } else {
        // Fallback for test environment where createObjectURL may not exist.
        // Use a tiny transparent PNG data URI as a harmless placeholder.
        currentUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='
      }

      setImagePreviewUrl(currentUrl)
    } else {
      setImagePreviewUrl(null)
    }

    return () => {
      if (currentUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(currentUrl)
      }
    }
  }, [selectedImage])

  const imageField = register('image')
  const submitReport = (data: ReportFormData) => {
    const image = normalizeImageValue(data.image ?? selectedImage)

    return onSubmit({
      ...data,
      image: isFileLike(image) ? image : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(submitReport)} className="space-y-4">
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
        <label className="text-sm font-medium text-slate-700">Contact Phone Number (+251...)</label>
        <input placeholder="+251912345678" className="mt-1 w-full rounded-md border px-3 py-2" {...register('contactPhone')} />
        {errors.contactPhone ? <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p> : null}
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
          onChange={(e) => {
            const file = e.target.files?.[0]
            imageField.onChange(e)
            setValue('image', file || undefined, { shouldValidate: true })
          }}
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
