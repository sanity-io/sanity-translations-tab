import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TranslationTab, DummyAdapter } from '../.';

const mock ={
  displayed: {
    _id: "test",
    _type: "test",
    _rev: "test",
    _createdAt: "test",
    _updatedAt: "test"
  }
}

const App = () => {
  const options = {
    adapter: DummyAdapter,
    baseLanguage: "en",
    exportForTranslation: () => {},
    importTranslation: (id: string, localeId: string, doc: Record<string, any>) => {}
  }

  return (
    <div>
      <TranslationTab document={mock} options={options} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
