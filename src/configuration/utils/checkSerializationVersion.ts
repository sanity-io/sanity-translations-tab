const checkSerializationVersion = (HTMLdoc: string) => {
  const parser = new DOMParser()
  const node = parser.parseFromString(HTMLdoc, 'text/html')
  const versionMetaTag = Array.from(node.head.children).find(
    metaTag => metaTag.getAttribute('name') === 'version'
  )
  if (!versionMetaTag) {
    return null
  }

  const version = versionMetaTag.getAttribute('content')
  return version
}

export default checkSerializationVersion
