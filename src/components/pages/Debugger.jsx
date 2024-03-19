import UrlsChecker from './UrlsChecker';
import '@spectrum-web-components/textfield/sp-textfield.js';
import '@spectrum-web-components/accordion/sp-accordion.js';
import '@spectrum-web-components/accordion/sp-accordion-item.js';
import '@spectrum-css/table';
import '@spectrum-css/inlinealert';
import zStore from '../../store/Store';

const Debugger = () => {
  const validationResults = zStore((state) => state.validationResults);
  const selectedWebsite = zStore((state) => state.baseUrl);

  const isOptionExisting = (selector, text, value) => {
    const selectElement = document.querySelector(selector);
    let optionExists = false;

    if (selectElement) {
      Array.from(selectElement.options).forEach((option) => {
        if (option.value === value &&  option.text === text) {
          optionExists = true;
        }
      });
    }
    
    return optionExists;
  };

  const updateSelectElement = () => {
    const baseUrl = zStore(state => state.baseUrl);
    const selectElement = document.querySelector('#websites');

    if (baseUrl) {
      if (!isOptionExisting('#websites', baseUrl, baseUrl)) {
        const option = document.createElement("option");
        option.text = baseUrl;
        option.vale = baseUrl;
        option.selected = true;

        if (selectElement) {
          selectElement.appendChild(option);
        }
      }
    } else {
      if (!isOptionExisting('#websites', '-- No Import Data, Please choose an option --', '-- No Import Data, Please choose an option --')) {
        const option = document.createElement("option");
        option.text = '-- No Import Data, Please choose an option --';
        option.value = '-- No Import Data, Please choose an option --'
        option.selected = true;

        if (selectElement) {
          selectElement.appendChild(option);
        }
      }
    }
  };
  
  const handleSelectChange = (event) => {
    setSelectedWebsite(event.target.value);
  };

  return (
    <div className='container'>
      <h1>Quiz Info &amp; Debugging</h1>
      <label htmlFor="websites">Select a website:</label>

      <select name="websites" id="websites" onChange={handleSelectChange} >
        <option value="https://main--milo--adobecom.hlx.live/drafts/quiz/quiz-2/">https://main--milo--adobecom.hlx.live/drafts/quiz/quiz-2/</option>
        <option value="https://www.adobe.com/creativecloud/plan-recommender/">https://www.adobe.com/creativecloud/plan-recommender/quiz</option>
        <option value="https://main--cc--adobecom.hlx.live/creativecloud/plan-recommender/">https://main--cc--adobecom.hlx.live/creativecloud/plan-recommender/quiz</option>
        <option value="https://main--cc--adobecom.hlx.live/products/photoshop/plan-recommender/">https://main--cc--adobecom.hlx.live/products/photoshop/plan-recommender/quiz</option>
        <option value="https://www.stage.adobe.com/products/photoshop/plan-recommender/">https://www.stage.adobe.com/products/photoshop/plan-recommender/quiz</option>
      </select>
      <div><b>Title:</b> UAR Quiz</div>
      <div><b>Author:</b> UAR Team</div>
      <div><b>Created:</b> 2021-05-31T23:00:00Z</div>
      <div><b>Updated:</b> 2021-05-31T23:00:00Z</div>
      <div><b>Status:</b> Published</div>

      {updateSelectElement()}

      <h2>404 Checker</h2>

      {/* <UrlsChecker resultsPath={selectedWebsite}></UrlsChecker> */}

      <h2>Quiz Validation</h2>
      {validationResults.map((validation, index) => (
        <div key={index} className={`spectrum-InLineAlert spectrum-InLineAlert--${validation.severity}`}>
          <div className="spectrum-InLineAlert-header">
            {validation.heading}
          </div>
          <div className="spectrum-InLineAlert-content">{validation.body}</div>
        </div>
      ))}
      
      {/* <hr />
      <h2>Results Validation</h2>
      <div className="spectrum-InLineAlert">
        <div className="spectrum-InLineAlert-header">
          Results Impact
          <svg className="spectrum-Icon spectrum-Icon--sizeM spectrum-InLineAlert-icon" focusable="false" aria-hidden="true">
            <use xlinkHref="#spectrum-icon-18-CheckmarkCircle" />
          </svg>
        </div>
        <div className="spectrum-InLineAlert-content">You have authored 42 questions and have an authoring impact of 3,295.</div>
      </div>

      <div className="spectrum-InLineAlert spectrum-InLineAlert--positive">
        <div className="spectrum-InLineAlert-header">
          All Options Covered
          <svg className="spectrum-Icon spectrum-Icon--sizeM spectrum-InLineAlert-icon" focusable="false" aria-hidden="true">
            <use xlinkHref="#spectrum-icon-18-CheckmarkCircle" />
          </svg>
        </div>
        <div className="spectrum-InLineAlert-content">All possible question/options selections are accounted for in results.</div>
      </div>

      <div className="spectrum-InLineAlert spectrum-InLineAlert--negative">
        <div className="spectrum-InLineAlert-header">
          Missing Connections
          <svg className="spectrum-Icon spectrum-Icon--sizeM spectrum-InLineAlert-icon" focusable="false" aria-hidden="true">
            <use xlinkHref="#spectrum-icon-18-CheckmarkCircle" />
          </svg>
        </div>
        <div className="spectrum-InLineAlert-content">Missing 34 questions/options scenarios. Click here to generate list.</div>
      </div> */}



    </div>
  );
}
export default Debugger;
