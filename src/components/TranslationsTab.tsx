import React from 'react'
import { SanityDocument } from '@sanity/client'
import { TranslationContext } from './TranslationContext'
import { TranslationView } from './TranslationView'
import {
  ThemeProvider,
  ToastProvider,
  studioTheme,
  Text,
  Layer,
  Container,
} from '@sanity/ui'
import { Adapter } from '../types'

type TranslationTabProps = {
  document: {
    displayed: SanityDocument
  }
  options: {
    adapter: Adapter
    baseLanguage: string
    exportForTranslation: () => void
    importTranslation: (
      id: string,
      localeId: string,
      doc: Record<string, any>
    ) => Promise<void>
  }
}

const TranslationTab = (props: TranslationTabProps) => {
  const { displayed } = props.document
  const documentId = displayed._id.split('drafts.').pop() as string

  const errors = []
  const importTranslationFunc = props.options.importTranslation
  if (!importTranslationFunc) {
    errors.push(
      'You need to provide an importTranslation function. See documentation.'
    )
  }

  const importTranslation = (localeId: string, doc: Record<string, any>) => {
    return importTranslationFunc(documentId, localeId, doc)
  }

  const hasErrors = errors.length > 0

  return (
    <ThemeProvider theme={studioTheme}>
      <Container width={1} paddingTop={4} marginBottom={0}>
        <Layer zOffset={1000}>
          <ToastProvider>
            {hasErrors && errors.map(e => <Text>{e}</Text>)}
            {!hasErrors && (
              <TranslationContext.Provider
                value={{
                  documentId,
                  adapter: props.options.adapter,
                  baseLanguage: props.options.baseLanguage,
                  importTranslation,
                }}
              >
                <TranslationView />
              </TranslationContext.Provider>
            )}
          </ToastProvider>
        </Layer>
      </Container>
    </ThemeProvider>
  )
}

export default TranslationTab
