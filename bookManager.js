var savedBookArray = [];

function saveBook(book) {
	console.log("save book: " + book);
	//only add book if not already in list
	if(!bookExists(book)) {
		savedBookArray.push(book);
	}
}

function removeBook(isbn) {
	console.log("remove isbn: " + isbn);
	var bookArr = getSavedBookArray();
	
	for(var i=0; i<bookArr.length; i++) {
		if(bookArr[i].isbn == isbn) {
			bookArr.splice(i, 1);
			return "book removed successfully";
		}
	}
	return "book not found";
}

function bookExists(book) {
	var bookArr = getSavedBookArray();
	for(var i=0; i<bookArr.length; i++) {
		if(bookArr[i].isbn == book.isbn) {
			return true;
		}
	}
	return false;
}

function getSavedBookArray() {
	return savedBookArray;
}