(function(){

function init(){
  var date = new Date()
    , dialog      = createCalendarDialog()
    , calendar    = createCalendar(date, dialog)
    , monthSlider = createMonthSlider(date, calendar)
    , yearSlider  = createYearSlider(date, calendar)
    ;

  calendar.addTo('calendar');
  yearSlider.addTo('year-slider');
  monthSlider.addTo('month-slider');
}

/*
* createCalendarDialog return configured Dialog object
* to use with Calendar object
*
* Return: Dialog object 
*/
function createCalendarDialog(){
    var dialog = new Dialog('calendar-dialog',
    //onSave
    function(text, cell){
        cell._calendar.addEvent(text, cell);
    },

    //onRemove
    function(cell){
        if(confirm('Remove event?')){
            cell._calendar.removeEvent(cell);
        }
    });

    return dialog;
}

/*
* createCalendar returns configured Calendar object and 
* assosiate dialog with it 
*
* Arguments:
*  date - Date object. Calendar will be seted to this date.
*  dialog - Dialog object. Will be shown on cell click
* 
* Return: Calendar object 
*/
function createCalendar(date, dialog){
  var calendar = new Calendar(date);

  calendar.onCellClick(function(cell, calendar){
    var text = calendar.getEvent(cell)
      , dateString = calendar.formatDate(cell)
      ;

    dialog.show(text, 'Event for '+dateString, cell);
  });

  return calendar;
}

/*
* createMonthSlider returns Slider object populated with months 
*
* Arguments:
*  date - Date object. Slider will be seted to this date's month.
*  calendar - Calendar object. Calendar's month will be adjusted on slider's item click.
* 
* Return: Slider object
*/
function createMonthSlider(date, calendar){
  return new Slider({
    dataProvider: new MonthProvider(date),
    onChange: function(index){
      calendar.setMonth(index);
    }
  });

  /*
  * MonthProvider object - Infinity months data provider 
  *
  * Arguments:
  *  date - Date object. Provider will be seted to this date's month.
  * 
  */
  function MonthProvider(date){

    var currentMonth = date.getMonth()
      , monthLabels = 
    [ 'January', 'February', 'March',
      'April',   'May',      'June',
      'July',    'August',   'September',
      'October', 'November', 'December']
      ;

    createDataProvider(this,
      //getLabel
      function(index){
        return monthLabels[this.getIndex(index)];
      },

      //getIndex
      function(index){
        var ret = (currentMonth + index) % 12;
        return ret >=0 ? ret : 12 + ret;
      }      
    );
  }
}

/*
* createYearSlider returns slider object populated with years 
*
* Arguments:
*  date - Date object. Slider will be seted to this date's year.
*  calendar - Calendar object. Calendar's year will be adjusted on slider's item click.
* 
* Return: Slider object 
*/
function createYearSlider(date, calendar){
  return new Slider({
    dataProvider: new YearProvider(date),
    onChange: function(index){
      calendar.setYear(index);
    }
  });

  /*
  * YearProvider Object - Infinity years data provider
  *
  * Arguments:
  *  date - Date object. Provider will be seted to this date's year.
  * 
  */
  function YearProvider(date){

    var currentYear = date.getFullYear();

    createDataProvider(this,
      //getLabel
      function(index){
        return this.getIndex(index);
      },

      //getIndex
      function(index){
        return currentYear + index;
      }      
    );
  }
}

/*
* createDataProvider extends object with data provider
* interface functions
*
* Arguments:
*  object - Object to be extended
*  getLabel - Function returns string reprentation of 
*     sliders item content
*
*     Arguments:
*       index - Integer. Sliders internal item index.
* 
*     Return: String 
*
*  getIndex - Function map internal slider's index to data's index
*     and return data's index.
*
*     Arguments:
*       index - Integer. Sliders internal item index.
* 
*     Return: Integer 
*/
function createDataProvider(object, getLabel, getIndex){
  object.getLabel = getLabel;
  object.getIndex = getIndex; 
}

/**
* Dialog Object
*
* Arguments:
*   dialogId - String. Id of html node dialog will be base on
*   onSave -   Function will be called on saved button pressed
*      Arguments:
*        text - Text string from dialog's input element
*        targetNode - DOM node from Dialog.show( ..., targetNode) method     
*
*   onRemove - 
*      Arguments:
*        targetNode - DOM node from Dialog.show( ..., targetNode) method
*/ 
function Dialog(dialogId, onSave, onRemove){
    var dialog = this;

    dialog.$dialogNode = $(document.getElementById(dialogId));
    dialog.$backNode = $(document.getElementById('dialog-back'));

    dialog.$dialogContentNode = dialog.$dialogNode.find('.dialog-content');
    dialog.$textInput = dialog.$dialogContentNode.find('.dialog-input');
    dialog.$label = dialog.$dialogContentNode.find('.dialog-label');
    dialog.$removeButton = dialog.$dialogContentNode.find('.remove-button');

    // Last node with wich dialog shown as target
    // Seted in Dialog.show( ..., targetNode) method
    dialog.currentTargetNode = null;

    fetchSize();
    initButtons();
    initHotKeys();
    initGuestures();

    function fetchSize(){
        //Force browser to assign dimensions to node
        dialog.$dialogNode.css({
            'visibylity':'hidden',
            'display':'block'
        });

        dialog.dialogWidth = dialog.$dialogNode.width();
        dialog.dialogHeight = dialog.$dialogNode.height();

        //Make node unassesible for user and set other
        //default values
        dialog.$dialogNode.css({
            'position':'absolute',
            'visibylity':'visible',
            'display':'none',
            'opacity':0
        });
    }

    function initButtons(){
        dialog.$dialogContentNode.find('.save-button').click(function(){
            save();
        });

        dialog.$removeButton.click(function(){
            onRemove(dialog.currentTargetNode);
            dialog.close();
        });

        dialog.$dialogContentNode.find('.cancel-button').click(function(){
            dialog.close();
        });
    }

    function initHotKeys(){
        dialog.$textInput.keydown(function(event){
            if(event.keyCode == 13) save();
        });

        $(document).keydown(function(event){
            if(event.keyCode == 27 && dialog.$dialogNode.is(':visible')){
                dialog.close();
            }
        });
    }

    function initGuestures(){
        dialog.$backNode.click(function(){
            dialog.close();
        });
    }

    function save(){
        var text = dialog.$textInput.val();
        onSave(text, dialog.currentTargetNode);
        dialog.close();
    }
}

/**
* Dialog.show method make dialog visible on page
* and set dialog's text input content and label  
*
* Arguments:
*   text - Text input string
*   label - Label text string
*   targetNode - DOM node. Will be submited to onSave and onClose callbacks
*
*/
Dialog.prototype.show = function(text, label, targetNode){
    var dialog = this
      , $target = $(targetNode)
      , nodeOffset = $target.offset()
      ;

    dialog.currentTargetNode = targetNode;
    dialog.$textInput.val(text);
    dialog.$label.text(label);

    if(text){
        dialog.$removeButton.removeAttr('disabled');
    }else{
        dialog.$removeButton.attr('disabled', 'disabled');
    }

    dialog.$dialogContentNode.hide();
    dialog.$dialogNode.hide();

    dialog.$backNode.addClass('active');

    dialog.$dialogNode.css({
      left:   nodeOffset.left,
      top:    nodeOffset.top,
      width:  $target.width(),
      height: $target.height(),
      display: 'block'
    });

    dialog.$dialogNode.animate({
        left: (window.innerWidth - dialog.dialogWidth) / 2 ,
        top:  (window.innerHeight - dialog.dialogHeight) / 2,
        width:  dialog.dialogWidth,
        height: dialog.dialogHeight,
        opacity: 1
    }, function(){
      dialog.$dialogContentNode.fadeIn(100);
      dialog.$textInput.focus();
    });
}

/**
* Dialog.close method hides dialog 
*
*/
Dialog.prototype.close = function(){
    var dialog = this
      , $target = $(this.currentTargetNode)
      , targetOffset = $target.offset()
      ;

    dialog.$backNode.removeClass('active');

    dialog.$dialogContentNode.fadeOut(100,

    function(){
        dialog.$dialogNode.animate({
            left: targetOffset.left,
            top:  targetOffset.top,
            width:  $target.width(),
            height: $target.height(),
            opacity: 0
        },

        function(){
            dialog.$dialogNode.hide();
        });
    });
}

/**
* Calendar Object
*
* Arguments:
*  date - Date object.
*
*/ 
function Calendar(date){
  this.startDate = new Date(date);

  this.daysLabel  = 
    ['Sunday',    'Monday',   'Tuesday', 
     'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Array of cell calender DOM nodes 
  this.tdCells = [];

  /**
   * Object with events in form:
   * { Year: {
   *     Month: {
   *        Day: 'text of event'  
   * } } }
   */
  this.events = {};

  this.month = date.getMonth();
  this.year  = date.getYear();
}

/**
* Calendar.addToo method adds html calendar as child of
* element width id = nodeId.
*
* Arguments:
*  nodeId - Id of html element.
*
*/ 
Calendar.prototype.addTo = function(nodeId){
  var calendar = this
    , node = document.getElementById(nodeId)
    ;

  if( ! node) return;

  initDOM(node);
  calendar.fill();

  function initDOM(node){
    var table = document.createElement('table')
      , thead = document.createElement('thead')
      , tbody = document.createElement('tbody')
      , tr
      , td
      ;

    tr = document.createElement('tr');
    for( var tdI = 0; tdI < 7; tdI++ ){
      td = document.createElement('th');
      td.innerHTML = calendar.daysLabel[tdI];
      tr.appendChild(td);
    }

    thead.appendChild(tr);
    table.appendChild(thead);

    for( var trI = 0; trI < 6; trI++ ){
      tr = document.createElement('tr');

      for( var tdI = 0; tdI < 7; tdI++ ){
        td = document.createElement('td');
        calendar.tdCells.push(td);
        tr.appendChild(td);

        td._calendar = calendar;
        td.onclick = calendar.onClickCallback;
      }

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    node.appendChild(table);
  }
}

/**
* Calendar.addToo method adds html calendar as child of
* element width id = nodeId.
*
* Arguments:
*  nodeId - Id of html element.
*
*/ 
Calendar.prototype.onCellClick = function(callback){
  this.cellClickCallback = callback;
}

Calendar.prototype.onClickCallback = function(){
  var callback = this._calendar.cellClickCallback;

  if( callback && this._day){
    callback(this, this._calendar);
  }
}

/**
* Calendar.setMonth method set calendar view to provided month
*
* Arguments:
*  monthIndex - Integer starting from Zero e.g. 0 is January
*
*/ 
Calendar.prototype.setMonth = function(monthIndex){
  this.month = monthIndex;
  this.fill();
}

/**
* Calendar.setYear method set calendar view to provided year
*
* Arguments:
*  year - Integer
*
*/ 
Calendar.prototype.setYear = function(year){
  this.year = year;
  this.fill();
}


/**
* Calendar.fill method fill calendar cells width dates and events
* for currently seted calendars year and month
*
*/ 
Calendar.prototype.fill = function(){
  this.monthEvents = this.getMonthEvents();

  var date = new Date(this.year, this.month, 1)
    , cells = this.tdCells
    , monthEvents = this.monthEvents
    , dayOffset = date.getDay()
    , daysInMonth
    , day = 1
    , i   = 0
    , cell
    ;

  for(; i < dayOffset; i++ ){
    this.setCell( cells[i], '' );
  }

  date.setDate(0);
  daysInMonth = date.getDate() + dayOffset;

  for(; i < daysInMonth; i++ ){
    this.setCell( cells[i], day, monthEvents[day]);
    day++;
  }

  for(dayOffset = cells.length; i < dayOffset; i++ ){
    this.setCell( cells[i], '' );
  }
}

/**
* Calendar.getEvent method returns text of event
* for cellNode's day
*
* Arguments:
*  cellNode - DOM node of calendar cell
* 
* Return:
*  Text of event
*/ 
Calendar.prototype.getEvent = function(cellNode){
    var events = this.getMonthEvents();
    return events[cellNode._day] || ''
}

/**
* Calendar.addEvent method add or modify event
* for cellNode's day
*
* Arguments:
*  eventText - Text of event
*  cellNode - DOM node of calendar cell
* 
*/ 
Calendar.prototype.addEvent = function(evenText, cellNode){
    var events = this.getMonthEvents();
    events[cellNode._day] = evenText;

    this.setCell(cellNode, cellNode._day, evenText);
}

/**
* Calendar.setCell method populate single calendar cell
* with day label and event text 
*
* Arguments:
*  cellNode - DOM node of calendar cell
*  day  - Integer
*  eventText - String  
*
*/ 
Calendar.prototype.setCell = function(cellNode, day, eventText){
    var node = document.createElement('div');
    cellNode.innerHTML = '';

    node.appendChild(document.createTextNode(day));
    node.setAttribute('class', 'cell-day');
    cellNode.appendChild(node);
    cellNode._day = day;

    if( day ){
        cellNode.classList.add('enabled')
    }else{
        cellNode.classList.remove('enabled')
    }

    if( eventText ){
        node = document.createElement('div');
        node.appendChild(document.createTextNode(eventText));
        node.setAttribute('class', 'cell-event');
        cellNode.appendChild(node);
    }else{
        cellNode.classList.remove('event');
    }
}

/**
* Calendar.formatDate method returns formated date for
* for cellNode e.g. 10/10/2014
*
* Arguments:
*  cellNode - DOM node of calendar cell
* 
* Returns:
*  Formated date string 
*/ 
Calendar.prototype.formatDate = function(cellNode){
    var month = this.month + 1
      , day = cellNode._day
      ;

    month = month < 10 ? '0' + month : month
    day = day < 10 ? '0'+ day : day

    return month+'/'+day+'/'+this.year;
}

/**
* Calendar.removeEvent method removes event assosiated with cellNode 
*
* Arguments:
*  cellNode - DOM node of calendar cell
* 
*/ 
Calendar.prototype.removeEvent = function(cellNode){
    var events = this.getMonthEvents();
    delete events[cellNode._day];

    this.setCell(cellNode, cellNode._day);
}

/**
* Calendar.getMonthEvents method returnes Object with events by day for
* given year and month. Returned Object will consist of days as keys and
* text of events as values
*
* Arguments:
*  year  - Integer
*  month - Integer started from zero e.g. 0 is January 
* 
* Returns:
    Object with days as keys and text of events as values
*/ 
Calendar.prototype.getMonthEvents = function(year, month){
  year  = year  || this.year;
  month = month || this.month;

  var yearEvents
    , monthEvents
    ;

  if( this.events[year]){
    yearEvents = this.events[year];
  }else{
    yearEvents = this.events[year] = {}
  }

  if( yearEvents[month]){
    monthEvents = yearEvents[month];
  }else{
    monthEvents = yearEvents[month] = {}
  }

  return  monthEvents;
}

/**
* Slider Object
* 
* Arguments:
*   args.dataProvider - Object with DataProvider interface
*   args.onChange - Function will be called on Sliders active element change
*      Arguments:
*        index - Integer. Maped to DataProvider index space  
*
*/
function Slider(args){
  this.elementsCount = 0;
  this.currentOffset = 0;

  this.dataProvider = args.dataProvider;
  this.onChange = args.onChange;
}

/**
* Slider.addToo method adds html slider as child of
* element width id = nodeId.
*
* Arguments:
*  nodeId - Id of html element.
*
*/ 
Slider.prototype.addTo = function(nodeId){
  var slider = this
    , node = document.getElementById(nodeId)
    ;

  if( ! node) return;

  slider.content = initDOM(node);
  fill(slider.content);

  function initDOM(node){
    var fragment = document.createDocumentFragment()
      , leftButton  = document.createElement('div')
      , rightButton = document.createElement('div')
      , content     = document.createElement('div')
      ;

    leftButton.setAttribute('class', 'slider-left-button');
    leftButton.onclick = function(){
      slider.shiftLeft();
    };

    rightButton.setAttribute('class', 'slider-right-button');
    rightButton.onclick = function(){
      slider.shiftRight();
    };

    content.setAttribute('class', 'slider-content');

    fragment.appendChild(leftButton);
    fragment.appendChild(content);
    fragment.appendChild(rightButton);
    node.appendChild(fragment);

    return content;
  }

  function fill(content){
    var active = slider.createElement(0)
      , contentWidth = content.clientWidth
      , last
      , i = 1
      ;

    content.appendChild(active);

    do{
        last = content.appendChild(slider.createElement(i));
        i++;
    }while(last.offsetLeft + last.clientWidth < contentWidth );

    slider.setActive(active);
  }
}

/**
* Slider.setActive method move element to the center of the screen and
* call onChange callback
*
* Arguments:
*  elementNode - DOM element of slider's item.
*
*/ 
Slider.prototype.setActive = function(elementNode){
  var slider = this
    , contentWidth = slider.content.clientWidth
    , currentOffset = slider.currentOffset
    , first = slider.content.firstChild
    , centerOffset = (contentWidth - elementNode.clientWidth) / 2
    , currentOffsetAnim = null
    ;

    if(slider.active == elementNode) return;

    if(slider.onChange){
        slider.onChange(slider.dataProvider.getIndex(elementNode._sliderIndex));
    }

    if(slider.active){
      slider.active.classList.remove('active');
    }

    elementNode.classList.add('active');
    slider.active = elementNode;

    /**
    * Move marginLeft of first element so that active
    * element will be at center on screen.
    *
    * Instead of create new element will reuse out of
    * screen element from other corner if possible for pach holes
    */

    if(elementNode.offsetLeft < centerOffset){
      nextFromLeft()
    }else{
      nextFromRight()
    }

    function nextFromLeft(){
      // Offset first element nead to be moved to for active element
      // take place at center of the screen
      var targetOffset = centerOffset - elementNode.offsetLeft + currentOffset;

      // If appling targetOffset to first element's marginLeft
      // produce empty space from the left.
      if( targetOffset >= 0){

        //Make left side of first element visible on screen.
        animateMarginOffset(first, currentOffset, 0, 100,
          function(){

            //Add new element and set it as first.
            first = addElementToStart(first);
            
            // Repeat until applying targetOffset will not produse
            // empty space anymore  
            nextFromLeft();
          },

          function(time, duration, fromOffset, toOffset){
            return fromOffset + time/duration*(toOffset - fromOffset)
          });
      }else{
        first.style.marginLeft = targetOffset + 'px';
        slider.currentOffset = targetOffset;
      }
    }

    /**
    * Add element and set it as first.
    * 
    * Try to reuse element from right or create new.
    *
    *      | visible screen area
    *      ---------------------
    *  New | Old Old Old   ...  | Old
    *   ^  ---------------------   |
    *   |__________________________|
    */
    function addElementToStart(first){
      var newElement = slider.content.lastChild;

      if(newElement.offsetLeft < contentWidth){

        // No elements from right can be reused
        // create new one instead
        newElement = null;
      }

      newElement = slider.createElement(first._sliderIndex - 1,  newElement);

      first.style.marginLeft = 0;
      slider.content.insertBefore(newElement, first);

      /**
      * New element will be fully outside of screen e.g.
      *
      *      | visible screen area
      *      ---------------------
      *  New | Old Old ...
      *      ---------------------
      */
      currentOffset = -newElement.clientWidth
      newElement.style.marginLeft = currentOffset+'px';

      return newElement;
    }

    function nextFromRight(){
      // Offset first element nead to be moved to for active element
      // take place at center of the screen

      var targetOffset = centerOffset - elementNode.offsetLeft + currentOffset
        , last = slider.content.lastChild
        , testOffset = last.offsetLeft + last.clientWidth + targetOffset
        ;

      // If appling targetOffset to first element's marginLeft
      // produce empty space from the right.
      if( testOffset < contentWidth ){
        animateMarginOffset(first, currentOffset, -first.clientWidth, 100,
          function(){

            //Move first element to end and set second element as as first.
            first = addElementToEnd(first);

            // Repeat until applying targetOffset will not produse
            // empty space anymore  
            nextFromRight();
          },

          function(time, duration, fromOffset, toOffset){
            return  fromOffset + ( 1 - time/duration)*(toOffset - fromOffset);
          });
      }else{
        first.style.marginLeft = targetOffset + 'px';
        slider.currentOffset = targetOffset;
      }
    }

    /**
    * Reuse element from right.
    * Move first element to end and set second sa new first.
    * 
    *
    *        | visible screen area
    *        -------------------------
    *  First | NewFirst  ...  WasFirst
    *   |    -------------------  ^ --
    *   |_________________________|
    */
    function addElementToEnd(first){
      var newElement = slider.content.firstChild
        , last = slider.content.lastChild
        ;

      currentOffset = 0;
      first.style.marginLeft = 0;

      newElement = slider.createElement(last._sliderIndex + 1,  newElement);

      slider.content.appendChild(newElement);

      return slider.content.firstChild;
    }

    // jQury.animate has bug that prevents negative margins to be animated
    // so do it by miself
    function animateMarginOffset(elementNode, fromOffset, toOffset, duration, callback, step){
      var end   =  Date.now() + duration
        , current_time
        , val
        ;

      //Drop animation if one is already active
      if( currentOffsetAnim ) return;

      nextFrame();

      function nextFrame(){
        currentOffsetAnim = setTimeout(function(){
            current_time = Date.now();

            if(current_time >= end){
                elementNode.style.marginLeft = toOffset + 'px';
                currentOffsetAnim = null;
                callback();
            }else{
                elementNode.style.marginLeft = 
                    step(end - current_time, duration, fromOffset, toOffset) + 'px';
                nextFrame();
            }
        }, 40);
      }
    }
}

/* Slider.createElement method creates DOM node, set its
 * content and event handlers.
 * Returned node must be manualy inserted in document.
 *
 * Arguments:
 *  index - Integer. May be negative. After start center element
 *    will have zero index:
 *    .. [-3] [-2] [-1] [ 0] [ 1] [ 2] [ 3] ... 
 *  
 *  node (optional) - DOM node. Will be used instead of creating new one.
 *
 * Return: Html node
 */
Slider.prototype.createElement = function(index, node){
  var slider = this
    , element
    ;

  if(node){
    element = node;
    element.innerHTML  = '';
  }else{
    element = document.createElement('div');
    element.onclick = function(){
      slider.setActive(this);
    }
  }

  element.appendChild( document.createTextNode( slider.dataProvider.getLabel(index)));
  element._sliderIndex = index;

  return element;
}

init();
})();
