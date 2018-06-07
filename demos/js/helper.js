//helper functions for visual navigation demos

var STOP_WORD_ARR = ["a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the", "new", "book", "science"];

//get trim function
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
}

function isStopword(word) {
	for(var i=0; i<STOP_WORD_ARR.length; i++) {
		if(word == STOP_WORD_ARR[i]) {
			return true;
		}
	}
	return false;
}


//move d3 element to front or back (https://github.com/wbkd/d3-extended)
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
	this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {  
	return this.each(function() { 
		var firstChild = this.parentNode.firstChild; 
		if (firstChild) { 
			this.parentNode.insertBefore(this, firstChild); 
		} 
	});
};


//shorten long strings
function shortenText(txt, len) {
	if(txt.length>len) {
		return txt.substring(0,len) + " (...)";
	} else {
		return txt;
	}
}

/*saved books helper interface displayal functions*/
function showSavedBooks() {
	var bookArr = window.parent.getSavedBookArray();

	//delete previous group (todo: check if it exists)
	d3.select("#savedbooks")
			.select("#allsavedbookcovers").remove();
	
	//create group
	d3.select("#savedbooks")
		.select("#savedbookviewer")
			//set width based on #books to enable scrolling
			.attr("width", bookArr.length*120+"px")
			.append("g")
				.attr("id", "allsavedbookcovers")
	
	
	for(var i=0; i<bookArr.length; i++) {
		//book displayal
		d3.select("#savedbooks")
			.select("#savedbookviewer")
				.select("#allsavedbookcovers")
				.append("image")
					.attr("xlink:href", function(d){
						return bookArr[i].coverImage;//"data:image/jpg;base64," + bookArr[i].coverImage;
						})
					.attr("width", 100)
					.attr("style", "cursor: pointer;")
					.attr("x", 120*i)
					.attr("y", 0)
					//define data to pass to mouseover functions
					.data([bookArr[i]])
					.on("click", function(d) {
						//window.parent.removeBook(d.isbn);
						//showSavedBooks();
						showToolTip(d);
						//[todo] move to separate function (highlight node..)
						d3.selectAll('g#allnodes').attr('opacity',.8).select('circle').style("white", "black").style("stroke-width", "0px");	

						//highlight a specific node			
						d3.selectAll('g#allnodes').filter(function(e){return (e.type=="node" && e.isbn==d.isbn); }).transition().duration(10).attr('opacity',.9).select('circle').style("stroke", "white").style("stroke-width", "15px");
					});
					
		//close button for book
		d3.select("#savedbooks")
			.select("#savedbookviewer")
				.select("#allsavedbookcovers")
					.append("image")
						.attr("xlink:href", function(d){
							return "gui/closeButton.png";
						})
						.attr("width", 25)
						.attr("x", 120*i)
						.attr("y", 0)
						.data([bookArr[i]])
						.on("click", function(d) {
							window.parent.removeBook(d.isbn);
							showSavedBooks();
						});
					
	}
	
	//hide or display the interface element
	if(bookArr.length>0) {
		d3.select("#savedbooks").classed("hidden", false);
	} else {
		d3.select("#savedbooks").classed("hidden", true);
	}
}

