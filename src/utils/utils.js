import { generateCombinationsBasedOnMax } from './combinations';

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

    // If the resultsPath includes 'www.adobe.com', fetch the headers for the URLs
    const statusResultsAcom = [];
    for (const url of uniqueUrls) {
      const result = {};
      const result1 = await fetchHeaders(url);
      if (sheetName !== 'result-destination' && (resultsPath.includes('www.adobe.com'))) {
        let urlLive = '';
        if (resultsPath.includes('www.adobe.com')) {
          urlLive = url.replace('www.adobe.com', 'main--cc--adobecom.hlx.live');
        }
        
        const result2 = await fetchHeaders(urlLive);
        if (result1 && result2) {
          result['url'] = url;
          result['status'] = (result1.status === 200 && result2.status === 200) ? 200 : 404;
          result['last-modified'] = result1['last-modified'];

          if (result1['last-modified'] === result2['last-modified']) {
            result['cache-status'] = '✅';
          } else {
            result['cache-status'] = '❌';
          }
        }
      } else {
        result['url'] = url;
        result['status'] = result1.status;
        result['last-modified'] = result1['last-modified'];
      }

      statusResultsAcom.push(result);
    }
    statusResults.push(...statusResultsAcom);

    return statusResults.sort((a, b) => b.status - a.status);
  }
}
// Helper functions to extract IDs from both JSON structures
const extractQuestionIdsFromQuestions = (data) => data.questions.data.map(item => item.questions);
const extractQuestionIdsFromStrings = (data) => data.questions.data.map(item => item.q);

// Severity
// 0 - neutral, 1 - info, 2 - positive, 3 - notice, 4 - negative
const createValidationResult = (isValid, severity, heading, body, source) => {
  const title = {'questions': ' (Questions)', 'strings': ' (Strings)', 'results': ' (Results)'};
  
  return {
    status: isValid ? 'valid' : 'invalid',
    severity: isValid ? severity[0] : severity[1],
    heading: heading + title[source],
    body: body,
  };
};

const validateUniqueQuestionIds = (data, extractIdsFunc, source) => {
  const ids = extractIdsFunc(data);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const isValid = duplicates.length === 0;
  const body = isValid ? 'All question IDs are unique.' : `Duplicate IDs found: ${duplicates.join(', ')}.`;
  return createValidationResult(isValid, ['positive','negative'], 'Unique Question IDs', body, source);
};

const validateSelections = (data) => {
  const issues = data.questions.data.filter(q => {
    const min = parseInt(q['min-selections'], 10);
    const max = parseInt(q['max-selections'], 10);
    return isNaN(min) || isNaN(max) || min > max || max < min;
  });
  const isValid = issues.length === 0;
  const body = isValid ? 'Min/max selections are valid.' : 'Issues with min/max selections.';
  return createValidationResult(isValid, ['positive','negative'], 'Selections Validation', body, 'questions');
};

