import React, { useState, useContext } from 'react'
import { TranslationContext } from './TranslationContext'
import { TranslationLocale } from '../types'
import { Box, Grid, Flex, Stack, Text, Button, Switch } from '@sanity/ui'

type Props = {
  locales: TranslationLocale[]
}

type LocaleCheckboxProps = {
  locale: TranslationLocale
  toggle: (locale: string, checked: boolean) => void
  checked: boolean
}

const LocaleCheckbox = ({ locale, toggle, checked }: LocaleCheckboxProps) => {
  return (
    <Button
      mode="ghost"
      tone="positive"
      onClick={() => {
        toggle(locale.localeId, !checked)
      }}
      disabled={locale.enabled === false}
      style={{ cursor: `pointer` }}
      radius={2}
    >
      <Flex align="center" gap={3}>
        <Switch
          style={{ pointerEvents: `none` }}
          disabled={locale.enabled === false}
          checked={checked}
        />
        <Box>
          <Text size={1} weight="semibold">
            {locale.description}
          </Text>
        </Box>
      </Flex>
    </Button>
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
      setSelectedLocales(selectedLocales.filter((l) => l !== locale))
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
    context
      .exportForTranslation(context.documentId)
      .then((serialized) => {
        return context.adapter.createTask(
          context.documentId,
          serialized,
          selectedLocales as string[],
          context.secrets
        )
      })
      .then(() => {
        setIsBusy(false)
      })
  }

  const possibleLocales = locales.filter((locale) => locale.enabled !== false)

  return (
    <Stack space={3}>
      <Flex align="center">
        <Text weight="semibold" size={1}>
          Select locales
        </Text>

        <Button
          style={{ marginLeft: `auto` }}
          fontSize={1}
          padding={2}
          text="Toggle All"
          onClick={() =>
            setSelectedLocales(
              possibleLocales.length === selectedLocales.length
                ? // Disable all
                  []
                : // Enable all
                  locales
                    .filter((locale) => locale.enabled !== false)
                    .map((locale) => locale.localeId)
            )
          }
        />
      </Flex>
      <Grid columns={[1, 1, 2, 3]} gap={1}>
        {(locales || []).map((l) => (
          <LocaleCheckbox
            key={l.localeId}
            locale={l}
            toggle={(locale, checked) => toggleLocale(locale, checked)}
            checked={selectedLocales.includes(l.localeId)}
          />
        ))}
      </Grid>

      <Button
        onClick={createTask}
        disabled={isBusy || !selectedLocales.length}
        tone="positive"
        text="Create new job"
      />
    </Stack>
  )
}
