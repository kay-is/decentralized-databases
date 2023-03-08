import { ComposeClient } from "@composedb/client"
import { definition } from "../../composites/blog.runtime"
import { DIDSession } from "did-session"
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum"

export class DatabaseClient {
  #definition
  #compose
  #session

  constructor(definition) {
    this.#definition = definition
    this.#compose = new ComposeClient({
      ceramic:
        "https://kay-is-curly-space-spork-rx94w5xqrq254pw-7007.preview.app.github.dev/",
      definition: this.#definition,
    })
  }

  #query = async (query, variables) => {
    const response = await this.#compose.executeQuery(query, variables)
    console.log(response)
    return response.data
  }

  sessionActive = () =>
    this.#session && this.#session.hasSession && !this.#session.isExpired

  restoreSession = async () => {
    console.log("Restoring session...")
    const sessionStr = localStorage.getItem("didsession")
    if (!sessionStr) return console.log("No session found!")

    this.#session = await DIDSession.fromSession(sessionStr)
    this.#compose = new ComposeClient({
      ceramic:
        "https://kay-is-curly-space-spork-rx94w5xqrq254pw-7007.preview.app.github.dev/",
      definition: this.#definition,
    })

    this.#compose.setDID(this.#session.did)
    console.log("Session restored!")
  }

  loadSession = async () => {
    console.log("Checking active session...")
    if (this.sessionActive()) return console.log("Active session found!")

    console.log("No active session found! Loading from localstorage...")

    this.#compose = new ComposeClient({
      ceramic:
        "https://kay-is-curly-space-spork-rx94w5xqrq254pw-7007.preview.app.github.dev/",
      definition: this.#definition,
    })

    const sessionStr = localStorage.getItem("didsession")
    if (sessionStr) {
      this.#session = await DIDSession.fromSession(sessionStr)
      console.log("Session loaded!")
    }

    if (!this.sessionActive()) {
      console.log("Session not found or expired! Starting login...")
      const provider = window.ethereum
      const addresses = await provider.request({
        method: "eth_requestAccounts",
      })
      const accountId = await getAccountId(provider, addresses[0])
      const authMethod = await EthereumWebAuth.getAuthMethod(
        provider,
        accountId
      )

      this.#session = await DIDSession.authorize(authMethod, {
        resources: this.#compose.resources,
      })

      localStorage.setItem("didsession", this.#session.serialize())
    }

    this.#compose.setDID(this.#session.did)
    console.log("Session active!")
  }

  deleteSession = () => {
    this.#compose = new ComposeClient({
      ceramic:
        "https://kay-is-curly-space-spork-rx94w5xqrq254pw-7007.preview.app.github.dev/",
      definition,
    })

    this.#session = null
    localStorage.removeItem("didsession")
  }

  createArticle = async (newArticle) => {
    const data = await this.#query(
      `
      mutation CreateArticle($i: CreateArticleInput!) {
        createArticle(input: $i) {
          document { id title content date }
        }
      }
      `,
      { i: { content: newArticle } }
    )

    return data?.createArticle?.document
  }

  readArticle = async (id) => {
    const data = await this.#query(
      `
      query ($id: ID!) {
          node(id: $id) {
            ... on Article {
              id
              title
              content
              date
              author {
                profile {
                  id
                  name
                }
              }
            }
          }
        }
        `,
      { id }
    )

    return data?.node
  }

  updateArticle = async (article) => {
    const data = await this.#query(
      `
      mutation UpdateArticle($i: UpdateArticleInput!) {
        updateArticle(input: $i) {
          document { id title content }
        }
      }
      `,
      { i: { content: article } }
    )

    return data?.updateArticle?.document
  }

  deleteArticle = async (id) => {
    alert("ComposeDB doesn't support deletion of data.")
  }

  listArticles = async () => {
    const data = await this.#query(
      `
      {
        articleIndex(last: 10) {
          edges {
            node {
              id
              date
              title
              author {
                profile {
                  id
                  name
                }
              }
            }
          }
        }
      }
      `
    )

    return data?.articleIndex?.edges?.map((i) => i?.node)
  }

  listOwnArticles = async () => {
    const data = await this.#query(
      `
      {
        viewer {
          articleList(last: 10) {
            edges {
              node { id title date }
            }
          }
        }
      }
      `
    )

    return data?.viewer?.articleList?.edges?.map((i) => i?.node)
  }

  listUserArticles = async (id) => {
    const data = await this.#query(
      `
      query ($id: ID!){
        node(id: $id) {
          ... on Profile {
            author {
              articleList(first: 10) {
                edges {
                  node { id title date }
                }
              }
            }
          }
        }
      }
      `,
      { id }
    )

    return data?.node?.author?.articleList?.edges?.map((i) => i?.node)
  }

  createProfile = async (profile) => {
    const data = await this.#query(
      `
      mutation CreateProfile($i: CreateProfileInput!) {
        createProfile(input: $i) {
          document { id name bio }
        }
      }
      `,
      { i: { content: profile } }
    )

    return data?.createProfile?.document
  }

  updateProfile = async (profile) => {
    const data = await this.#query(
      `
      mutation UpdateProfile($i: UpdateProfileInput!) {
        updateProfile(input: $i) {
          document { id name bio }
        }
      }
      `,
      { i: { content: profile } }
    )

    return data?.updateProfile?.document
  }

  readProfile = async (id) => {
    const data = await this.#query(
      `
      query ($id: ID!) {
        node(id: $id) {
          ... on Profile { id name bio }
        }
      }
      `,
      { id }
    )

    return data?.node
  }

  readOwnProfile = async () => {
    const data = await this.#query(
      `
      {
        viewer {
          profile { id name bio }
        }
      }
      `
    )

    return data?.viewer?.profile
  }

  deleteProfile = async (id) => {
    alert("ComposeDB doesn't support deletion of data.")
  }

  createComment = async (comment) => {
    const data = await this.#query(
      `
      mutation CreateComment($i: CreateCommentInput!) {
        createComment(input: $i) {
          document { id content articleId }
        }
      }
      `,
      { i: { content: comment } }
    )

    return data?.createComment?.document
  }

  listArticleComments = async (id) => {
    const data = await this.#query(
      `
      query ($id: ID!) {
          node(id: $id) {
            ... on Article {
              comments (first: 100) {
                edges {
                  node {
                    id
                    content
                    author {
                      profile {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `,
      { id }
    )

    return data?.node?.comments?.edges?.map((i) => i?.node)
  }

  updateComment = async (comment) => {
    const data = await this.#query(
      `
      mutation UpdateComment($i: UpdateCommentInput!) {
        updateComment(input: $i) {
          document { id content }
        }
      }
      `,
      { i: { content: comment } }
    )

    return data?.updateComment?.document
  }

  deleteComment = async (id) => {
    alert("ComposeDB doesn't support deletion of data.")
  }
}
