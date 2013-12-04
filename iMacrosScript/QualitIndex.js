
/********************************************** PROGRAM START **********************************************/

/* Get data from prompt */

var data = JSON.parse(prompt('Paste the JSON data generated with bib2json script. \n\n More info at : http://energia.deusto.es/PublicationStats'));

if (data) {
  
  // Go throug all the lines
  
  for (count = 0; count < data.length; count++){
    
    // If title exists, fill all the cites fields
    
    if( data[count].title && data[count].title != '' ){
      
      // Get cites from GOOGLE SCHOLAR
      var google = getGoogleScholarCites( data[count].title, data[count].year );
      data[count].citesGoogle = google < 0? undefined : google;
      
      // Get cites from SCOPUS
      var scopus = getScopusCites( data[count].title, data[count].year );
      data[count].citesScopus = scopus < 0? undefined : scopus;
      
      // Get cites from WOK
      var wok = getWokCites( data[count].title, data[count].year );
      data[count].citesWok = wok < 0? undefined : wok;
      
    }
    
    if (data[count].journal && data[count].journal != '' ){
      
      // Get H5 from GOOGLE SCHOLAR
      var h5 = getGoogleH5( data[count].journal, data[count].year );
      data[count].h5 = h5 < 0? undefined : h5;
      
      // Get JCR from WOK
      getWokJCR( count, data[count].journal, data[count].year, function(c, jcr, jcrYear, jcrCategories){
	
	// If no jcr found, try up to 2 years less
	if( jcr < 0){
	  getWokJCR( c, data[c].journal, jcrYear-1, function(c, jcr, jcrYear, jcrCategories){
	    
	    if( jcr < 0){
	      
	      getWokJCR( c, data[c].journal, jcrYear-1, function(c, jcr, jcrYear, jcrCategories){
		
		if( jcr < 0){
		  
		  data[c].jcr = undefined;
		  
		}else {
		  data[c].jcr = jcr;
		  data[c].jcrYear = jcrYear;
		  data[c].jcrCategories = jcrCategories;
		}
		
	      });
	      
	    } else {
	      data[c].jcr = jcr;
	      data[c].jcrYear = jcrYear;
	      data[c].jcrCategories = jcrCategories;
	    }
	    
	  });
	} else {
	  data[c].jcr = jcr;
	  data[c].jcrYear = jcrYear;
	  data[c].jcrCategories = jcrCategories;
	}
      });
      
      // GET SCR from SCIMAGO
      getSjrFromScimago( count, data[count].journal, data[count].year, function(c, sjr, sjrYear, sjrCategories){

	if (sjr > 0){
	  data[c].sjr = sjr;
	  data[c].sjrYear = sjrYear;
	  data[c].sjrCategories = sjrCategories;
	}
      });

      // GET CORE RANKING
      var core = getCore(data[count].journal);
      data[count].core = (core == undefined? undefined : core);
      
    }
    
  }
  
  showResultsJsonEnergy(data);
  
} else {
  alert('No data found or data could not be parsed correctly');
}


/********************************************** PROGRAM END **********************************************/


/**
 * GET CITES FROM GOOGLE SCHOLAR
 */
function getGoogleScholarCites(title, year){
  
  // Go to url
  if (year && year > 0){
    iimPlay('CODE: URL GOTO=http://scholar.google.es/scholar?hl=es&q=allintitle:"' + title.replace(/ /g, '<SP>') + '"&as_ylo=' + year + '&as_yhi=' + year );
  }
  else {
    iimPlay('CODE: URL GOTO=http://scholar.google.es/scholar?hl=es&q=allintitle:"' + title.replace(/ /g, '<SP>') + '"');
  }
  
  // Position at "Citado por" div
  iimPlay('CODE: TAG POS=1 TYPE=DIV ATTR=CLASS:gs_fl EXTRACT=TXT');
  var citesText = iimGetLastExtract().trim();
  
  // Extract cites number
  var n = citesText.match(/Citado por [0-9]+/gi); 
  if( n == null) {
    var cites = "";
  } else {
    var cites = parseInt(n[0].trim().replace('Citado por ',''));
  }
  
  return cites;
}


