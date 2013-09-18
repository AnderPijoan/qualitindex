var data;

/*
 * *********************************************** FUNCTION TO GENERATE JSON TABLE ************************************************
 */
function structureJSON(){
  
  $('#result_wrapper').remove();
  $('body').append('<table id="result" class="width100"><table/>');
  
  // Convert text into JSON
  data = JSON.parse($('#input').val());
  
  // If data has been parsed correctly and it is an array
  if (data && typeof(data) == 'object' ){
    
    parseToTable(data, function(aaData, aoColumns){
      
      // Create table
      $('#result').dataTable({
	"aaData" : aaData,
	"aoColumns" : aoColumns,
	"bLengthChange": true,
	"bDestroy": true
      });
      
    });
  }
}


/*
 * *********************************************** FUNCTION TO COUNT CITES ************************************************
 */
function totalQArticles(){
  alert('Not done yet');
}

/*
 * *********************************************** FUNCTION TO COUNT CITES ************************************************
 */
function totalCites(){
  
  // Convert text into JSON
  data = JSON.parse($('#input').val());
  googleCites = 0;
  scopusCites = 0;
  wokCites = 0;
  
  for (d = 0; d < data.length; d++){
    
    if (data[d].citesGoogle)
      googleCites += data[d].citesGoogle;
    
    if (data[d].citesScopus)
      scopusCites += data[d].citesScopus;
    
    if (data[d].citesWok)
      wokCites += data[d].citesWok;
  }
  
  aaData = [[googleCites + "" , scopusCites + "" , wokCites + "" , googleCites + scopusCites + wokCites + ""]];
  
  aoColumns = [{"sTitle": "Cites Google"},{"sTitle": "Cites Scopus"},{"sTitle": "Cites Wok"},{"sTitle": "Total Cites"}];
  
  $('#result_wrapper').remove();
  $('body').append('<table id="result" class="width100"><table/>');
  
  // Create table
  $('#result').dataTable({
    "aaData" : aaData,
    "aoColumns" : aoColumns,
    "bLengthChange": true,
    "bDestroy": true
  });
}


/*
 * *********************************************** FUNCTION TO CALCULATE H5 index ************************************************
 */
