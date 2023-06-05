import { Delay } from '@suspensive/react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Spinner } from '../../../../components/uis'
import { Post, albums, posts, todos } from './api'
import { useIntersectionObserver } from './useIntersectionObserver'

export const PostListTanStack = () => {
  const postsQuery = useQuery(['posts'], posts.getMany)

  if (postsQuery.isLoading) {
    return (
      <Delay>
        <Spinner />
      </Delay>
    )
  }
  if (postsQuery.isError) {
    return <>error</>
  }

  return (
    <ul style={{ maxWidth: 600 }}>
      {postsQuery.data.map((post) => (
        <PostListItem key={post.id} post={post} />
      ))}
    </ul>
  )
}

const PostListItem = ({ post }: { post: Post }) => {
  const ref = useRef(null)
  const entry = useIntersectionObserver(ref)
  const [isShow, setIsShow] = useState(false)

  useEffect(() => {
    if (entry?.isIntersecting) {
      setIsShow(true)
    }
  }, [entry?.isIntersecting])

  return (
    <li key={post.id} ref={ref} style={{ minHeight: 200 }}>
      <h3>Title: {post.title}</h3>
      {isShow && <PostContent id={post.id} />}
    </li>
  )
}

const PostContent = ({ id }: { id: number }) => {
  const postQuery = useQuery(['posts', id], () => posts.getOneBy({ id }))
  const [albumsQuery, todosQuery] = useQueries({
    queries: [
      {
        queryKey: ['tanstack', 'users', postQuery.data?.userId, 'albums'],
        queryFn: () => albums.getManyBy({ userId: postQuery.data?.userId || 0 }),
        enabled: !!postQuery.data?.userId,
      },
      {
        queryKey: ['tanstack', 'users', postQuery.data?.userId, 'todos'],
        queryFn: () => todos.getManyBy({ userId: postQuery.data?.userId || 0 }),
        enabled: !!postQuery.data?.userId,
      },
    ],
  })

  if (postQuery.isLoading || albumsQuery.isLoading || todosQuery.isLoading) {
    return (
      <Delay>
        <Spinner />
      </Delay>
    )
  }
  if (postQuery.isError || albumsQuery.isError || todosQuery.isError) {
    return <>error</>
  }

  return (
    <div>
      <p>Body: {postQuery.data.body}</p>
      <h5>Album List:</h5>
      <ul>
        {albumsQuery.data.map((album) => (
          <li key={album.id}>{album.title}</li>
        ))}
      </ul>
      <h5>Todo List:</h5>
      <ul>
        {todosQuery.data.map((todo) => (
          <li key={todo.id}>
            <button type="button">{todo.completed ? 'completed' : 'todo'}</button> {todo.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
