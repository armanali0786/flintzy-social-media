import { render, screen, within } from '@testing-library/react'
import type { Post } from '@/types/post'
import { PostCard } from './PostCard'

const post: Post = {
  id: 'post-1',
  content: 'Autumn blend is back',
  platforms: ['instagram', 'x'],
  mediaUrl: 'https://picsum.photos/seed/test/200/200',
  scheduledAt: '2026-10-16T04:00:00.000Z',
  status: 'scheduled',
}

describe('PostCard', () => {
  it('shows content, local time, status and platforms', () => {
    render(<PostCard post={post} />)

    expect(screen.getByText('Autumn blend is back')).toBeInTheDocument()
    expect(screen.getByText('9:30 AM')).toHaveAttribute(
      'datetime',
      '2026-10-16T04:00:00.000Z',
    )
    expect(screen.getByText('Scheduled')).toBeInTheDocument()

    const platforms = within(screen.getByRole('list', { name: 'Platforms' }))
    expect(
      platforms.getByRole('img', { name: 'Instagram' }),
    ).toBeInTheDocument()
    expect(platforms.getByRole('img', { name: 'X' })).toBeInTheDocument()
  })

  it('shows the attached image when there is one', () => {
    const { container } = render(<PostCard post={post} />)
    expect(container.querySelector('img')).toHaveAttribute('src', post.mediaUrl)
  })

  it('shows the error message for failed posts', () => {
    render(
      <PostCard
        post={{ ...post, status: 'failed', errorMessage: 'Token expired' }}
      />,
    )

    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Token expired')).toBeInTheDocument()
  })
})
