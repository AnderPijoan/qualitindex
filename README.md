Publication and Journal statistics web scraper script and viewer
================================================================

This repository contains an iMacros™ ( http://wiki.imacros.net/ ) script for extracting 
some publication and journal statistics from several pages by web scraping.

USING WEB SCRAPING TECHNIQUES MAY BE AGAINST SOME OF THE TERM OF USE OF THESE WEBSITE.

The script uses a JSON data array as a input where to get the values needed for searching the sites.


Input JSON
==========

|--------------------------|---------------------------------------------------------|
| Search publication cites | Needs a 'title' and a 'year'                            |
|   Search journal impact  | Needs a journal name and a 'year' when to get the stats |
|--------------------------|---------------------------------------------------------|

After extracting these data, the viewer can show some more results.

Example input:

[{
  "journal": "JJJ", 
  "title": "TTTT", 
  "year": "2011"
}, 
{
  "journal": "JJJ", 
  "year": "2005"
}, 
{
  "title": "TTTT", 
  "year": "2012",
}]


Prepare the input
=================
For preparing the JSON input this repository also two javascript scripts:


BiBTeX to JSON converter
========================
Converts BiBTex files to the needed JSON input format. Some specific BiBTeX notation might cause trauble.


CSV to JSON converter
========================
Converts CSV files to the needed JSON input format. Needs to have the fields named as 'Title', 'Year', 'Journal'.


View the results
========================
Once the script finishes, it will paste the results into a textarea where some calculations can be made, such as
count all the cites or generate the H-index.


Example output:

[{
  "journal":"SSSS",
  "title":"MMMM",
  "year":"2012",
  "citesGoogle":"",
  "citesScopus":0,
  "citesWok":0,
  "sjr":0.223,
  "sjrYear":"2012",
  "sjrCategories":
    [{
    "category":"Aaaa",
    "total":118,
    "position":102,
    "q":"Q4"
    }]
},
{
  "journal":"III",
  "title":"SSSS",
  "year":"2009",
  "citesGoogle":4,
  "citesScopus":0,
  "citesWok":0,
  "h5":11,
  "jcr":0.436,
  "jcrYear":"2009",
  "jcrCategories":
    [{
    "category":"COO",
    "total":103,
    "position":95,
    "q":"Q4"
    },
    {
    "category":"COOOOO",
    "total":95,
    "position":92,
    "q":"Q4"
    }],
  "sjr":0.336,
  "sjrYear":"2009",
  "sjrCategories":
    [{
    "category":"AAA",
    "total":118,
    "position":75,
    "q":"Q3"
    },
    {
    "category":"COOO",
    "total":229,
    "position":98,
    "q":"Q2"
    }]
}]


Live Demo
========================
Here you can see a live demo for using the different tools.

http://energia.deusto.es/qualitindex
