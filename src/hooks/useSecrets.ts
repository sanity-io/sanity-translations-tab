import { useState, useEffect } from 'react'
import sanityClient, { SanityDocumentStub } from '@sanity/client'

const client = sanityClient({ apiVersion: '2021-03-25' })

export function useSecrets<T>(id: string) {
  const [loading, setLoading] = useState<boolean>(true)
  const [secrets, setSecrets] = useState<T | null>(null)

  useEffect(() => {
    async function fetchData() {
      client
        .fetch('* [_id == $id][0]', { id })
        .then((doc: SanityDocumentStub) => {
          const result: Record<string, any> = {}
          for (const key in doc) {
            if (key[0] !== '_') {
              result[key] = doc[key]
            }
          }
          setSecrets(result as T)
          setLoading(false)
        })
    }
    fetchData()
  }, [id])

  return { loading, secrets }
}
