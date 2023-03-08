import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useDatabaseClient } from "@/utils/database.context"

export default function ProfilePage() {
  const databaseClient = useDatabaseClient()
  const [profile, setProfile] = useState()
  const [articles, setArticles] = useState([])
  const router = useRouter()
  const profileId = router.query.id

  useEffect(() => {
    if (!profileId) return
    databaseClient.readProfile(profileId).then(setProfile)
    databaseClient.listUserArticles(profileId).then(setArticles)
  }, [profileId])

  if (!profile) return <h1>Profile not found!</h1>

  return (
    <>
      <h1>Profile</h1>
      <Link href="/">Landing Page</Link>|<Link href="/home">Home</Link>
      <hr />
      <h2>{profile.name}</h2>
      <p>{profile.bio}</p>
      <hr />
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={"/article?id=" + article.id}>
              <h3>{article.title}</h3>
            </Link>
            <p>Created at {article.date}</p>
          </li>
        ))}
      </ul>
    </>
  )
}