/**
 * GET CITES FROM SCOPUS
 */
function getScopusCites(title, year){
  
  // Goto to url
  iimPlay('CODE: URL GOTO=http://www.scopus.com/search/form.url');
  
  //Prepare search fields and click search button
  if (year && year > 0) {
    iimPlay('CODE: TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:BasicValidatedSearchForm ATTR=ID:searchterm1 CONTENT=' + title.replace(/ /g, '<SP>') + '\n' +
    'TAG POS=1 TYPE=SELECT FORM=NAME:BasicValidatedSearchForm ATTR=ID:yearFrom CONTENT=%' + year + '\n' +
    'TAG POS=1 TYPE=SELECT FORM=NAME:BasicValidatedSearchForm ATTR=ID:yearTo CONTENT=%' + year + '\n' +
    'TAG POS=1 TYPE=INPUT:CHECKBOX FORM=NAME:BasicValidatedSearchForm ATTR=ID:subArea-2 CONTENT=NO\n' +
    'TAG POS=1 TYPE=INPUT:CHECKBOX FORM=NAME:BasicValidatedSearchForm ATTR=ID:subArea-4 CONTENT=NO\n' +
    'TAG POS=2 TYPE=INPUT:SUBMIT FORM=NAME:BasicValidatedSearchForm ATTR=VALUE:Search');
  } else {
    iimPlay('CODE: TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:BasicValidatedSearchForm ATTR=ID:searchterm1 CONTENT=' + title.replace(/ /g, '<SP>') + '\n' +
    'TAG POS=1 TYPE=INPUT:CHECKBOX FORM=NAME:BasicValidatedSearchForm ATTR=ID:subArea-2 CONTENT=NO\n' +
    'TAG POS=1 TYPE=INPUT:CHECKBOX FORM=NAME:BasicValidatedSearchForm ATTR=ID:subArea-4 CONTENT=NO\n' +
    'TAG POS=2 TYPE=INPUT:SUBMIT FORM=NAME:BasicValidatedSearchForm ATTR=VALUE:Search');
  }
  
  //Position at "Cited by" result col "dataCol6" and save value in EXTRACT
  iimPlay('CODE: TAG POS=1 TYPE=LI ATTR=CLASS:dataCol6 EXTRACT=TXT');
  var citesText = iimGetLastExtract().trim();
  
  // Extract cites number
  if (citesText == '#EANF#' || citesText == ''){
    return undefined;
  } else {
    return parseInt(citesText);
  }
}


/**
 * GET CITES FROM WOK
 */
