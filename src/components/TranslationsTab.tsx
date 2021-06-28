import React from 'react'
import { SanityDocument } from '@sanity/client'
import { TranslationContext } from './TranslationContext'
import { TranslationView } from './TranslationView'
import { useSecrets } from '../hooks/useSecrets'
import {
  ThemeProvider,
  ToastProvider,
  studioTheme,
  Text,
  Layer,
  Container,
} from '@sanity/ui'
import { Adapter, Secrets } from '../types'

type TranslationTabProps = {
  document: {
    displayed: SanityDocument
  }
  options: {
    adapter: Adapter
    baseLanguage: string
    exportForTranslation: (id: string) => Promise<Record<string, any>>
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

  const exportTranslationFunc = props.options.exportForTranslation
  if (!exportTranslationFunc) {
    errors.push(
      'You need to provide an exportForTranslation function. See documentation.'
    )
  }

  const exportForTranslation = (id: string) => {
    return exportTranslationFunc(id)
  }

  const { loading, secrets } = useSecrets<Secrets>('translationService.secrets')

  const hasErrors = errors.length > 0

  if (loading || !secrets) {
    return <span>Loading...</span>
  } else if (!secrets) {
    return (
      <span>
        Can't find secrets for your translation service. Did you load them into
        this datastore?
      </span>
    )
  } else {
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
                    secrets,
                    importTranslation,
                    exportForTranslation,
                    adapter: props.options.adapter,
                    baseLanguage: props.options.baseLanguage,
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
}

export default TranslationTab