function showToolTip(d) {
	/*//verify if book preview is available
	initializeGoogleBook(d)*/

	console.log(d.title);
	console.log(d.alsoBought);
	console.log(d.connectingProperty);

	hideGetBookWindow();
	var description = shortenText(d.description, 550);

	//Update the tooltip position and value
	d3.select("#tooltip")					
		.select("#bookdescr")
		.text(description);
		
	var classification = "";			
	if(d.classification!=null) {
		classification = " (" + d.classification + ")"; 
	}
	
	d3.select("#tooltip")
	.select("#title")
	.text(d.title + classification);
	
	if(d.averageStars!=0) {
		d3.select("#tooltip")
		.select("#bookrat")
		.text(d.year);
		//.text('This book has ' + Math.round(d.averageStars) + ' stars.');
	} else {
		d3.select("#tooltip")
		.select("#bookrat")
		.text('This book has no rating yet.');
	}
	
	//get availability of item
	showItemAvailability(d.mmsID);
	d3.select("#tooltip")	
		.select("#bookavail")
		//.text('Assessing availability...');
	//hide get this book until availability is known
	d3.select("#tooltip")
		.select("#actions")
		.select("#getbutton")
		//.style("opacity", .2)
		.style("display", "none")
					
	d3.select("#tooltip")
		.select("#bookcover")
		.attr("src",d.coverImage); //"data:image/jpg;base64," + d.coverImage); 
	
	d3.select("#tooltip")
		.select("#closebutton")
		.on("click", function(d) {
			//hide tooltip
			console.log("clicked!");
			hideToolTip();
			hideGetBookWindow();
			hideBookPreviewWindow();	
		});
	
	d3.select("#tooltip")
		.select("#savebutton")
		.on("click", function() {
			//hide tooltip
			console.log("save button clicked!");
			window.parent.saveBook(d);
			console.log(window.parent.getSavedBookArray());
			showSavedBooks();
		});
	
	//click on get this book
	d3.select("#tooltip")
		.select("#getbutton")
		.on("click", function() {
			showGetBookWindow(d);
		});
	

	//click on preview this book
	d3.select("#tooltip")
		.select("#actions")
			.select("#previewbutton")
				.style("opacity",1);
	d3.select("#previewbookwindow").style("visibility", "hidden");	
	
	console.log("now loading image " + d.mapUrl);			
	//Show the tooltip
	d3.select("#tooltip").classed("hidden", false);
}

function hideToolTip() {
	d3.select("#tooltip").classed("hidden", true);
}

function showItemAvailability(mmsID) {
			d3.select("#tooltip")
				.select("#actions")
				.select("#getbutton")
				.style("opacity", 1)
	/*getAvailabilityOfItem(mmsID, function(d) {
		//callback
		if(d=='true') {
			d3.select("#tooltip")	
				.select("#bookavail")
				.text('This book is available!');
			console.log('item is available!');
			//highlight get this book button
			d3.select("#tooltip")
				.select("#actions")
				.select("#getbutton")
				.style("opacity", 1)
		} else { 
			d3.select("#tooltip")	
				.select("#bookavail")
				.text('This book is not available.');
			console.log('item is not available!');
		}
	/*});*/
}


function showBookPreviewWindow() {
	hideGetBookWindow();
	console.log("[debug] preview button clicked!");
	//https://developers.google.com/books/docs/viewer/developers_guide
	
	d3.select("#previewbookwindow")
		.select("#closebutton")
		.on("click", function() {
			//hide tooltip
			console.log("clicked!");
			hideBookPreviewWindow();
		});
	//for some reason there is a problem loading the book into a window with display:none, so use visibility instead
	d3.select("#previewbookwindow").style("visibility", "visible");
}

function hideBookPreviewWindow(d) {
	d3.select("#previewbookwindow").style("visibility", "hidden");	
}

function initializeGoogleBook(d) {
	console.log("initGB");
	console.log(d);
	var isbn = d.isbn;
	var displayOptions = {showLinkChrome: false};
    var viewer = new google.books.DefaultViewer(document.getElementById('previewbookcanvas'),displayOptions);
        viewer.load('ISBN:'+isbn, alertBookNotFound, alertBookInitialized); //'ISBN:0738531367'
    }
	

function alertBookNotFound() {
	console.log("could not embed the book:book not found");
    d3.select("#tooltip")
		.select("#actions")
		.select("#previewbutton")

		//.style("display","none");
		.on("click", function() {
				console.log("no book with this isbn");
			});
}

function alertBookInitialized() {
  console.log("book successfully loaded and initialized!");
  		d3.select("#tooltip")
			.select("#actions")
			.select("#previewbutton")
			
			.style("opacity",1)
			
			.on("click", function() {
				showBookPreviewWindow();
			});
			
		d3.select("#tooltip")
			.select("#descr")
			.select("#bookcover")
			
			.on("click", function() {
				showBookPreviewWindow();
			});
}



function removeGoogleBooksPreviewFooter() {
		//$('#previewbookcanvas > div > div:nth-child(2)').css('display','none');
		alertBookInitialized();
}

