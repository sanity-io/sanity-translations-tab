import React from 'react'

import { Adapter } from '../types'

export type ContextProps = {
  documentId: string
  adapter: Adapter
  importTranslation: (
    languageId: string,
    document: Record<string, any>
  ) => Promise<void>
  baseLanguage: string
}

export const TranslationContext = React.createContext<ContextProps | null>(null)
