ximpel.mediaTypeDefinitions.PDFViewer = function( customEl, customAttr, $el, player ){

    this.customElements = customEl;
    this.customAttributes = customAttr;
    this.$parentElement = $el;
    this.player = player;

    // Register new events
    //player.events.push('iframe_open');
    //player.events.push('iframe_close');

    var iFrameFile = this.customAttributes.file;
    var iFrameBackgroundColor = this.customAttributes.backgroundColor;
    if(iFrameBackgroundColor == null) {
    	iFrameBackgroundColor = "#000000";
    }
    var containerBackgroundColor = this.customAttributes.containerBackgroundColor;
    if(containerBackgroundColor == null) {
    	containerBackgroundColor = "#000000";
    }
    var iFrameX = this.customAttributes.x;
    if(iFrameX == null) {
    	iFrameX = 0;
    }
    var iFrameY = this.customAttributes.y;
    if(iFrameY == null) {
    	iFrameY = 0;
    }
    var iFrameWidth = this.customAttributes.width;
    if(iFrameWidth == null) {
    	iFrameWidth = 1920;
    }
    var iFrameHeight = this.customAttributes.height;
    if(iFrameHeight == null) {
    	iFrameHeight = 1080;
    }
    
  	//bookviewer/pdf/books/2013Deligne_brochure.pdf
  	
  	var correctFileUrl = '../../' + iFrameFile;
  	var pdfViewerUrl = 'bookviewer/pdf/index.html?link=' + correctFileUrl;
  
	//use of 'container' property to allow for overlays
	//for now: use margin-left and margin-top to utilize specified x and y values
    this.$iframeSpan = $('<div style="background-color:'+ containerBackgroundColor +'" class="container"></div>');
    this.$iframe = $('<iframe width="' + iFrameWidth + '" height="' + iFrameHeight + '" style="margin-left:'+iFrameX+'; margin-top:'+iFrameY+'; border:0px solid white; background-color:'+ iFrameBackgroundColor +'" wmode="Opaque" src="' + pdfViewerUrl + '"></iframe>');
    this.$iframeSpan.html( this.$iframe );
    
    /*this.$iframeSpan.css({
        'color': 'red',
        'font-size': '100px'
    });*/
  
    this.state = 'stopped';
}
ximpel.mediaTypeDefinitions.PDFViewer.prototype = new ximpel.MediaType();
  
ximpel.mediaTypeDefinitions.PDFViewer.prototype.mediaPlay = function(){
    this.state = 'playing';
    this.$parentElement.append( this.$iframeSpan );
    this.player.pubSub.publish( 'iframe_open', { $iframe: this.$iframe, file: this.customAttributes.file} );
}
  
ximpel.mediaTypeDefinitions.PDFViewer.prototype.mediaPause = function(){
    this.state = 'paused';
}
  
ximpel.mediaTypeDefinitions.PDFViewer.prototype.mediaStop = function(){
    this.state = 'stopped';
    this.player.pubSub.publish( 'iframe_close', { $iframe: this.$iframe, file: this.customAttributes.file} );
    this.$iframeSpan.detach();
}
  
ximpel.mediaTypeDefinitions.PDFViewer.prototype.mediaIsPlaying = function(){
    return this.state === 'playing';
}
  
ximpel.mediaTypeDefinitions.PDFViewer.prototype.mediaIsPaused = function(){
    return this.state === 'paused';
}
  
ximpel.mediaTypeDefinitions.PDFViewer.prototype.mediaIsStopped = function(){
    return this.state === 'stopped';
}
 
// Register the media type with XIMPEL
var r = new ximpel.MediaTypeRegistration('pdfviewer', ximpel.mediaTypeDefinitions.PDFViewer, {
        'allowedAttributes': ['file','width','height','backgroundColor','containerBackgroundColor','x','y'],
        'requiredAttributes': ['file'],
        'allowedChildren': [],
        'requiredChildren': [],
} );
ximpel.registerMediaType( r );
