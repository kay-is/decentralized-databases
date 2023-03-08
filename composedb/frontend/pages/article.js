import { createComment, loadArticle } from "@/utils/database"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useDatabaseClient } from "@/utils/database.context"

export default function ArticlePage() {
  const databaseClient = useDatabaseClient()
  const [article, setArticle] = useState()
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState()
  const router = useRouter()
  const articleId = router.query.id

  useEffect(() => {
    if (!articleId) return
    databaseClient.readArticle(articleId).then(setArticle)
    databaseClient.listArticleComments(articleId).then(setComments)
  }, [articleId])

  if (!article) return <h1>Article not found!</h1>

  async function saveComment() {
    await databaseClient.createComment({
      content: comment,
      articleId,
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Link href="/home">Home</Link>
      <h1>{article.title}</h1>
      <p>
        Created at {article.date} by {article.author.profile.name}
      </p>
      <hr />
      <>{article.content}</>
      <hr />
      <h2>Write a Comment</h2>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      <button onClick={saveComment}>Comment</button>
      <hr />
      <h2>Comments</h2>
      {comments.length == 0 && <h3>No comments.</h3>}
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            "{comment.content}" - {comment.author.profile.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
