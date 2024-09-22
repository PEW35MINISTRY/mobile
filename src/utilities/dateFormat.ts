

/*******************
 * DATE FORMATTING
 *******************/
const DAY_OF_WEEK_SHORT:string[] = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
const DAY_OF_WEEK_LONG:string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_SHORT:string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const MONTH_LONG:string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const getFutureDate = (date:Date = new Date(), days:number = 0):Date => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }
  
export const formatNumberOrdinal = (n:number):string => 
    (n % 10 == 1 && n % 100 != 11) ? n + 'st'
    : (n % 10 == 2 && n % 100 != 12) ? n + 'nd'
    : (n % 10 == 3 && n % 100 != 13) ? n + 'rd'
    : n + 'th';
  
  
  //Relative Date Rules
const formatRelativeDate = (startDate:Date|string, endDate?:Date|string, options?:{shortForm?:boolean, includeHours?:boolean, includeDay?:boolean, includeMonth?:boolean, markPassed?:boolean}):string => {
    options = {shortForm:false, includeHours:true, includeDay:true, includeMonth:true, markPassed:false, ...options}; //Apply defaults & inputted overrides
    const now = new Date();
    let text = '';

    //Handle Date type validations
    if(startDate === undefined || !((startDate instanceof Date) || (typeof startDate === 'string' && (startDate as string).length > 0))
      || (endDate !== undefined && !((endDate instanceof Date) || (typeof endDate === 'string' && (endDate as string).length > 0))))
          return '';
  
    if(typeof startDate === 'string') startDate = new Date(startDate);
    if(endDate !== undefined && typeof endDate === 'string') endDate = new Date(endDate);  
    if(startDate === endDate) endDate = undefined;


    let currentlyOnGoing = false;
    if(options.includeDay === false)
      text = '';

    //Date range spans the current time
    else if(now > startDate && endDate !== undefined && now < endDate) {
      currentlyOnGoing = true;
      text += 'Now';
    }
  
    //Day of the week 
    else if(startDate > getFutureDate(now, -1) && startDate < getFutureDate(now, 1)) text += options.shortForm ? 'Tod' : 'Today';

    else if(startDate > getFutureDate(now, -2) && startDate < getFutureDate(now, -1)) text += options.shortForm ? 'Ytd' : 'Yesterday';

    else if(startDate > getFutureDate(now, 1) && startDate < getFutureDate(now, 2)) text += options.shortForm ? 'Tom' : 'Tomorrow';

    else if(startDate > getFutureDate(now, -7) && startDate < getFutureDate(now, 7)) text += options.shortForm ? DAY_OF_WEEK_SHORT[startDate.getDay()] : DAY_OF_WEEK_LONG[startDate.getDay()];

    else if(startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()) text += formatNumberOrdinal(startDate.getDate());

    else if(options.includeMonth) text += (options.shortForm ? MONTH_SHORT[startDate.getMonth()] : MONTH_LONG[startDate.getMonth()]) + ' ' + formatNumberOrdinal(startDate.getDate());

    //Different Year
    if(startDate.getFullYear() !== now.getFullYear() && endDate === undefined) text += ', ' + startDate.getFullYear();
    
    //Hours
    if(options.includeHours && (startDate > now)) {
        if(text.trim().length > 0) text += ', '
        if(startDate.getHours() === 0) text += options.shortForm ? 'Mid' : 'Midnight';
        else if(startDate.getHours() === 12) text += 'Noon';
        else text += `${startDate.getHours() % 12}${(startDate.getHours() < 12) ? 'AM' : 'PM'}`;
    }

    //End Date Range
    if (endDate !== undefined) {
      const endDateIncludeMonth: boolean = options.includeMonth ? (startDate.getMonth() !== endDate.getMonth() || startDate.getFullYear() !== endDate.getFullYear()) : false;
      const endDateIncludeDay: boolean = options.includeDay ? (startDate.getDate() !== endDate.getDate() || endDateIncludeMonth) : false;

      const endDateFormatted: string = formatRelativeDate(endDate, undefined, { ...options, includeDay: endDateIncludeDay, includeMonth: endDateIncludeMonth });
      if (endDateFormatted.length > 0) text += ' - ' + endDateFormatted;
    }

    //Mark Passed
    if (options.markPassed && !currentlyOnGoing && startDate < now && endDate === undefined) text += `${text.length > 0 ? ' - ' : ''}Past`;

    return text.trim();
  }

  export default formatRelativeDate;



  export const calculateAge = (date:Date|string):number => {
    if(date === undefined || date === '') date = new Date();
    else if(typeof date === 'string') date = new Date(date);

    return new Date().getFullYear() - date.getFullYear();
  };
  