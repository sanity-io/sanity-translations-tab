import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import {
  Box,
  Checkbox,
  Grid,
  Flex,
  Stack,
  Text,
  Button,
  Switch,
} from '@sanity/ui'

import { TranslationContext } from './TranslationContext'
import { TranslationLocale } from '../types'

type Props = {
  locales: TranslationLocale[]
}

type LocaleCheckboxProps = {
  locale: TranslationLocale
  toggle: (locale: string, checked: boolean) => void
  checked: boolean
}

const WrapText = styled(Box)`
  white-space: normal;
`

const LocaleCheckbox = ({ locale, toggle, checked }: LocaleCheckboxProps) => {
  return (
    <Button
      mode="ghost"
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
          //not needed because of above toggle logic, but silence React warnings.
          onChange={() => {}}
        />
        <WrapText>
          <Text size={1}>{locale.description}</Text>
        </WrapText>
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
  const [isWorkflowMT, setIsWorkflowMT] = React.useState(false)
  const [isBusy, setIsBusy] = useState(false)

  const context = useContext(TranslationContext)

  const toggleLocale = (locale: string, selected: boolean) => {
    if (!selected) {
      setSelectedLocales(selectedLocales.filter(l => l !== locale))
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
      .then(serialized => {
        return context.adapter.createTask(
          context.documentId,
          serialized,
          selectedLocales as string[],
          context.secrets,
          isWorkflowMT
        )
      })
      .then(() => {
        setIsBusy(false)
      })
  }

  const possibleLocales = locales.filter(locale => locale.enabled !== false)

  return (
    <Stack space={3}>
      <Flex align="center" justify="space-between">
        <Text weight="semibold" size={1}>
          {possibleLocales.length === 1 ? `Select locale` : `Select locales`}
        </Text>

        <Button
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
                    .filter(locale => locale.enabled !== false)
                    .map(locale => locale.localeId)
            )
          }
        />
      </Flex>
      <Grid columns={[1, 1, 2, 3]} gap={1}>
        {(locales || []).map(l => (
          <LocaleCheckbox
            key={l.localeId}
            locale={l}
            toggle={(locale, checked) => toggleLocale(locale, checked)}
            checked={selectedLocales.includes(l.localeId)}
          />
        ))}
      </Grid>

      <Flex align="flex-start">
        <Checkbox
          id="mt-checkbox"
          checked={isWorkflowMT}
          onChange={() => setIsWorkflowMT(!isWorkflowMT)}
        />
        <Box flex={1} paddingLeft={3}>
          <Text>
            <label htmlFor="mt-checkbox">
              Use Machine Translation workflow for testing
            </label>
          </Text>
        </Box>
      </Flex>

      <Button
        onClick={createTask}
        disabled={isBusy || !selectedLocales.length}
        tone="positive"
        text="Create new job"
      />
    </Stack>
  )
}
