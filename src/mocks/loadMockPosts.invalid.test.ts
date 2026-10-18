import { loadMockPosts } from './loadMockPosts'

vi.mock('./posts.json', () => ({
  default: {
    generatedAt: '2026-10-16T12:00:00.000Z',
    posts: [
      {
        id: 'bad-1',
        content: 'Hello',
        platforms: ['myspace'],
        scheduledAt: '2026-10-16T12:00:00.000Z',
        status: 'scheduled',
      },
    ],
  },
}))

test('rejects seed data with unknown values instead of rendering it', () => {
  expect(() => loadMockPosts()).toThrow(
    'Mock post bad-1 has an unknown platform',
  )
})
