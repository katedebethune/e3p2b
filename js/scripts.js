/*
 * Project 2B
 * Kate de Bethune - March 30, 2015
 *
 * Composers - allows the end user to enter composer names, dates, and country.
 * Saves data to local storage;
 * Notifies end user that an entry has been saved on submit;
 * Returns a list of composers currently saved in local storage.
 *
 * My project borrows heavily from Rob Frenette's example, many thanks and much credit
 * to him for making this clear to me.
 * 
 * To add an extra challenge for myself, I wanted to have the end user set a flag
 * which would determine how the results would be displayed in the displayComposer()
 * function. This involved creating another variable, a flag,
 * which is stored to localStorage, retrieved, and applied to the output html in 
 * a similar fashion to the composers array.
 *
 * The results are displayed in one of three ways
 * 1) table code using innerHTML (Rob's original) - Text will appear green
 * 2) table code using text nodes and appendChild (my addition) - text will appear purple
 * 3) aggregated innerHTML with no tables, just line breaks (my addition also) 
 *    - text will appear yellow
 *
 */

"use strict";

/***********************************************/
/* BEGINNING OF INIT - WINDOWS.ONLOAD FUNCTION */
/***********************************************/

//var alternate = 0;
/*
 * This function is called when the window loads.
 * It performs init such as binding element event handlers to functions for processing.
 */
window.onload = function() {
    // array to hold composers
    var composers = [ ];
    
    /*
     * This is the main processing function.
     */
    var processData = function() {
        var firstName = document.getElementById('firstName');
        var lastName = document.getElementById('lastName');
        var birthYear = document.getElementById('birthYear');
        var deathYear = document.getElementById('deathYear');
        var country = document.getElementById('country');
        var i = document.getElementById("outputStyle").selectedIndex;
        var messageSpan = document.getElementById('messageSpan');
        // check to see if user populated all fields
        if (validComposerData(firstName, lastName, birthYear, deathYear, country)) {
            //addComposer(composers, firstName, lastName, birthYear, deathYear, country, messageSpan);
            addComposer(composers, firstName, lastName, birthYear, deathYear, country);
            var msg = 'Composer ' + firstName.value + ' ' + lastName.value  + ' added.';
            btnReset.click();
            messageSpan.innerHTML = msg;
        } else {
            alert('Please enter data in all fields.');    
        }
        
        // Pass the flag into persistFlagBeforeUnloading() method.
        // Saves current selection to localStorage
        // Result of current selection will be shown in the next page load.
        if ( i == 'undefined' ) {
        	i = 0;
        }
        persistFlagBeforeUnloading(i);
        // don't submit form
        return false;
    }

    /*
     * This function positions the cursor in the firstName field
     * when the clear buttonis clicked.
     */
    var resetForm = function() {
        messageSpan.innerHTML = '&nbsp;';
        firstName.focus();
    }
    
    // get html elements and bind functions to event handlers
    var composerInfoForm = document.getElementById('composerInfoForm');
    composerInfoForm.onsubmit = processData;

    var btnReset = document.getElementById('btnReset');
    btnReset.onclick = resetForm;

    // bind the onbeforeunload event to a function
    // *** persistDataBeforeUnloading function is in persist.js 
    window.onbeforeunload = function() {      
        persistDataBeforeUnloading(composers);
    }
    
    // return the most recently saved format flag to pass
    // along to the loadData() function
    var flagData = window.localStorage.getItem('myFlag');
    if (flagData == 'undefined') {
    	flagData = 0;
    }
    else {
    	flagData = JSON.parse(flagData);
    	flagData = parseInt(flagData);
    }
    // call loadData() function to populate composers Array with existing composers
    // from local storage, using the formatting code corresponding to the flag from 
    // the form select box (either a table or stacked innerHTML blocks).
    loadData(composers, flagData);
}

/*
 * This function checks to ensure data has been entered in all fields.
 * If any data is missing, the cursor is placed in the appropraite html
 * element for the user to enter data.
 *
 * @param firstName - the firstName input element
 * @param lastName - the lastName input element
 * @param birthYear - the birthYear input element
 * @param deathYear - the deathYear input element
 * @param country - the country input element
 *
 * @return boolean - true is all data has been entered
 */
function validComposerData(firstName, lastName, phone, email)  {
    var haveAllData = false;
    
    if (firstName.value == "") {
        firstName.focus();
    } else if (lastName.value == "") {
        lastName.focus();
    } else if (birthYear.value == "") {
        birthYear.focus();
    } else if (deathYear.value == "") {
        deathYear.focus();
    } else if (country.value == "") {
    	country.focus();
    } else {
        haveAllData = true;
    }
    
    return haveAllData;
}

/******************************************/
/* END OF INIT - WINDOWS.ONLOAD FUNCTION */
/******************************************/


/********************************/
/* BEGIN localStorage FUNCTIONS */
/********************************/

/* This function defines a composer object.
 * 
 * @param firstName - the composer's firstName
 * @param lastName - the composer's lastName
 * @param birthYear - the composers's year of birth
 * @param deathYear - the composers's year of death
 * @param country - the composer's country of origin
 */
