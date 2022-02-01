import React, { useContext } from 'react'
import { Box, Heading, Stack, useToast } from '@sanity/ui'

import { TranslationContext } from './TranslationContext'
import { TranslationLocale, TranslationTask } from '../types'
import { LanguageStatus } from './LanguageStatus'

type JobProps = {
  task: TranslationTask
  locales: TranslationLocale[]
}

const getLocale = (
  localeId: string,
  locales: TranslationLocale[]
): TranslationLocale | undefined => locales.find(l => l.localeId === localeId)

export const TaskView = ({ task, locales }: JobProps) => {
  const context = useContext(TranslationContext)
  const toast = useToast()

  const importFile = async (localeId: string) => {
    if (!context) {
      console.error('Missing context')
      toast.push({
        title:
          'Missing context, unable to import translation. Try refreshing or clicking away from this tab and back.',
        status: 'error',
        closable: true,
      })
      return
    }

    const locale = getLocale(localeId, locales)
    const localeTitle = locale?.description || localeId

    try {
      const translation = await context.adapter.getTranslation(
        task.taskId,
        localeId,
        context.secrets
      )
      console.log('here 1', translation)
      const successfulImport = await context.importTranslation(
        localeId,
        translation
      )
      console.log('here 2', successfulImport)
      toast.push({
        title: `Imported ${localeTitle} translation`,
        status: 'success',
        closable: true,
      })
    } catch (error) {
      console.error('Error made it to TaskView:')
      console.log(error && error.message)
      toast.push({
        title: `Error getting ${localeTitle} translation`,
        status: 'error',
        closable: true,
      })
    }

    // context.adapter
    //   .getTranslation(task.taskId, localeId, context.secrets)
    //   .then((record): boolean => {
    //     if (record) {
    //       context.importTranslation(localeId, record)
    //       return true
    //     } else {
    //       // TODO: Handle this in a toast
    //       alert('Error getting the translated content!')
    //       return false
    //     }
    //   })
    //   .then(success => {
    //     toast.push(
    //       success
    //         ? { title: 'Success', status: 'success', closable: true }
    //         : { title: 'Failure', status: 'error' }
    //     )
    //   })
    //   .catch(() => {
    //     toast.push({
    //       title: 'Error getting the translated content!',
    //       status: 'error',
    //     })
    //   })
  }

  return (
    <Stack space={4}>
      <Heading as="h2" weight="semibold" size={2}>
        Current Job Progress
      </Heading>
      <Box>
        {task.locales.map(localeTask => {
          const reportPercent = localeTask.progress || 0
          const locale = getLocale(localeTask.localeId, locales)
          return (
            <LanguageStatus
              key={[task.taskId, localeTask.localeId].join('.')}
              importFile={() => {
                importFile(localeTask.localeId)
              }}
              title={locale?.description || localeTask.localeId}
              progress={reportPercent}
            />
          )
        })}
      </Box>
    </Stack>
  )
}