function showGetBookWindow(d) {
	console.log("[debug] get button clicked!");
	//hide preview window if visible
	hideBookPreviewWindow();	
	
	//reset map
	d3.select("#getbookwindow")
		.select("#bookloc")
			.attr("src","")
			.attr("alt","Library map.");
	
	console.log(d.mapUrl);
	//load map if available
	if(d.mapUrl!="-1") {
		d3.select("#getbookwindow")
			.select("#bookloc")
			.attr("src",d.mapUrl);
	} else {
		d3.select("#getbookwindow")
			.select("#bookloc")
			.attr("alt","[Maps are currently only available for Science Library books]");
	}
	
	d3.select("#getbookwindow")
		.select("#bookdetails")
			.text(d.title + " by " + d.author + " (" + d.year + "). ISBN: " + d.isbn);
	
	d3.select("#getbookwindow")
		.select("#closebutton")
		.on("click", function(d) {
			//hide tooltip
			console.log("clicked!");
			hideGetBookWindow();
		});
	
	//Show the tooltip
	d3.select("#getbookwindow").classed("hidden", false);
}

function hideGetBookWindow() {
	d3.select("#getbookwindow").classed("hidden", true);	
}

//https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//http://bl.ocks.org/mbostock/7555321
function wrapText(text, width) {
	console.log(text);
	
  text.each(function() {
	numLines = 0;
	console.log(d3.select(this));
	console.log(d3.select(this).attr('y'));
	d3.select(this).attr('y',0)
	console.log(d3.select(this).attr('dy'));
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineHeight = 1, // em
        dy = 0,
        tspan = text;//.text(null).append("tspan").attr("dy", '-5em'),
		previousTextLength = 0,
		lineNumber = 0;
		//console.log(x,y);
		console.log('xx'+ (-lineHeight*words.length));
		//console.log(words.length);
    while (word = words.pop()) {
	  console.log('currW is ' + word);
      line.push(word);
      tspan.append("tspan").text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
		//console.log(text.attr('y'));
		//text.attr('y') = text.attr('y')-10;
	    lineNumber++;
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
		if(numLines==0) { dy='-1em' 
		} else { 
		dy = lineHeight+'em'
		}
        tspan = text.append("tspan").attr("dx",-previousTextLength).attr("dy", dy).text(word);
		//console.log(tspan.attr('y'));
		numLines++;
      }
	  previousTextLength = tspan.node().getComputedTextLength();
    }
	text.attr('y',function(d) { return -500});
	
  });
  //correct x value of text
  //text.x 
}

function checkScienceLibCollection(coll) {
	console.log(">>>>>>>>" + coll);
	if (coll=="k00465") {return "Mat.";} 
	else if (coll=="k00426") {return "Farm.";}
	else if (coll=="k00421") {return "Biol.";}
	else if (coll=="k00457") {return "Kjem.";}
	else if (coll=="k00460") {return "Laveregrad";}
	else if (coll=="k00471") {return "Pensum";}
	else if (coll=="k00440") {return "Fys.";}
	else if (coll=="k00447") {return "Geo.";}
	else if (coll=="k00449") {return "Geol.";}
	else if (coll=="k00413") {return "Astr.";}
	else if (coll=="k00423") {return "Boksamling";}
	else if (coll=="k00475") {return "Samling 42";}
	//not a science lib collection
	else {return -1};
}

//array with DDC classes and labels, global
var ddcArray = {
		ddcInfo: []
	};

function readDDCClasses() {
	d3.json("data/ddcClasses.json", function(data) {
	
	data.forEach(function(d) {
		console.log(">"+d);
		ddcArray.ddcInfo.push({
			"class" : d.class,
			"label" : d.label,
			});
		});
	});
	console.log(ddcArray.ddcInfo);
}

function getLabelForDDCClass(ddcCl) {
	for(var i=0; i<ddcArray.ddcInfo.length; i++) {
		if(ddcArray.ddcInfo[i].class==ddcCl) {
			return ddcArray.ddcInfo[i].label;
		}
	}
	//no label found
	return 0;
}

