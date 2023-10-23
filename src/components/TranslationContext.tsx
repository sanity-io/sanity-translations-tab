import React from 'react'
import {SerializedDocument} from 'sanity-naive-html-serializer'
import {Adapter, Secrets, WorkflowIdentifiers} from '../types'
import {SanityDocumentLike} from 'sanity'

export type ContextProps = {
  documentId: string
  adapter: Adapter
  importTranslation: (languageId: string, document: string) => Promise<void>
  exportForTranslation: (documentId: string) => Promise<SerializedDocument>
  baseLanguage: string
  secrets: Secrets
  workflowOptions?: WorkflowIdentifiers[]
  localeIdAdapter?: (id: string) => string | Promise<string>
  callbackUrl?: (document: SanityDocumentLike) => string
}

export const TranslationContext = React.createContext<ContextProps | null>(null)