function getWokCites(title, year){
  
  // Go to WOK web page
  iimPlay('CODE: URL GOTO=http://apps.webofknowledge.com');
  
  //Prepare search fields and click search button
  if (year && year > 0){
    iimPlay('CODE: TAG POS=1 TYPE=SELECT FORM=NAME:UA_GeneralSearch_input_form ATTR=ID:select1 CONTENT=%TI\n' +
    'TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:UA_GeneralSearch_input_form ATTR=ID:value(input1) CONTENT=' + title.replace(/ /g, '<SP>') + '\n' +
    'TAG POS=1 TYPE=INPUT:RADIO FORM=ID:UA_GeneralSearch_input_form ATTR=ID:periodRange\n' +
    'TAG POS=1 TYPE=SELECT FORM=NAME:UA_GeneralSearch_input_form ATTR=NAME:startYear CONTENT=%' + year + '\n' +
    'TAG POS=1 TYPE=SELECT FORM=NAME:UA_GeneralSearch_input_form ATTR=NAME:endYear CONTENT=%' + year + '\n' + 
    'TAG POS=1 TYPE=INPUT:IMAGE FORM=ID:UA_GeneralSearch_input_form ATTR=SRC:http://images.webofknowledge.com/WOKRS512B4.1/images/search.gif');
  } else {
    iimPlay('CODE: TAG POS=1 TYPE=SELECT FORM=NAME:UA_GeneralSearch_input_form ATTR=ID:select1 CONTENT=%TI\n' +
    'TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:UA_GeneralSearch_input_form ATTR=ID:value(input1) CONTENT=' + title.replace(/ /g, '<SP>') + '\n' +
    'TAG POS=1 TYPE=INPUT:IMAGE FORM=ID:UA_GeneralSearch_input_form ATTR=SRC:http://images.webofknowledge.com/WOKRS512B4.1/images/search.gif');
  }
  
  //Position at "Times Cited" span to know if it has been found and save value in EXTRACT
  iimPlay('CODE: TAG POS=1 TYPE=SPAN ATTR=TXT:Times<SP>Cited: EXTRACT=TXT');
  var citesTextExists = iimGetLastExtract().trim();
  
  if (citesTextExists == '#EANF#'){
    return -1
  } else {
    //Try to position at Cites counter <a> to get the number, if it has no cite it wont have an <a>
    iimPlay('CODE: TAG POS=1 TYPE=A ATTR=TITLE:View<SP>all<SP>of<SP>the<SP>articles<SP>that<SP>cite<SP>this<SP>one EXTRACT=TXT');
    var citesText = iimGetLastExtract().trim();
    if (citesText == '#EANF#' || citesText == '' || citesText == '0'){
      return 0
    } else {
      return parseInt(citesText)
    }
  }
}


/**
 * GET H5 INDEX FROM GOOGLE
 */
function getGoogleH5(journalName, year){
  
  // Go to url
  iimPlay('CODE: URL GOTO=http://scholar.google.com/citations?hl=en&view_op=search_venues&vq="' + journalName.replace(/ /g, '<SP>') + '"' );
  
  //Position at "Cited by" result col "dataCol6" and save value in EXTRACT
  iimPlay('CODE: TAG POS=1 TYPE=TD ATTR=CLASS:gs_num EXTRACT=TXT');
  var h5Text = iimGetLastExtract().trim();
  
  if (h5Text == '#EANF#' || h5Text == ''){
    return -1;
  } else {
    return parseInt(h5Text);
  }
}

/**
 * GET JCR INDEX FROM WOK
 */
