import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useDatabaseClient } from "@/utils/database.context"

export default function EditorPage() {
  const databaseClient = useDatabaseClient()
  const [article, setArticle] = useState()
  const router = useRouter()
  const articleId = router.query.id

  useEffect(() => {
    if (articleId) databaseClient.readArticle(articleId).then(setArticle)
    else setArticle({ title: "", content: "" })
  }, [articleId])

  async function save() {
    if (articleId) {
      await databaseClient.updateArticle(article)
    } else {
      await databaseClient.createArticle({
        ...article,
        date: new Date().toISOString(),
      })
    }

    router.push("/home")
  }

  function discard() {
    router.push("/home")
  }

  if (!article) return <h1>Article not found!</h1>

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1>{articleId ? "Edit Article" : "Create Article"}</h1>
      <label>Title</label>
      <input
        value={article.title}
        onChange={(e) => setArticle({ ...article, title: e.target.value })}
      />
      <label>Content</label>
      <textarea
        value={article.content}
        rows={20}
        onChange={(e) => setArticle({ ...article, content: e.target.value })}
      />
      <button onClick={save}>Save</button>
      <button onClick={discard}>Discard</button>
    </div>
  )
}
