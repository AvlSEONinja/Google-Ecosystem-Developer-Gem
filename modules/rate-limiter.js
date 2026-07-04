/**
 * Executes a Google Apps Script UrlFetchApp call with integrated exponential backoff.
 * Prevents "Too Many Requests (429)" rate limit exceptions.
 * * @param {string} url The Target API endpoint.
 * @param {Object} options Standard UrlFetchApp configurations.
 * @param {number} maxRetries Maximum retry operations before throwing structural failure.
 * @return {HTTPResponse} The valid response payload from the fetch operation.
 */
function fetchWithBackoff(url, options = {}, maxRetries = 5) {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const response = UrlFetchApp.fetch(url, options);
      const code = response.getResponseCode();
      
      if (code >= 200 && code < 300) {
        return response;
      }
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        console.error(`Execution failed after ${attempts} attempts. Error: ${error.toString()}`);
        throw error;
      }
      
      // Calculate dynamic backoff delay: (2^attempts) * 1000 milliseconds + random jitter
      const delay = Math.pow(2, attempts) * 1000 + Math.floor(Math.random() * 500);
      console.warn(`Encountered rate limit or network hitch. Backing off for ${delay}ms... (Attempt ${attempts}/${maxRetries})`);
      Utilities.sleep(delay);
    }
  }
}
