import { useEffect, useState } from 'react';
import { fetchResultsJson, handleResults } from '../../utils/utils';

const UrlsChecker = ({ site }) => {
  const [urlData, setUrlData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [destinationUrlData, setDestinationUrlData] = useState([]);

  useEffect(() => {
    const processAndFetchData = async () => {
      try {
        // reset the state
        setLoading(true);

        // Fetch the results.json file
        const results = await fetchResultsJson(site + "results.json");

        if (results) {
          // Process the results and fetch the URL data for results-fragments
          const data = await handleResults(results, 'result-fragments', site);
          // Sort URLs by status and set the state
          setUrlData(data);

          // Process the results and fetch the URL data for results-destination
          const data2 = await handleResults(results, 'result-destination', site);
          setDestinationUrlData(data2);
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
      ) : urlData.length > 0 ? (
        <sp-accordion>
          <sp-accordion-item label="Results Fragments">
          <div className="spectrum-Table-scroller spectrum-Table spectrum-Table--sizeM spectrum-Table--emphasized spectrum-Table--quiet" style={{ width: '100%' }}>
              <div className="spectrum-Table-main" role="table" style={{ width: '100%' }}>
                <div className="spectrum-Table-head" role="rowgroup">
                  <div role="row">
                    <div className="spectrum-Table-headCell is-sortable is-sorted-desc" role="columnheader" aria-sort="descending" tabIndex="0">
                      <svg className="spectrum-Icon spectrum-UIIcon-ArrowDown100 spectrum-Table-sortedIcon" focusable="false" aria-hidden="true">
                        <use xlinkHref="#spectrum-css-icon-Arrow100" />
                      </svg><span className="spectrum-Table-columnTitle">URL</span>
                    </div>
                    <div className="spectrum-Table-headCell is-sortable" role="columnheader" aria-sort="none" tabIndex="0">
                      <svg className="spectrum-Icon spectrum-UIIcon-ArrowDown100 spectrum-Table-sortedIcon" focusable="false" aria-hidden="true">
                        <use xlinkHref="#spectrum-css-icon-Arrow100" />
                      </svg><span className="spectrum-Table-columnTitle">URL Status</span>
                    </div>
                    <div className="spectrum-Table-headCell is-sortable" role="columnheader" aria-sort="none" tabIndex="0">
                      <svg className="spectrum-Icon spectrum-UIIcon-ArrowDown100 spectrum-Table-sortedIcon" focusable="false" aria-hidden="true">
                        <use xlinkHref="#spectrum-css-icon-Arrow100" />
                      </svg><span className="spectrum-Table-columnTitle">Last Modified</span>
                    </div>
                    <div className="spectrum-Table-headCell is-sortable" role="columnheader" aria-sort="none" tabIndex="0">
                      <svg className="spectrum-Icon spectrum-UIIcon-ArrowDown100 spectrum-Table-sortedIcon" focusable="false" aria-hidden="true">
                        <use xlinkHref="#spectrum-css-icon-Arrow100" />
                      </svg><span className="spectrum-Table-columnTitle">Cache Status</span>
                    </div>
                  </div>
                </div>
                  {urlData.map((item, index) => (
                    <div className="spectrum-Table-body" role="rowgroup" key={index}>
                        <div className="spectrum-Table-row" role="row">
                          <div className="spectrum-Table-cell" role="cell">{item.url}</div>
                          <div className="spectrum-Table-cell" role="cell">{item.status}</div>
                          <div className="spectrum-Table-cell" role="cell">{item['last-modified']}</div>
                          <div className="spectrum-Table-cell" role="cell">{item['cache-status']}</div>
                        </div>
                        </div>
                  ))}
              </div>
            </div>
          </sp-accordion-item>
        </sp-accordion>
      ) : (
        <div>No data found.</div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : destinationUrlData.length > 0 ? (
        <sp-accordion>
          <sp-accordion-item label="Results Destination">
          <div className="spectrum-Table-scroller spectrum-Table spectrum-Table--sizeM spectrum-Table--emphasized spectrum-Table--quiet" style={{ width: '100%' }}>
              <div className="spectrum-Table-main" role="table" style={{ width: '100%' }}>
                <div className="spectrum-Table-head" role="rowgroup">
                  <div role="row">
                    <div className="spectrum-Table-headCell is-sortable is-sorted-desc" role="columnheader" aria-sort="descending" tabIndex="0">
                      <svg className="spectrum-Icon spectrum-UIIcon-ArrowDown100 spectrum-Table-sortedIcon" focusable="false" aria-hidden="true">
                        <use xlinkHref="#spectrum-css-icon-Arrow100" />
                      </svg><span className="spectrum-Table-columnTitle">URL</span>
                    </div>
                    <div className="spectrum-Table-headCell is-sortable" role="columnheader" aria-sort="none" tabIndex="0">
                      <svg className="spectrum-Icon spectrum-UIIcon-ArrowDown100 spectrum-Table-sortedIcon" focusable="false" aria-hidden="true">
                        <use xlinkHref="#spectrum-css-icon-Arrow100" />
                      </svg><span className="spectrum-Table-columnTitle">URL Status</span>
                    </div>
                    <div className="spectrum-Table-headCell is-sortable" role="columnheader" aria-sort="none" tabIndex="0">
                      <svg className="spectrum-Icon spectrum-UIIcon-ArrowDown100 spectrum-Table-sortedIcon" focusable="false" aria-hidden="true">
                        <use xlinkHref="#spectrum-css-icon-Arrow100" />
                      </svg><span className="spectrum-Table-columnTitle">Last Modified</span>
                    </div>
                    <div className="spectrum-Table-headCell is-sortable" role="columnheader" aria-sort="none" tabIndex="0">
                      <svg className="spectrum-Icon spectrum-UIIcon-ArrowDown100 spectrum-Table-sortedIcon" focusable="false" aria-hidden="true">
                        <use xlinkHref="#spectrum-css-icon-Arrow100" />
                      </svg><span className="spectrum-Table-columnTitle">Cache Status</span>
                    </div>
                  </div>
                </div>
                  {destinationUrlData.map((item, index) => (
                    <div className="spectrum-Table-body" role="rowgroup" key={index}>
                        <div className="spectrum-Table-row" role="row">
                          <div className="spectrum-Table-cell" role="cell">{item.url}</div>
                          <div className="spectrum-Table-cell" role="cell">{item.status}</div>
                          <div className="spectrum-Table-cell" role="cell">{item['last-modified']}</div>
                          <div className="spectrum-Table-cell" role="cell">{item['cache-status']}</div>
                        </div>
                        </div>
                  ))}
              </div>
            </div>
          </sp-accordion-item>
        </sp-accordion>
      ) : (
        <div>No data found.</div>
      )}
    </div>
  );
};

export default UrlsChecker;