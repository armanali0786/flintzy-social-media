import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/useToast'
import { formatDayLabel, formatLocalTime } from '@/lib/dates'
import { ComposerForm } from './ComposerForm'
import { toNewPost, type ComposerValues } from './composerValues'
import { useCreatePost } from './useCreatePost'

interface NewPostDialogProps {
  open: boolean
  onClose: () => void
}

export function NewPostDialog({ open, onClose }: NewPostDialogProps) {
  const createPost = useCreatePost()
  const showToast = useToast()

  const close = () => {
    createPost.reset()
    onClose()
  }

  const handleSubmit = (values: ComposerValues) => {
    createPost.mutate(toNewPost(values), {
      onSuccess: (post) => {
        const day = formatDayLabel(new Date(post.scheduledAt))
        const time = formatLocalTime(post.scheduledAt)
        showToast({ message: `Post scheduled for ${day} at ${time}.` })
        close()
      },
    })
  }

  return (
    <Modal open={open} title="New post" onClose={close}>
      <ComposerForm
        isSubmitting={createPost.isPending}
        submitError={
          createPost.isError
            ? "Couldn't schedule the post. Please try again."
            : undefined
        }
        onSubmit={handleSubmit}
        onCancel={close}
      />
    </Modal>
  )
}