function hIndex(){
  
  // Convert text into JSON
  data = JSON.parse($('#input').val());
  
  google = {"foundArt" : 0, "citedArt" : 0, "foundArtCites" : Number.MAX_VALUE, "citedArtCites" : Number.MAX_VALUE};
  scopus = {"foundArt" : 0, "citedArt" : 0, "foundArtCites" : Number.MAX_VALUE, "citedArtCites" : Number.MAX_VALUE};
  wok = {"foundArt" : 0, "citedArt" : 0, "foundArtCites" : Number.MAX_VALUE, "citedArtCites" : Number.MAX_VALUE};
  
  for (d = 0; d < data.length; d++){
    
    if (data[d].title){
      
      if (data[d].citesGoogle || data[d].citesGoogle == 0){
	if (data[d].citesGoogle > 0){
	  google.citedArtCites = Math.min(google.citedArtCites , data[d].citesGoogle);
	  google.citedArt++;
	}
	google.foundArtCites = Math.min(google.foundArtCites , data[d].citesGoogle);
	google.foundArt++;
      }
      
      if (data[d].citesScopus || data[d].citesScopus == 0){
	if (data[d].citesScopus > 0){
	  scopus.citedArtCites = Math.min(scopus.citedArtCites , data[d].citesScopus);
	  scopus.citedArt++;
	}
	scopus.foundArtCites = Math.min(scopus.foundArtCites , data[d].citesScopus);
	scopus.foundArt++;
      }
      
      if (data[d].citesWok || data[d].citesWok == 0){
	if (data[d].citesWok > 0){
	  wok.citedArtCites = Math.min(wok.citedArtCites , data[d].citesWok);
	  wok.citedArt++;
	}
	wok.foundArtCites = Math.min(wok.foundArtCites , data[d].citesWok);
	wok.foundArt++;
      }
    }
    
  }
  
  aaData = [
  ["Google", Math.min(google.foundArt , google.foundArtCites) + "" ,  Math.min(google.citedArt , google.citedArtCites) + ""],
  ["Scopus", Math.min(scopus.foundArt , scopus.foundArtCites) + "" ,  Math.min(scopus.citedArt , scopus.citedArtCites) + ""],
  ["Wok", Math.min(wok.foundArt , wok.foundArtCites) + "" ,  Math.min(wok.citedArt , wok.citedArtCites) + ""]
  ];
  
  aoColumns = [{"sTitle": "Source"},{"sTitle": "H Index including 0 cites articles"},{"sTitle": "H Index excluding 0 cites articles"}];
  
  $('#result_wrapper').remove();
  $('body').append('<table id="result" class="width100"><table/>');
  
  // Create table
  $('#result').dataTable({
    "aaData" : aaData,
    "aoColumns" : aoColumns,
    "bLengthChange": true,
    "bDestroy": true
  });
  }
  
  
  /*
   * *********************************************** FUNCTION TO CONVERT THE JSON OBJECT TO AADATA AND AOCOLUMNS NEEDED FOR TABLE ************************************************
   */ 
  function parseToTable(da, callback){
    
    // Iterate through all elements properties to get the headers names
    var aoC = [];
    var keys = [];
    var data = da;
    
    for (e = 0; e < da.length; e++){
      for(key in da[e]){
	
	if (keys.indexOf(key) < 0){
	  aoC.push({"sTitle": key});
	  keys.push(key);
	}
      }
    }
    
    // Get all the elements data
    var aaD = [];
    
    for (var e = 0; e < data.length; e++){
      
      var row = [];
      
      // Get the properties in the same order as the first element
      for(var k = 0; k < keys.length; k++){
	
	// If it is an object
	if( typeof(data[e][keys[k]]) == 'object' ){
	  
	  parseToTable(data[e][keys[k]], function(d, c){
	    row.push( tableToHtml(d,c) );
	  });
	}
	else if (data[e][keys[k]]){
	  row.push( data[e][keys[k]] );
	}
	else {
	  row.push( "" );
	}
      }
      aaD.push(row);
    }
    callback(aaD, aoC);
  }
  
  
  /*
   * *********************************************** FUNCTION TO CONVERT AADATA AND AOCOLUMNS TO HTML TABLE FORMAT ************************************************
   */
  function tableToHtml(aaData, aoColumns){
    
    html = '<table>';
    
    th = '<thead><tr>';
    tb = '<tbody>';
    
    // Header
    // Get columns names
    for(key in aoColumns){
      th += '<th>' + aoColumns[key].sTitle + '</th>'
    }
    
    // Body
    // Get each row
    for (r = 0; r < aaData.length; r++){
      tb += '<tr>';
      // Each value
      for(v = 0; v < aaData[r].length; v++){
	
	if ( typeof(aaData[r][v]) == 'string' ){
	  tb += '<td>' + aaData[r][v].toUpperCase() + '</td>';
	}
	else{
	  tb += '<td>' + aaData[r][v] + '</td>';
	}
      }
      tb += '</tr>';
    }
    
    th += '</tr></thead>';
    tb += '</tbody>';
    html += th + tb + '</table>';
    
    return html;
  }
  
  
  /*
   * *********************************************** FUNCTION TO CONVERT BIBTEX DATA TO JSON ************************************************
   */
  function bib2json(bibData, callback){
    
    // Remove line breaks
    var bibjson = bibData.replace(/(\r\n|\n|\r)/gm,"");
    
    // Remove acute notation in bibtex
    bibjson = bibjson.replace( new RegExp(/\{\\'([A-Z])\}/gi) , "$1" );
    bibjson = bibjson.replace( new RegExp(/\{\\~n\}/gi) , "ñ" );
    
    // Remove special notation
    bibjson = bibjson.replace( new RegExp(/\\textsc\{([A-Z]+)\}/gi) , "$1" );
    bibjson = bibjson.replace( new RegExp(/\\ensuremath\{([0-9]+)\^\{(th|st|nd|rd)\}\}/gi) , "$1"+"th" );
    
    // Remove upper case notation
    bibjson = bibjson.replace( new RegExp(/\{([A-Z])\}/g) , "$1" );
    
    // Format to JS
    bibjson = bibjson.replace( new RegExp(/(\w+)\s*=\s*\{/g) , "\"$1\": \"");
    bibjson = bibjson.replace( new RegExp( /\}(?=\s*[,\}])/g) , "\"" );
    bibjson = bibjson.replace( new RegExp( /@(\w+)\s*\{([^,]*)/g) , "{\"$1\": \"$2\"" );
    bibjson = bibjson.replace( new RegExp(/\}\s*{/g) , "},\n{" );
    
    // Add '[' at the begining and ']' at the end
    bibjson = bibjson.trim().replace( new RegExp(/^\{/g) , "[{" );
    bibjson = bibjson.trim().replace( new RegExp(/\}$/g) , "}]" );
    
    try{
      var bibobj = JSON.parse(bibjson);
    } catch (e){
      callback(e, bibjson);
    }
    
    for(i = 0; i < bibobj.length; i++){
      
      if( bibobj[i].booktitle && !bibobj[i].journal ){
	bibobj[i].journal = bibobj[i].booktitle;
	delete bibobj[i].booktitle;
      }
    }
    callback(false, bibobj);
    }
    
    
    /*
     * *********************************************** FUNCTION TO CONVERT CSV DATA TO JSON ************************************************
     */
    function csv2json(delimiter, csvData, callback){
      
      // Split lines
      var lines = csvData.split('\n');
      
      if (!delimiter || !lines){
	callback('Something missing', lines);
      } else {
	
	var csvobj = [];
	
	// Read first line to get the header names
	var names = lines[0].split(delimiter);
	
	for (l = 1; l < lines.length; l++){
	  var fields = lines[l].split(delimiter);
	  var csvjson = '{';
	  
	  for (f = 0; f < fields.length; f++){
	    csvjson += '"' + names[f].toLowerCase() + '":"' + fields[f] + '",';
	  }
	  
	  csvjson =  csvjson.replace( new RegExp(/,$/g) , "}" );
	  csvobj.push(JSON.parse(csvjson));
	}
	
	for(i = 0; i < csvobj.length; i++){
	  
	  if( csvobj[i].booktitle && !csvobj[i].journal ){
	    csvobj[i].journal = csvobj[i].booktitle;
	    delete csvobj[i].booktitle;
	  }
	}
	callback(false, csvobj);
      }
    }