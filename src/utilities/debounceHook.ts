
/* Listener for detecting delay in typing */

//Example Usage: Detecting pause before searching in SearchList
//useCallback(debounce(executeSearch, 500), [searchTerm])

const debounce = (callback:Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  };

  export default debounce;