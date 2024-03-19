import { useEffect, useState } from "react";
import { fetchResultsJson, performValidationResults } from "../../utils/utils";
import zStore from "../../store/Store";

const ValidateResults = ({ site }) => {
  const [validations, setValidations] = useState(zStore((state) => state.validationQuizResults));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processAndFetchData = async () => {
      try {
        // reset the state
        setLoading(true);

        const questionsData = await fetchResultsJson(site + "questions.json");
        const stringsData = await fetchResultsJson(site + "strings.json");
        const resultsData = await fetchResultsJson(site + "results.json");

        if (questionsData && stringsData && resultsData) {
          setValidations(
            performValidationResults(questionsData, stringsData, resultsData)
          );
        }
      } catch (error) {
        console.error("Error processing URL data:", error);
      } finally {
        setLoading(false);
      }
    };

    processAndFetchData();
  }, [site]);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : validations?.length > 0 ? (
        <div>
          {validations.map((validation, index) => (
            <div
              key={index}
              className={`spectrum-InLineAlert spectrum-InLineAlert--${validation.severity}`}
            >
              <div className="spectrum-InLineAlert-header">
                {validation.heading}
              </div>
              <div className="spectrum-InLineAlert-content">
                {validation.body}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>No data found.</div>
      )}
    </div>
  );
};

export default ValidateResults;