function generateMapUrl(holdings,lib) {
	//generate a url for a map with the location of a book (Sc. Lib. only for the moment)
	if(lib=="ureal") {
		for(var i=0; i<holdings.length; i++) {
			var coll = checkScienceLibCollection(holdings[i].collection);
			
			if(coll!="-1") {
				return "https://ub-www01.uio.no/realfagsbiblioteket-kart/map.php?collection="+holdings[i].collection+"&callnumber="+holdings[i].callcode;
			}
		}
	}
	//no maps for other collections than ureal for the moment
	return "-1";
}

//verify if classification is ddc
function isDDC(item) {
	if (item.system === "ddc") {
		return true;
	} 
	return false; 
}
			
//get ddc number for a given item, return 0 if none
function getDDC(e) {
	var filteredArray = e.filter(isDDC);
	if(filteredArray.length>0 && typeof filteredArray[0].number != 'undefined') {
		return filteredArray;
	} else { 
		return null;
	}
}

//https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
// extends 'from' object with members from 'to'. If 'to' is null, a deep clone of 'from' is returned
function extend(from, to)
{
    if (from == null || typeof from != "object") return from;
    if (from.constructor != Object && from.constructor != Array) return from;
    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
        from.constructor == String || from.constructor == Number || from.constructor == Boolean)
        return new from.constructor(from);

    to = to || new from.constructor();

    for (var name in from)
    {
        to[name] = typeof to[name] == "undefined" ? extend(from[name], null) : to[name];
    }

    return to;
}

//function to read wiki images for ingredients
function readImageJSON(inputFile,callback) {
	d3.json(inputFile, function(data) {
		console.log("imgjson");
		console.log(data);
		callback(data);
	});
}

//function to get an img url from wikidata json object
function getImgLink(imgObj,ingredArr) {
	var imgUrl;
	//object to store ingredients & images
	var ingredImgObj = [];

	for(var i=0; i<ingredArr.length; i++) {
		//console.log("loop1");
		imgObj.forEach(function(d) {
			//split by space, to check for each included word..
			var ingredInclQuant = ingredArr[i].toLowerCase();
			var ingredStringArr = ingredInclQuant.split(" ");
			
			for(var j=0; j<ingredStringArr.length; j++) {
				
				//console.log(ingredStringArr[j] + "=???=" + d.label.toLowerCase());
				if(d.label.toLowerCase().indexOf(ingredStringArr[j].trim()) != -1 && ingredStringArr[j].trim().length>3) {
					//console.log(ingredStringArr[j] + "=???=" + d.label.toLowerCase());
					//console.log(d.image);
					imgUrl = d.image;
					
					if(ingredImgObj == null) {
						ingredImgObj.push({
							"ingredient" : ingredInclQuant,
							"image" : d.image
						});
					} else {
						if(!ingredExists(ingredImgObj,ingredInclQuant)) {
							ingredImgObj.push({
								"ingredient" : ingredInclQuant,
								"image" : d.image
							});
						}
					}
					
				}
			}
		});
	}
	console.log("ingredImgObj");
	console.log(ingredImgObj);
	return ingredImgObj;
}

function ingredExists(arr,ingred) {
		for(var i=0; i<arr.length; i++) {
			if(arr.ingredient === ingred) {
				return true;
			}
		}
		return false;
}

function getAltImg() {
	var coverImage="images/stilleven.jpg";
	var randomValue = getRandomInt(4);
	if(randomValue==0) {
			coverImage = "images/stilleven.jpg";
		} else if(randomValue==1) {
			coverImage = "images/vis.jpg";
		} else if(randomValue==2) {
			coverImage = "images/fruit.jpg";
		} else if(randomValue==3) {
			coverImage = "images/brood.jpg"
		}
	return coverImage;
}