const validateNamesArray = (data, expectedNames, source) => {
  const namesFromData = data[':names'].filter(name => name !== 'questions').sort();
  const missingNames = expectedNames.filter(name => !namesFromData.includes(name));
  const unexpectedNames = namesFromData.filter(name => !expectedNames.includes(name));
  const isValid = missingNames.length === 0 && unexpectedNames.length === 0;
  const body = isValid ? 'The :names array accurately reflects the expected question IDs.'
                       : `Missing expected names: ${missingNames.join(', ')}. Unexpected names found: ${unexpectedNames.join(', ')}.`;
  return createValidationResult(isValid, ['positive','negative'], 'Names Array Integrity', body, source);
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

  return createValidationResult(isEndFlowValid, ['positive','negative'], 'End Flow Check', body, 'questions');
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

// Severity
// 0 - neutral, 1 - info, 2 - positive, 3 - notice, 4 - negative
const validatePrimaryResult = (resultData) => {
  const resultPrimary = [];
  
  resultData.result.data.forEach((item, index) => {
    if (item['result-primary'] === '') {
      resultPrimary.push(index+2);
    }
  });

  const isValid = resultPrimary.length === 0;
  const body = isValid ? `You have authored ${resultData.result.total} questions and all have primary results` 
        : `Some questions are missing primary results. Please check these indexes(helix-result): ${resultPrimary.join(', ')}.`;
  return createValidationResult(isValid, ['positive','negative'], 'Total Results and Primary Results', body, 'results');
}

const validateSecondaryResult = (resultData) => {
  const resultSecondary = [];
  
  resultData.result.data.forEach((item, index) => {
    if (item['result-secondary'] === '') {
      resultSecondary.push(index+2);
    }
  });

  const isValid = resultSecondary.length === 0;
  const body = isValid ? `You have authored all questions with secondary results` 
        : `Some questions are missing secondary results. Please check these indexes(helix-result): ${resultSecondary.join(', ')}.`;
  return createValidationResult(isValid, ['positive','info'], 'Secondary Results', body, 'results');
}

export const performValidationResults = (questionsData, stringsData, resultData) => {

  const validations = [
    validatePrimaryResult(resultData),
    validateSecondaryResult(resultData),
    validateResultsCoverage(questionsData, resultData),
    validateResultsCoverageRedundance(questionsData, resultData),
    validatePrimaryResultRules(resultData),
    validateResultURL(resultData),
    validateBaseFragments(resultData),
  ];

  return validations;
};

const validateResultsCoverage = (questionsData, resultData) => {
  const firstQuestion = questionsData['questions'].data[0].questions;
  const firstQuestionMax = questionsData['questions'].data[0]['max-selections'];

  const allCombinations = generateCombinationsBasedOnMax(questionsData, firstQuestion, firstQuestionMax);

  let missingResults = [];
  allCombinations['1'].forEach((itemSelected, index) => {
    // Use Array.some() to find if there's a match and break early
    const isMatch = resultData.result.data.some(result => {
      return Object.keys(itemSelected).every(key => result[key] === itemSelected[key]);
    });
  
    // Directly set the 'isMatch' status based on the outcome
    allCombinations['1'][index]['isMatch'] = isMatch;

    if (!isMatch) {
      missingResults.push(index+2);
    }
  });

  console.log(allCombinations);

  const isValid = missingResults.length == 0;
  const body = isValid ? `You have authored and covered all possible results for the first single question.` 
        : `Some questions are missing results(helix-result): ${missingResults.join(', ')}`;
  return createValidationResult(isValid, ['positive','negative'], 'Results Coverage for Single Selection', body, 'results');
}

const validateResultsCoverageRedundance = (questionsData, resultData) => {
  const firstQuestion = questionsData['questions'].data[0].questions;
  const firstQuestionMax = questionsData['questions'].data[0]['max-selections'];

  const allCombinations = generateCombinationsBasedOnMax(questionsData, firstQuestion, firstQuestionMax);
  
  let matchedResultIndices = new Set();
  allCombinations['1'].forEach((itemSelected, index) => {
    // Use Array.some() to find if there's a match and break early
    const isMatch = resultData.result.data.some((result, index) => {
      if (Object.keys(itemSelected).every(key => result[key] === itemSelected[key])) {
        matchedResultIndices.add(index);
        return true;
      } else {
        return false;
      } 
    });
  
    // Directly set the 'isMatch' status based on the outcome
    allCombinations['1'][index]['isMatch'] = isMatch;
  });

  let unmatchedResults = resultData.result.data.reduce((acc, _, index) => {
    if (!matchedResultIndices.has(index)) {
      acc.push(index+2); // Collect the index if it's not in matchedResultIndices
    }
    return acc;
  }, []);

  const isValid = allCombinations['1'].length == resultData.result.total;
  const body = isValid ? `You have authored and covered all possible results for the first single question.` 
        : `Some redundance results(helix-result): ${unmatchedResults.join(', ')}`;
  return createValidationResult(isValid, ['positive','notice'], 'Redundance Results Coverage for Single Selection', body, 'results');
}

const validatePrimaryResultRules = (resultData) => {
  const missingResultRules = [];
  
  resultData.result.data.forEach((item) => {
    let isMatch = false;
    resultData['result-destination'].data.forEach((destination) => {
      if (destination['result'].includes(item['result-primary'])) {
        isMatch = true;
      }
    });
    if (!isMatch) {
      missingResultRules.push(item['result-primary']);
    }
  });

  const isValid = missingResultRules.length === 0;
  const body = isValid ? `You have authored result rules and cover all primary results.` 
        : `Some primary results are missing result rules. Please check these indexes(helix-result-destination): ${missingResultRules.join(', ')}.`;
  return createValidationResult(isValid, ['positive','negative'], 'Result Rules for Primary Results', body, 'results');
}

const validateResultURL = (resultData) => {
  const missingResultURL = [];
  
  
  resultData['result-destination'].data.forEach((destination, index) => {
      if (destination['url'] === '') {
        missingResultURL.push(index + 2);
      }
  });

  const isValid = missingResultURL.length === 0;
  const body = isValid ? `You have authored result urls for all result rules.` 
        : `Some result rules are missing result urls. Please check these indexes(helix-result-destination): ${missingResultURL.join(', ')}.`;
  return createValidationResult(isValid, ['positive','negative'], 'Result Urls', body, 'results');
}

const validateBaseFragments = (resultData) => {
  const missingBaseFragments = [];
  
  
  resultData['result-destination'].data.forEach((destination, index) => {
      if (destination['basic-fragments'] === '') {
        missingBaseFragments.push(index + 2);
      }
  });

  const isValid = missingBaseFragments.length === 0;
  const body = isValid ? `You have authored base fragments for all result rules.` 
        : `Some result rules are missing base fragments. Please check these indexes(helix-result-destination): ${missingBaseFragments.join(', ')}.`;
  return createValidationResult(isValid, ['positive','negative'], 'Result Base Fragments', body, 'results');
}