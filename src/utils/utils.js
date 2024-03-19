// fetch results.json
export async function fetchResultsJson(path) {
    const result = await fetch(path)
    .then((response) => response.json())
    .catch((error) => console.log(`ERROR: Fetching URLs status ${error}`));
  
    return result;
}

// process URLs
export const processUrls = async (urls) => {
    const result = await fetchURLsStatusBySpidy(urls);
    if (result && result.length > 0) {
      return result;
    }
};

// fetch URL status by spidy
export async function fetchURLsStatusBySpidy(urls) {
  const apiUrl = "https://spidy.corp.adobe.com/api/url-http-status";
  const params = {
    urls: urls,
  };

  let result;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      result = await response.json();
    }
  } catch (error) {
    console.error(`Error: Fetching URLs status ${error}`);
  }

  return result.data;
}

// fetch headers
export async function fetchHeaders(url) {
  const result = {};

  try {
      const response = await fetch(url, { method: 'HEAD' });
      result['url'] = url;
      result['status'] = response.status;
      for (let [key, value] of response.headers) {
          if (key === 'last-modified') {
              result['last-modified'] = value;
          }
      }
  } catch (error) {
      console.error('Error:', error);
      result['url'] = url;
      result['status'] = '404';
  }

  return result;
}

// extract URLs from sheet
export function extractUrls(sheetName, resultsPath) {
  const urls = sheetName.data.flatMap(fragment => Object.values(fragment).filter(url => typeof url === 'string' && (url.startsWith('http') || url.startsWith('/')))
  );

  // Remove duplicate URLs
  let uniqueUrls = [...new Set(urls)];
  const updateUrls = [];

  // Split URLs with comma
  uniqueUrls.forEach((url) => {
    if (url.includes(',')) {
      updateUrls.push(...url.split(','));
    } else if (url.startsWith('/')) {
      // If the URL is a relative path, prepend the website URL
      let parts = resultsPath.split("/");
      let domain = parts.slice(0, 3).join("/");
      updateUrls.push(domain + url);
    } else {
      updateUrls.push(url);
    }
  });

  // Remove duplicate URLs
  uniqueUrls = [...new Set(updateUrls)];
  return uniqueUrls;
}

// check URL status by spidy and fetch headers
export async function handleResults(results, sheetName, resultsPath) {
  const items = results[sheetName];

  if (items && items.data) {
    // Extract URLs from result fragments
    let uniqueUrls = extractUrls(items, resultsPath);

    const statusResults = [];

    // // Process in batches of 20 URLs by calling the Spidy API
    // for (let i = 0; i < uniqueUrls.length; i += 20) {
    //   const updateResults = await processUrls(uniqueUrls.slice(i, i + 20));
    //   if (updateResults) {
    //     statusResults.push(...updateResults);
    //   }
    // }

    // // If the resultsPath includes 'www.adobe.com', fetch the headers for the URLs
    // const statusResults2 = [];
    // for (const url of uniqueUrls) {
    //   const result = {};
    //   const result1 = await fetchHeaders(url);
    //   if (sheetName !== 'result-destination' && (resultsPath.includes('www.adobe.com') || resultsPath.includes('www.stage.adobe.com'))) {
    //     let urlLive = '';
    //     if (resultsPath.includes('www.adobe.com')) {
    //       urlLive = url.replace('www.adobe.com', 'main--cc--adobecom.hlx.live');
    //     } else {
    //       urlLive = url.replace('www.stage.adobe.com', 'main--cc--adobecom.hlx.live');
    //     }
    //     const result2 = await fetchHeaders(urlLive);
    //     if (result1 && result2) {
    //       result['url'] = url;
    //       result['status'] = (result1.status === 200 && result2.status === 200) ? 200 : 404;
    //       result['last-modified'] = result1['last-modified'];

    //       if (result1['last-modified'] === result2['last-modified']) {
    //         result['cache-status'] = '✅';
    //       } else {
    //         result['cache-status'] = '❌';
    //       }
    //     }
    //   } else {
    //     result['url'] = url;
    //     result['status'] = result1.status;
    //     result['last-modified'] = result1['last-modified'];
    //   }

    //   statusResults2.push(result);
    // }
    // statusResults.push(...statusResults2);

    return statusResults.sort((a, b) => b.status - a.status);
  }
}
// Helper functions to extract IDs from both JSON structures
const extractQuestionIdsFromQuestions = (data) => data.questions.data.map(item => item.questions);
const extractQuestionIdsFromStrings = (data) => data.questions.data.map(item => item.q);

