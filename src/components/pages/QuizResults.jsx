import React from 'react';
import '@spectrum-web-components/textfield/sp-textfield.js';
import '@spectrum-web-components/accordion/sp-accordion.js';
import '@spectrum-web-components/accordion/sp-accordion-item.js';
import myUseStore from '../../store/Store';

const QuizResults = () => {
  const resultsData = myUseStore(state => state.resultsData);
  if (!resultsData) return (<div style={{ padding: '1rem' }}>No results found. Please import a quiz to see results here.</div> );
  const { result, 'result-fragments': resultFragments, 'result-destination': resultDestination } = resultsData;
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Quiz Results</h1>
      <div>
        <sp-accordion>
          <sp-accordion-item label="Results">
            <h2>Results</h2>
            {result?.data?.map((item, index) => (
              <div key={index} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '10px' }}>
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <label>{key}: </label>
                    <sp-textfield value={value} style={{ width: '100%' }}></sp-textfield>
                  </div>
                ))}
              </div>
            ))}
          </sp-accordion-item>
          <sp-accordion-item label="Result Fragments">
            <h2>Result Fragments</h2>
            {resultFragments?.data?.map((fragment, index) => (
              <div key={index} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '10px' }}>
                {Object.entries(fragment).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <label>{key}: </label>
                    <sp-textfield value={value} style={{ width: '100%' }}></sp-textfield>
                  </div>
                ))}
              </div>
            ))}
          </sp-accordion-item>
          <sp-accordion-item label="Result Destination">

            <h2>Result Destination</h2>
            {resultDestination?.data?.map((destination, index) => (
              <div key={index} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '10px' }}>
                {Object.entries(destination).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <label>{key}: </label>
                    <sp-textfield value={value} style={{ width: '100%' }}></sp-textfield>
                  </div>
                ))}
              </div>
            ))}
          </sp-accordion-item>
        </sp-accordion>
      </div>
    </div>
  );
};

export default QuizResults;
