import React from 'react'
import { Adapter, Secrets, WorkflowIdentifiers } from '../types'

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
  workflowOptions?: WorkflowIdentifiers[]
  localeIdAdapter?: (id: string) => string | Promise<string>
}

export const TranslationContext = React.createContext<ContextProps | null>(null)