const createValidationResult = (isValid, heading, body, source) => {
  return {
    status: isValid ? 'valid' : 'invalid',
    severity: isValid ? 'positive' : 'negative',
    heading: heading + (source === 'questions' ? ' (Questions)' : ' (Strings)'),
    body: body,
  };
};

const validateUniqueQuestionIds = (data, extractIdsFunc, source) => {
  const ids = extractIdsFunc(data);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const isValid = duplicates.length === 0;
  const body = isValid ? 'All question IDs are unique.' : `Duplicate IDs found: ${duplicates.join(', ')}.`;
  return createValidationResult(isValid, 'Unique Question IDs', body, source);
};

const validateSelections = (data) => {
  const issues = data.questions.data.filter(q => {
    const min = parseInt(q['min-selections'], 10);
    const max = parseInt(q['max-selections'], 10);
    return isNaN(min) || isNaN(max) || min > max || max < min;
  });
  const isValid = issues.length === 0;
  const body = isValid ? 'Min/max selections are valid.' : 'Issues with min/max selections.';
  return createValidationResult(isValid, 'Selections Validation', body, 'questions');
};

const validateNamesArray = (data, expectedNames, source) => {
  const namesFromData = data[':names'].filter(name => name !== 'questions').sort();
  const missingNames = expectedNames.filter(name => !namesFromData.includes(name));
  const unexpectedNames = namesFromData.filter(name => !expectedNames.includes(name));
  const isValid = missingNames.length === 0 && unexpectedNames.length === 0;
  const body = isValid ? 'The :names array accurately reflects the expected question IDs.'
                       : `Missing expected names: ${missingNames.join(', ')}. Unexpected names found: ${unexpectedNames.join(', ')}.`;
  return createValidationResult(isValid, 'Names Array Integrity', body, source);
};


const validateEndFlow = (questionsData) => {
  // Find the last question based on the 'next' attribute pointing to 'RESULT'
  const lastQuestionKey = Object.keys(questionsData).find(key => {
    return questionsData[key].data && questionsData[key].data.every(option => option.next === 'RESULT');
  });

  const isEndFlowValid = Boolean(lastQuestionKey); // true if lastQuestionKey is found, false otherwise
  const body = isEndFlowValid
    ? `All paths in '${lastQuestionKey}' correctly end with RESULT leading to the results page.`
    : 'No question has all paths ending with RESULT, indicating the quiz may not have a proper end.';

  return createValidationResult(isEndFlowValid, 'End Flow Check', body, 'questions');
};

export const performValidations = (questionsData, stringsData) => {
  const questionsIds = extractQuestionIdsFromQuestions(questionsData);
  const stringsIds = extractQuestionIdsFromStrings(stringsData);

  const validations = [
    validateUniqueQuestionIds(questionsData, extractQuestionIdsFromQuestions, 'questions'),
    validateUniqueQuestionIds(stringsData, extractQuestionIdsFromStrings, 'strings'),
    validateSelections(questionsData),
    validateNamesArray(stringsData, questionsIds, 'strings'),
    validateNamesArray(questionsData, questionsIds, 'questions'),
    validateEndFlow(questionsData),
  ];

  // Augment validations with the source information
  validations.forEach(validation => {
    validation.source = validation.heading.includes('(Questions)') ? 'questions' : 'strings';
  });

  return validations;
};