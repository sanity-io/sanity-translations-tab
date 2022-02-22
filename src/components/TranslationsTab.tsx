import React, { useMemo } from 'react'
import { SanityDocument } from '@sanity/client'
import { randomKey } from '@sanity/util/content'
import {
  ThemeProvider,
  ToastProvider,
  Stack,
  Text,
  Layer,
  Box,
  Card,
  Flex,
  Spinner,
} from '@sanity/ui'

import { TranslationContext } from './TranslationContext'
import { TranslationView } from './TranslationView'
import { useSecrets } from '../hooks/useSecrets'
import { Adapter, Secrets, WorkflowIdentifiers } from '../types'

type TranslationTabProps = {
  document: {
    displayed: SanityDocument
  }
  options: {
    adapter: Adapter
    baseLanguage: string
    secretsNamespace: string | null
    exportForTranslation: (id: string) => Promise<Record<string, any>>
    importTranslation: (
      id: string,
      localeId: string,
      doc: Record<string, any>
    ) => Promise<void>
    workflowOptions?: WorkflowIdentifiers[]
    localeIdAdapter?: (id: string) => string
  }
}

const TranslationTab = (props: TranslationTabProps) => {
  const { displayed } = props.document

  const documentId =
    displayed && displayed._id
      ? (displayed._id.split('drafts.').pop() as string)
      : ''

  const { errors, importTranslation, exportForTranslation } = useMemo(() => {
    let allErrors = []

    const importTranslationFunc = props.options.importTranslation
    if (!importTranslationFunc) {
      allErrors.push({
        key: randomKey(12),
        text: (
          <>
            You need to provide an <code>importTranslation</code> function. See
            documentation.
          </>
        ),
      })
    }

    const importTranslation = (localeId: string, doc: Record<string, any>) => {
      return importTranslationFunc(documentId, localeId, doc)
    }

    const exportTranslationFunc = props.options.exportForTranslation
    if (!exportTranslationFunc) {
      allErrors.push({
        key: randomKey(12),
        text: (
          <>
            You need to provide an <code>exportForTranslation</code> function.
            See documentation.
          </>
        ),
      })
    }

    const exportForTranslation = (id: string) => {
      return exportTranslationFunc(id)
    }

    return { errors: allErrors, importTranslation, exportForTranslation }
  }, [props.options, documentId])

  const { loading, secrets } = useSecrets<Secrets>(
    `${props.options.secretsNamespace || 'translationService'}.secrets`
  )

  const hasErrors = errors.length > 0

  if (loading || !secrets) {
    return (
      <ThemeProvider>
        <Flex padding={5} align="center" justify="center">
          <Spinner />
        </Flex>
      </ThemeProvider>
    )
  } else if (!secrets) {
    return (
      <ThemeProvider>
        <Box padding={4}>
          <Card tone="caution" padding={[2, 3, 4, 4]} shadow={1} radius={2}>
            <Text>
              Can't find secrets for your translation service. Did you load them
              into this dataset?
            </Text>
          </Card>
        </Box>
      </ThemeProvider>
    )
  } else {
    return (
      <ThemeProvider>
        <Box padding={4}>
          <Layer zOffset={1000}>
            <ToastProvider paddingY={7}>
              {hasErrors && (
                <Stack space={3}>
                  {errors.map(error => (
                    <Card
                      key={error.key}
                      tone="caution"
                      padding={[2, 3, 4, 4]}
                      shadow={1}
                      radius={2}
                    >
                      <Text>{error.text}</Text>
                    </Card>
                  ))}
                </Stack>
              )}
              {!hasErrors && (
                <TranslationContext.Provider
                  value={{
                    documentId,
                    secrets,
                    importTranslation,
                    exportForTranslation,
                    adapter: props.options.adapter,
                    baseLanguage: props.options.baseLanguage,
                    workflowOptions: props.options.workflowOptions,
                    localeIdAdapter: props.options.localeIdAdapter,
                  }}
                >
                  <TranslationView />
                </TranslationContext.Provider>
              )}
            </ToastProvider>
          </Layer>
        </Box>
      </ThemeProvider>
    )
  }
}

export default TranslationTab
