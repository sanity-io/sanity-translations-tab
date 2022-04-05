import { SanityDocument } from '@sanity/types'
import sanityClient from 'part:@sanity/base/client'

const client = sanityClient.withConfig({ apiVersion: '2022-04-03' })

//document fetch
const findLatestDraft = async (documentId: string) => {
  const query = `*[_id == $id || _id == $draftId]`
  const params = { id: documentId, draftId: `drafts.${documentId}` }
  return client
    .fetch(query, params)
    .then(
      (docs: SanityDocument[]) =>
        docs.find(doc => doc._id.includes('draft')) ?? docs[0]
    )
}

export default findLatestDraft