function getWokJCR(count, journalName, year, callback){
  
  // Go to url
  iimPlay('CODE: URL GOTO=http://admin-router.webofknowledge.com/?DestApp=JCR' );
  
  //Prepare the year search fields and click to continue 
  if (year && year > 0){
    iimPlay('CODE: TAG POS=1 TYPE=INPUT:RADIO FORM=NAME:limits ATTR=NAME:edition&&VALUE:science\n' +
    'TAG POS=1 TYPE=SELECT FORM=NAME:limits ATTR=ID:science_year CONTENT=%' + year + '\n');
  } else {
    iimPlay('CODE: TAG POS=1 TYPE=INPUT:RADIO FORM=NAME:limits ATTR=NAME:edition&&VALUE:science\n' +
    'TAG POS=1 TYPE=SELECT FORM=NAME:limits ATTR=ID:science_year CONTENT=%' + new Date().getFullYear() + '\n');
  }
  
  //Click to search in that year
  iimPlay('CODE: TAG POS=1 TYPE=INPUT:RADIO FORM=NAME:limits ATTR=NAME:RQ&&VALUE:SEARCH\n' +
  'TAG POS=1 TYPE=IMG ATTR=SRC:http://admin-apps.webofknowledge.com/JCR/images/submit.gif');
  
  //Write the journal name to search for it
  iimPlay('CODE: TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:http://admin-apps.webofknowledge.com/JCR/JCR?RQ=LIST_SUMMARY_JOURNAL ATTR=NAME:query_data CONTENT=' + journalName.replace(/ /g, '<SP>'));
  
  //Click the search button
  iimPlay('CODE: TAG POS=1 TYPE=INPUT:IMAGE FORM=ACTION:http://admin-apps.webofknowledge.com/JCR/JCR?RQ=LIST_SUMMARY_JOURNAL ATTR=NAME:Search&&SRC:http://admin-apps.webofknowledge.com/JCR/images/search.gif\n');
  
  //Get the journals short name
  iimPlay('CODE: TAG POS=1 TYPE=TD ATTR=CLASS:SORTED EXTRACT=TXT');
  var journalShortName = iimGetLastExtract().trim();
  
  if (journalShortName == '#EANF#' || journalShortName == ''){
    callback(count, -1, year);
  } else {
    
    //Click the journals link
    iimPlay('CODE: TAG POS=1 TYPE=A ATTR=TXT:' + iimGetLastExtract().trim().replace(/ /g, '<SP>') );
    
    //Get the table values
    iimPlay('CODE: TAG POS=1 TYPE=IMG ATTR=SRC:http://admin-apps.webofknowledge.com/JCR/images/journal_rank.gif\n' +
    'TAG POS=6 TYPE=TABLE ATTR=* EXTRACT=TXT\n' +
    'TAG POS=1 TYPE=STRONG ATTR=*\n' +
    'TAG POS=2 TYPE=STRONG ATTR=*\n' +
    'TAG POS=3 TYPE=STRONG ATTR=* EXTRACT=TXT');
    
    // Get the previous to last extract (impact factor)
    var impactFactor = (parseFloat(iimGetLastExtract(2).trim()));
    
    // Get the last extract (whole table)
    var categoryTable = (iimGetLastExtract(1).trim());
    
    // Split the table fields
    var rows = categoryTable.split("\n");
    
    // Remove the header (which ocuppies 7 positions of rows)
    var withoutHeaderRows = [];
    
    for(r = 7; r < rows.length; r++){
      withoutHeaderRows.push( rows[r] );
    }
    
    // One journal might have more than one category in jcr
    if (withoutHeaderRows.length > 1){
      
      var jcrCategories = [];
      
      // Parse each row
      for(f = 0; f < withoutHeaderRows.length; f++){
	// Split each row in its separate values
	var fields = withoutHeaderRows[f].split("\",\"");
	
	var jcrCategory = {};
	jcrCategory.category = fields[0].replace('\"', '');
	jcrCategory.total = parseInt(fields[1]);
	jcrCategory.position = parseInt(fields[2]);
	jcrCategory.q = fields[3].replace('\"', '');
	
	jcrCategories.push( jcrCategory );
      }
      
    } else {
      
      // Theres only one row, so split its values and parse them
      var fields = withoutHeaderRows[0].split("\",\"");
      
      var jcrCategory = {};
      
      jcrCategory.category = fields[0].replace('\"', '');
      jcrCategory.total = parseInt(fields[1]);
      jcrCategory.position = parseInt(fields[2]);
      jcrCategory.q = fields[3].replace('\"', '');
      
      var jcrCategories = [];
      jcrCategories.push( jcrCategory );
      
    }
    
    callback(count, impactFactor, year, jcrCategories);
  }
}

/**
 * GET SJR INDEX FROM SCIMAGO
 */
