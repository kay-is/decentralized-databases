import { useEffect, useState } from "react"
import Link from "next/link"
import { useDatabaseClient } from "@/utils/database.context"

export default function HomePage() {
  const databaseClient = useDatabaseClient()
  const [profile, setProfile] = useState()
  const [articles, setArticles] = useState([])

  useEffect(() => {
    databaseClient.readOwnProfile().then((profile) => {
      if (!profile) window.location.replace("/")
      setProfile(profile)
    })
    databaseClient.listOwnArticles().then(setArticles)
  }, [databaseClient])

  function logout() {
    databaseClient.deleteSession()
    window.location.replace("/")
  }

  if (!profile) return null

  return (
    <>
      <h1>Home</h1>
      <button onClick={logout}>Logout</button>
      <h2>{profile.name}</h2>
      <p>{profile.bio}</p>
      <Link href="/editor">Create Article</Link>
      <h2>Your Articles</h2>
      {articles.length == 0 && <p>No articles found.</p>}
      <ul>
        {articles.map((a) => (
          <li>
            <Link href={"article?id=" + a.id}>
              <h3>{a.title}</h3>
            </Link>
            <p>Created at {a.date}</p>
          </li>
        ))}
      </ul>
    </>
  )
}
