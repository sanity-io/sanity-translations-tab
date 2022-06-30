import sanityClient from 'part:@sanity/base/client'

const client = sanityClient.withConfig({ apiVersion: '2022-04-03' })

//revision fetch
const findDocumentAtRevision = async (documentId: string, rev: string) => {
  const dataset = client.config().dataset
  let baseUrl = `/data/history/${dataset}/documents/${documentId}?revision=${rev}`
  let url = client.getUrl(baseUrl)
  let revisionDoc = await fetch(url, { credentials: 'include' })
    .then(req => req.json())
    .then(req => {
      if (req.documents && req.documents.length) {
        return req.documents[0]
      }
    })

  return revisionDoc
}

export default findDocumentAtRevision
