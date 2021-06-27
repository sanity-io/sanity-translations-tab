import React from 'react'
import { Adapter, Secrets } from '../types'

export type ContextProps = {
  documentId: string
  adapter: Adapter
  importTranslation: (
    languageId: string,
    document: Record<string, any>
  ) => Promise<void>
  exportForTranslation: (documentId: string) => Promise<Record<string, any>>
  baseLanguage: string
  secrets: Secrets
}

export const TranslationContext = React.createContext<ContextProps | null>(null)
