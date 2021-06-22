import { createPatches } from '../src/mergeTranslation'

describe('createPatches', () => {
  it('collects paths and values for translated strings', () => {
    const translated = {
      _id: 'abcef',
      _type: 'article',
      title: {
        en: 'French title',
      },
      keyword: 'static',
    }

    const result = createPatches(translated, 'en', 'fr')

    expect(result).toEqual({
      'title.fr': 'French title',
    })
  })

  it('finds whole objects that are translated', () => {
    const translated = {
      object: {
        en: {
          title: 'French',
        },
      },
    }
    const result = createPatches(translated, 'en', 'fr')
    expect(result).toEqual({
      'object.fr': {
        title: 'French',
      },
    })
  })

  it('finds translated fields in arrays', () => {
    const translated = {
      title: {
        en: 'French title',
      },
      list: [
        {
          _key: 'a',
          en: 'French A',
        },
        {
          _key: 'b',
          en: 'French B',
        },
        {
          _key: 'ignoreThis',
          title: 'Not translated',
        },
        {
          _key: 'includeThis',
          en: 'Success!',
        },
      ],
    }

    const result = createPatches(translated, 'en', 'fr')
    expect(result).toEqual({
      'title.fr': 'French title',
      'list[_key == "a"].fr': 'French A',
      'list[_key == "b"].fr': 'French B',
      'list[_key == "includeThis"].fr': 'Success!',
    })
  })

  it('uses array indexing if _key is not available on all members', () => {
    const translated = {
      list: [
        {
          _key: 'a',
          en: 'Item 0',
        },
        {
          en: 'Item 1',
        },
        {
          en: 'Item 2',
        },
      ],
    }

    const result = createPatches(translated, 'en', 'fr')
    expect(result).toEqual({
      'list[0].fr': 'Item 0',
      'list[1].fr': 'Item 1',
      'list[2].fr': 'Item 2',
    })
  })

  it('finds whole translated objects', () => {
    const translated = {
      seo: {
        en: {
          title: 'SEO title',
          desc: 'SEO desc',
        },
      },
    }

    const result = createPatches(translated, 'en', 'fr')
    expect(result).toEqual({
      'seo.fr': {
        title: 'SEO title',
        desc: 'SEO desc',
      },
    })
  })
})
