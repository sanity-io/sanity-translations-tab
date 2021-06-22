import React, { useState, useContext } from 'react'
import { TranslationContext } from './TranslationContext'
import { TranslationLocale } from '../types'
import {
  Box,
  Grid,
  Card,
  Checkbox,
  Flex,
  Stack,
  Text,
  Button,
} from '@sanity/ui'

type Props = {
  locales: TranslationLocale[]
}

type LocaleCheckboxProps = {
  locale: TranslationLocale
  toggle: (locale: string, checked: boolean) => void
}

const LocaleCheckbox = ({ locale, toggle }: LocaleCheckboxProps) => {
  return (
    <Card as="label" border radius={1} padding={2}>
      <Flex align="center">
        <Checkbox
          disabled={locale.enabled === false}
          onChange={event => {
            const target = event.target as HTMLInputElement
            toggle(locale.localeId, target.checked)
          }}
          style={{ verticalAlign: 'top' }}
        />
        <Box marginLeft={3}>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              {locale.description}
            </Text>
          </Stack>
        </Box>
      </Flex>
    </Card>
  )
}

export const NewTask = ({ locales }: Props) => {
  // Lets just stick to the canonical document id for keeping track of
  // translations
  const [selectedLocales, setSelectedLocales] = React.useState<
    React.ReactText[]
  >([])
  const [isBusy, setIsBusy] = useState(false)

  const context = useContext(TranslationContext)

  const toggleLocale = (locale: string, selected: boolean) => {
    if (!selected) {
      setSelectedLocales(selectedLocales.filter(l => l == locale))
    } else if (!selectedLocales.includes(locale)) {
      setSelectedLocales([...selectedLocales, locale])
    }
  }

  const createTask = async () => {
    if (!context) {
      console.error('Missing context')
      return
    }
    setIsBusy(true)
    context.adapter
      .createTask(context.documentId, selectedLocales as string[])
      .then(() => {
        setIsBusy(false)
      })
  }

  return (
    <Box>
      <Text as="label" weight="semibold" size={1}>
        Select locales
      </Text>
      <Grid marginTop={2} columns={[1, 1, 2, 3]} gap={1} paddingBottom={2}>
        {(locales || []).map(l => (
          <LocaleCheckbox
            key={l.localeId}
            locale={l}
            toggle={(locale, checked) => {
              toggleLocale(locale, checked)
            }}
          />
        ))}
      </Grid>

      <Box marginBottom={5}>
        <Button
          onClick={createTask}
          disabled={isBusy || !selectedLocales.length}
          tone="primary"
          text="Create new"
        />
      </Box>
    </Box>
  )
}
