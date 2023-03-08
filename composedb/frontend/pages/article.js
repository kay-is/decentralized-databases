import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useDatabaseClient } from "@/utils/database.context"

export default function ArticlePage() {
  const databaseClient = useDatabaseClient()
  const [article, setArticle] = useState()
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState("")
  const router = useRouter()
  const articleId = router.query.id

  function loadComments() {
    databaseClient.listArticleComments(articleId).then(setComments)
  }

  useEffect(() => {
    if (!articleId) return
    databaseClient.readArticle(articleId).then(setArticle)
    loadComments()
  }, [articleId])

  if (!article) return <h1>Article not found!</h1>

  async function saveComment() {
    await databaseClient.createComment({ content: comment, articleId })
    setComment("")
    loadComments()
  }

  return (
    <>
      <h1>Article</h1>
      <Link href="/">Landing Page</Link>|<Link href="/home">Home</Link>
      <hr />
      <h2>{article.title}</h2>
      <p>
        Created at {article.date} by {article.author.profile.name}
      </p>
      <hr />
      <>{article.content}</>
      <hr />
      {comments.length == 0 ? <h2>No Comments</h2> : <h2>Comments</h2>}
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            "{comment.content}" -{" "}
            <Link href={"/profile?id=" + comment.author.profile.id}>
              {comment.author.profile.name}
            </Link>
          </li>
        ))}
      </ul>
      <hr />
      <h2>Write a Comment</h2>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      <button onClick={saveComment}>Comment</button>
    </>
  )
}
