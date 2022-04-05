import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { TranslationsTab, DummyAdapter } from '../.'

const mock = {
  displayed: {
    _id: 'test',
    _type: 'test',
    _rev: 'test',
    _createdAt: 'test',
    _updatedAt: 'test',
  },
}

const App = () => {
  const options = {
    adapter: DummyAdapter,
    baseLanguage: 'en',
    secretsNamespace: 'translationService',
    exportForTranslation: async props => props,
    importTranslation: async props => props,
  }

  return (
    <div>
      <TranslationsTab document={mock} options={options} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
