import Link from "next/link"
import { useEffect, useState } from "react"
import { useDatabaseClient } from "@/utils/database.context"
import { useRouter } from "next/router"

export default function LandingPage() {
  const router = useRouter()
  const databaseClient = useDatabaseClient()
  const [articles, setArticles] = useState([])

  useEffect(() => {
    databaseClient.listArticles().then(setArticles)
  }, [databaseClient])

  const loginOrSignUp = async () => {
    await databaseClient.loadSession()

    const profile = await databaseClient.readOwnProfile()

    if (!profile) {
      const name = prompt("You don't have a profile!\nPlease enter your name:")
      await databaseClient.createProfile({ name, bio: "I'm a new user!" })
    }

    router.push("/home")
  }

  return (
    <>
      <h1>ComposeDB Blog</h1>
      {databaseClient.sessionActive() ? (
        <Link href="/home">Home</Link>
      ) : (
        <button onClick={loginOrSignUp}>Login/Signup</button>
      )}

      <hr />
      {articles.length == 0 ? <h2>No articles found.</h2> : <h2>Articles</h2>}
      {articles.map((a) => (
        <div key={a.id}>
          <Link href={"/article?id=" + a.id}>
            <h2>{a.title}</h2>
          </Link>
          <p>
            Created on {a.date} by{" "}
            <Link href={"/profile?id=" + a.author.profile.id}>
              {a.author.profile.name}
            </Link>
          </p>
          <p>{a.content}</p>
        </div>
      ))}
    </>
  )
}