function composer(firstName, lastName, birthYear, deathYear, country) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthYear = birthYear;
    this.deathYear = deathYear;
    this.country = country;
    this.getComposer = function() {
        return this.firstName + ' ' + this.lastName + ' ' + this.birthYear + ' ' + this.deathYear + ' ' + this.country;
    }
}

/* This functions adds a composer to the composers array.
 *
 * @param composers - array containing composers
 * @param firstName - the firstName input element
 * @param lastName - the lastName input element
 * @param birthYear - the birthYear input element
 * @param deathYear - the deathYear input element
 * @param country - the country input element
 */
function addComposer(composers, firstName, lastName, birthYear, deathYear, country) {
    // create new composer object then store it in array
    var c = new composer(firstName.value, lastName.value, birthYear.value, deathYear.value, country.value);
	composers.push(c);
    //Alternately, could be written as 
    //composers.push(new composer(firstName.value, lastName.value, birthYear.value, deathYear.value, country.value));
}

/* This functions loops through Composers Array and calls function
 * to display each composer on the page.
 *
 * @param composers - array containing composers
 */
function displayComposers(composers, flagData) {
    var len = composers.length;

    // loop through each composer object in the array
    for (var i = 0; i < len; i++) {
        // get the composer
        displayComposer(composers[i], flagData);
    }
}

/* This functions displays a single composer on the page.
 *
 * @param composer - a single composer from the composers array
 */
function displayComposer(composer, flagData) {
    // get the table
    var table = document.getElementById('composersTable');
    // insert row below <thead>
    var row = table.insertRow(table.rows.length - 1);
    

    // insert new cells into new row
    var cell1 = row.insertCell(0); // Composer Name
    var cell2 = row.insertCell(1); // Dates
    var cell3 = row.insertCell(2); // Country
    
    if ( flagData == 0 ) {
    	//USING INNER HTML TO WRITE CONTENT TO CELLS
    	document.getElementById('composersFromLocalStorage').style.visibility = "hidden";
    	document.getElementById("composersTable").className = "textGreen";
		cell1.innerHTML = composer.firstName + " " + composer.lastName;
		cell2.innerHTML = composer.birthYear + " - " + composer.deathYear;
		cell3.innerHTML = composer.country;
	}
	else if ( flagData == 1 ) {
		//USING TEXT NODES TO APPLY CONTENT TO CELLS INSTEAD OF innerHTML.
    	document.getElementById('composersFromLocalStorage').style.visibility = "hidden";
    	document.getElementById("composersTable").className = "textPurple";
		// create text nodes for cell contents
		var nameNode = document.createTextNode(composer.firstName + " " + composer.lastName);
		var datesNode = document.createTextNode(composer.birthYear + " - " + composer.deathYear);
		var countryNode = document.createTextNode(composer.country);
	
		//append text nodes to cells
		cell1.appendChild(nameNode);
		cell2.appendChild(datesNode);
		cell3.appendChild(countryNode);
		
	}
	else {
		//USING innerHTML for everything; hiding the composersTable element
		document.getElementById('composersTableContainer').style.visibility = "hidden";
		document.getElementById('composersTable').style.visibility = "hidden";
		document.getElementById("composersFromLocalStorage").className = "textYellow";
		var composerSpan = document.getElementById('composerSpan');
		var composerHTML = 'Composer: ' + composer.firstName + ' ' + composer.lastName  + '<br /> Dates: ' + composer.birthYear + " - " + composer.deathYear + "<br /> Country: " + composer.country + "<br /><br />";
		composerSpan.innerHTML += composerHTML;
	}
}

/********************************/
/* END localStorage FUNCTIONS   */
/********************************/


/********************************/
/* BEGIN persistence FUNCTIONS  */
/********************************/
/* This function writes data to localstorage
 *
 * @param composers - Array containing Composer Objects
 */
function persistDataBeforeUnloading(composers) {
    if (composers.length > 0) {
        // clear existing items in local storage
        window.localStorage.removeItem('myComposers');
        window.localStorage.setItem('myComposers', JSON.stringify(composers));
    }
}

/* This function writes display style to localstorage
 *
 * @param outputGenerator - flag (0,1,2) to be used in displayComposer()
 */
 
 function persistFlagBeforeUnloading(flag) {
        //set the flag in local storage before window is refreshed.
        //will modify display settings upon refresh.
        window.localStorage.setItem('myFlag', flag);
}

/*
 * This function retrieves data from localstorage
 *
 * @param composers - Array to load Composers into
 */
function loadData(composers, flag) {
    // check for composers in local storage
    var composerData = window.localStorage.getItem('myComposers');
    if (composerData != undefined) {
        composerData = JSON.parse(composerData);
        // load composers from local storage into Array (as objects)
        composerData.forEach(function(c) {
            composers.push(new composer(c.firstName, c.lastName, c.birthYear, c.deathYear, c.country));
        });
    }
    // call function to display contacts on page
    displayComposers(composers, flag);
}

/********************************/
/* END persistence FUNCTIONS    */
/********************************/


