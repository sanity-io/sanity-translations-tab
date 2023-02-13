import {SanityClient, SanityDocument} from 'sanity'

//document fetch
export const findLatestDraft = (
  documentId: string,
  client: SanityClient
): Promise<SanityDocument> => {
  const query = `*[_id == $id || _id == $draftId]`
  const params = {id: documentId, draftId: `drafts.${documentId}`}
  return client
    .fetch(query, params)
    .then((docs: SanityDocument[]) => docs.find((doc) => doc._id.includes('draft')) ?? docs[0])
}