//standard function to read book data
function readBookJSON(inputFile, numElements, minimumStars, callback) {
	readImageJSON("../media/json/dbpedia_info_corr.json", function(imgObj) {
					//var imgs = "testtesttest";
					//callback
			var bookArray = {
				bookinfo: []
			};
	
			console.log("XxXxXxXOoOoOo");
			console.log(imgObj);
		
			d3.json(inputFile, function(data) {		
				var counter = 0;
				data.forEach(function(d) {					
					//set classification number to 0 by default
			
					if(counter == numElements) {
						return;
					}
			
					var classifications;
					var classification = "";
					if(d.predict_tag != null) {
						classifications = d.predict_tag.split(",");
						classification = classifications[0];
					}
			
			
			
					if(classification=="") {
						classification = "none"
					}
			
					console.log("ingred");
					var ingred_clean = d.ingredients_quantities.toLowerCase().replace(/[^a-z0-9, ]/gi,'');
					var ingredArr = ingred_clean.split(",");
					ingredArr = ingredArr.sort();
					
					var ingredImgArr = getImgLink(imgObj,ingredArr);
					console.log(ingredImgArr);
					
					var imgUrl;
					if(ingredImgArr.length==0) {
						imgUrl = getAltImg();
					} else {
						imgUrl = ingredImgArr[0].image;
					}
					
					
					//console.log(ingredArr);
					//console.log(Math.floor(3+(ingredArr.length/5)));
			
					//var classifications = getDDC(d.alma.classifications);
			
					/*console.log(classifications);
			
					if(classifications!=null && classifications != 0) {
						//for now, only use first classification number
						classification = getDDC(d.alma.classifications)[0].number;
					}*/
			
					//generate a map url to show the location of a book (helper.js)
					//returns -1 if no loc available
					//var mapUrl = generateMapUrl(d.alma.holdings, "ureal");
					//console.log(mapUrl);
			
					var mapUrl = "";
			
			
			
					//console.log("alma id" + d.alma._id);
			
					/*if(counter < numElements && classification!=0 && d.amazon.averageStars>minimumStars) {
						if(DDC_FILTER==null || DDC_FILTER==-1) {*/
							pushBookInfo(bookArray,d,classification,classifications,ingredArr,mapUrl,imgUrl,ingredImgArr)
							counter++;
						/*} else {
							console.log(classification + "=/=" + DDC_FILTER);
							if(classification.startsWith(DDC_FILTER)) {
								pushBookInfo(bookArray,d,classification,classifications,mapUrl)
								counter++;
							}
						}
					}*/
				});
				callback(bookArray.bookinfo);
			});
		});
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function shortenArray(inputArr, maxLen) {
	var outputArr = new Array();
	if(inputArr==null) {
		return outputArr;
	}
	for(var i=0; i<inputArr.length; i++) {
		outputArr[i] = inputArr[i];
		if(i == maxLen-1) {
			return outputArr;
		}
	}
	return outputArr;
}

function sortArray(inputArr) {
	if(inputArr!=null){
		return inputArr.sort();
	} else {
		return inputArr;
	}
}

function pushBookInfo(bookArray,d,classification,classifications,ingredArr,mapUrl,imgUrl,ingredImgArr) {

		
		var randomID = Math.floor(Math.random() * (0 - 99999999999 + 1)) + 0;
		
		bookArray.bookinfo.push({
			"id" : randomID,
			"mmsID" : randomID,//d.unnamed,
			"isbn" : randomID,//d.unnamed,
			"title" : shortenText(d.ocr,80),
			"year" : d.date,
			"alsoBought" : ingredArr,
			"averageStars": (1+Math.floor(ingredArr.length/5)),//normalize(ingredArr.length, 1, 500),
			"description": d.ocr,
			"classifications" : classifications,
			"classification" : classification,
			"coverImage" : imgUrl,//d.amazon.image.$binary,
			"holdings" : "",
			"author" : "allerhande",
			"mapUrl" : mapUrl,
			"ingredientImages" : ingredImgArr
		});
}

function getAvailabilityOfItem(mmsID, callback) {
	//var inputFile = 'http://data.ub.uio.no/microservices/availability.php?mms_id=' + mmsID;
	var inputFile = 'https://ub-www01.uio.no/microservices/availability.php?mms_id=' + mmsID;
	console.log(inputFile);
	d3.json(inputFile, function(data) {		
		if(data.availability=='available') {
			callback('true');
		} else {
			callback('false');
		}
	});
}

String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}