function getSjrFromScimago(count, journalName, sjryear, callback){
  
  
  // Prepare search field in case year is nonexistent
  if (sjryear && sjryear < 0){
    sjryear = new Date().getFullYear();
  }
  
  // Go to url
  ﻿iimPlay('CODE: URL GOTO=http://www.scimagojr.com/journalsearch.php');
  
  // Prepare search fields and extract the categories where the journal belongs
  iimPlay('CODE: TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:journalsearch.php ATTR=ID:q CONTENT=' + journalName.replace(/ /g, '<SP>') + ' \n' + 
  'TAG POS=1 TYPE=INPUT:SUBMIT FORM=ID:parametros ATTR=VALUE:Search\n' + 
  'TAG POS=1 TYPE=STRONG ATTR=TXT:'+ journalName.replace(/ /g, '<SP>') + ' \n' + 
  'TAG POS=8 TYPE=P ATTR=TXT:* EXTRACT=TXT');
  
  // Get and split text of extracted categories to single them out
  var extract = iimGetLastExtract();
  var sjrCategories = [];
  var sjr = -1;
  if (extract != ""){
    var categories = extract.split(":")[1].split(" ,");
    
    // Within each category, search for the journal sjrIndex, q and, ranking
    for (num=0; num<categories.length; num++){
      category = categories[num].trim().split(" ");
      selector = category.join("<SP>");
      filename = category.join("_");
      iimPlay('CODE: URL GOTO=http://www.scimagojr.com/journalrank.php\n' + 
      'TAG POS=1 TYPE=SELECT FORM=NAME:parametros ATTR=ID:category CONTENT=$' + selector + '\n' + 
      'TAG POS=1 TYPE=SELECT FORM=NAME:parametros ATTR=ID:year CONTENT=%' + sjryear + '\n' + 
      'TAG POS=1 TYPE=BUTTON ATTR=TXT:Refresh');
      
      var sjrCategory = {};	
      sjrCategory = getRankingPerCategory(selector, journalName);
      if (sjr < 0){
	sjr = parseFloat(sjrCategory.sjr);
      }
      delete sjrCategory.sjr;
      sjrCategories.push( sjrCategory );
      
    }
  }
  callback(count, sjr, sjryear, sjrCategories );
}

/**
 * GET RANKING OF JOURNAL PER SCIMAGO-SJR CATEGORY
 */
