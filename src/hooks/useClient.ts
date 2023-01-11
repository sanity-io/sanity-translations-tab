import { useClient as useSanityClient } from 'sanity'

export const useClient = () => {
  return useSanityClient({ apiVersion: '2022-12-07' })
}
