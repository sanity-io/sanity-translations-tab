declare module 'part:@sanity/base/client' {
  import { SanityClient } from '@sanity/client'
  const shim: SanityClient
  export default shim
}

declare module '@sanity/util/content'
declare module 'part:@sanity/base/schema' {
  import { Schema } from '@sanity/schema'
  const shim: Schema
  export default shim
}