function getRankingPerCategory(cat, journalName){
  
  var sjrcat = {}
  sjrcat.category = cat;
  var found = false;
  var end_of_pagination = false;
  
  // Searches the whole table for the name and position of the journal. Gets both the table and the existence of a tag that allows to go to the next 
  // page of said table
  while(!found &&  !end_of_pagination){
    iimPlay('CODE: TAG POS=1 TYPE=A ATTR=TXT:Next<SP>> EXTRACT=TXT\n' +
    'TAG POS=1 TYPE=TABLE ATTR=CLASS:tabla_datos EXTRACT=TXT');
    
    // The data is given in the form of "Next>[EXTRACT]1,journal...n,journal"
    extraction = iimGetLastExtract().split("[EXTRACT]");	
    // If there is no tag Next>, we've reached the end of the table's pagination
    if(extraction[0] == "#EANF#")	
      end_of_pagination = true;
    
    var table = extraction[1];
    var i = 1;
    var ranking = "-";
    
    // Removes the quote characters (") from the table's extracted text
    table = table.trim().replace(/"/gi, '').split("\n");
    
    // Searches each row of the table for an entry that matches the name of the journal
    while(!found && i<table.length){
      row = table[i].split(",");
      // Name of the journal is at position 1: row[1]
      if ((row.length > 1) && (row[1].trim().toLowerCase() == journalName.toLowerCase())){
	// Get sjr index. Due to the previous split command -split(",")-, the integer and decimal parts of the index are separated
	sjr = row[2] + "." + row[3];
	// Get ranking of the journal
	ranking = row[0];
	found = true;
      }
      else if (row.length > 1){
	i++;	
      }
    }
    
    // Go to the next page of the table if we've reached the end of the current page and have not found the journal's ranking
    if(!found && !end_of_pagination){
      iimPlay('CODE: TAG POS=1 TYPE=A ATTR=TXT:Next<SP>>');
    }
  }
  
  // Get total number of journals
  iimPlay('CODE: TAG POS=7 TYPE=P ATTR=* EXTRACT=TXT'); 
  var extract_pages = iimGetLastExtract().trim().split(" ");
  var total_journals;
  
  if (extract_pages.length <= 3)
    total_journals = extract_pages[2];
  else
    total_journals = extract_pages[4];
  var quartile = calculate_quartile(ranking, total_journals);
  
  sjrcat.sjr = sjr;
  sjrcat.total = parseInt(total_journals);
  sjrcat.position = parseInt(ranking);
  sjrcat.q = 'Q' + quartile;
  return sjrcat;
}


// Calculates the quartile of the journal based on its position and the total number of journals within a certain category
function calculate_quartile(position, total_journals){
  quarter = Math.floor(total_journals/4);
  for(i=1; i<=4; i++){
    if (position <= i*quarter){
      break;
    }	
  }
  return i;
}

/**
 * GET RANKING FROM MICROSOFT ACADEMIC
 */
function getMicrosoftRankigForJournals(journalName){

  // Go to url
  ﻿iimPlay('CODE: URL GOTO=http://academic.research.microsoft.com/RankList?entitytype=4&topDomainID=2&subDomainID=0&last=0&start=1&end=100');

  // Go to table
  iimPlay('CODE: TAG POS=1 TYPE=TABLE ATTR=CLASS:staticTable\n' +
  'TAG POS=1 TYPE=TBODY EXTRACT=HTM');
  extraction = iimGetLastExtract().trim();
}
function getMicrosoftRankigForConferences(conferenceName){

  // Go to url
  ﻿iimPlay('CODE: URL GOTO=http://academic.research.microsoft.com/RankList?entitytype=3&topDomainID=2&subDomainID=0&last=0&start=1&end=100');

}

/**
 * GET RANKING FROM CORE
 */

function getCore(journalName){

  // Go to url
  iimPlay('CODE: URL GOTO=http://103.1.187.206/core');
  
  // Fill form
  iimPlay('CODE: TAG POS=1 TYPE=INPUT:TEXT FORM=ID:searchform ATTR=NAME:search CONTENT=' + journalName.replace(/ /g, '<SP>'));
  
  // Click search
  iimPlay('CODE: TAG POS=1 TYPE=INPUT:SUBMIT FORM=ID:searchform ATTR=*');
  
  // Position on row
  iimPlay('CODE: TAG POS=1 TYPE=TABLE ATTR=* EXTRACT=TXT\n' +
  'TAG POS=1 TYPE=TBODY ATTR=* EXTRACT=TXT\n' +
  'TAG POS=2 TYPE=TR ATTR=* EXTRACT=TXT\n' +
  'SET !EXTRACT NULL\n' +
  'TAG POS=4 TYPE=TD ATTR=* EXTRACT=TXT\n');
  category = iimGetLastExtract();
  
  if (category == '#EANF#')
    return undefined;
 
  category = category.trim();
  if(category.length() > 1);
    return undefined;
  
  return category;
}

/**
 * SHOW RESULTS
 */
function showResultsJsonEnergy(jsonData){
  
  // Go to url
  iimPlay('CODE: URL GOTO=http://energia.deusto.es/qualitindex/viewer.html');
  
  //Paste result JSON in the field
  iimPlay('CODE: TAG POS=1 TYPE=TEXTAREA ATTR=ID:input CONTENT=' + JSON.stringify(jsonData).replace(/ /g, '<SP>') );
  
  // Press view button
  iimPlay('CODE: TAG POS=1 TYPE=BUTTON ATTR=TXT:Structure');
  
}

function showResultsPasteBin(jsonData){
  
  // Go to url
  iimPlay('CODE: URL GOTO=http://pastebin.com/');
  
  //Paste result JSON in the field
  iimPlay('CODE: TAG POS=1 TYPE=TEXTAREA FORM=NAME:myform ATTR=ID:paste_code CONTENT=' + JSON.stringify(jsonData).replace(/ /g, '<SP>') );
  
}
