ximpel.mediaTypeDefinitions.MetadataVisualization = function( customEl, customAttr, $el, player ){
   
    this.customElements = customEl;
    this.customAttributes = customAttr;
    this.$parentElement = $el;
    this.player = player;
    
    //[todo] move this to standard iframe media type in ximpel
    // Register new events
    player.events.push('iframe_open');
    player.events.push('iframe_close');
    
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
    var numNodes = this.customAttributes.numberOfNodes;
    if(numNodes == null) {
    	numNodes = 80;
    }
    var ddcDepth = this.customAttributes.ddcDepth;
    if(ddcDepth == null) {
    	ddcDepth = 2;
    }
    var ddcFilter = this.customAttributes.ddcFilter;
    if(ddcFilter == null) {
    	ddcFilter = -1;
    }
    var visualizationType = this.customAttributes.visualizationType;
    if(visualizationType == null) {
    	visualizationType = 'clusters';
    }
    
  	//correct url (otherwise uses demos directory as its basis)
  	var correctFileUrl = '../' + iFrameFile;
  	var metadataVisualizationUrl = 'demos/'+ visualizationType +'.html?file=' + correctFileUrl + '&nodes=' + numNodes + '&ddcdepth=' + ddcDepth + '&ddcfilter=' + ddcFilter;
  
	//use of 'container' property to allow for overlays
	//for now: use margin-left and margin-top to utilize specified x and y values
    this.$iframeSpan = $('<div style="background-color:'+ containerBackgroundColor +'" class="container"></div>');
    
    this.$iframeSpan.html( $('<iframe width="' + iFrameWidth + '" height="' + iFrameHeight + '" style="margin-left:'+iFrameX+'; margin-top:'+iFrameY+'; border:0px solid white; background-color:'+ iFrameBackgroundColor +'" wmode="Opaque" src="' + metadataVisualizationUrl + '"></iframe>') );
    
    /*this.$iframeSpan.css({
        'color': 'red',
        'font-size': '100px'
    });*/
  
    this.state = 'stopped';
}
ximpel.mediaTypeDefinitions.MetadataVisualization.prototype = new ximpel.MediaType();
  
ximpel.mediaTypeDefinitions.MetadataVisualization.prototype.mediaPlay = function(){
    this.state = 'playing';
    this.$parentElement.append( this.$iframeSpan );
    this.player.pubSub.publish( 'iframe_open', { $iframe: this.$iframe, file: this.customAttributes.file} );

}
  
ximpel.mediaTypeDefinitions.MetadataVisualization.prototype.mediaPause = function(){
    this.state = 'paused';
}
  
ximpel.mediaTypeDefinitions.MetadataVisualization.prototype.mediaStop = function(){
    this.state = 'stopped';
    this.player.pubSub.publish( 'iframe_close', { $iframe: this.$iframe, file: this.customAttributes.file} );
    this.$iframeSpan.detach();
}
  
ximpel.mediaTypeDefinitions.MetadataVisualization.prototype.mediaIsPlaying = function(){
    return this.state === 'playing';
}
  
ximpel.mediaTypeDefinitions.MetadataVisualization.prototype.mediaIsPaused = function(){
    return this.state === 'paused';
}
  
ximpel.mediaTypeDefinitions.MetadataVisualization.prototype.mediaIsStopped = function(){
    return this.state === 'stopped';
}
 
// Register the media type with XIMPEL
var r = new ximpel.MediaTypeRegistration('metadatavisualization', ximpel.mediaTypeDefinitions.MetadataVisualization, {
        'allowedAttributes': ['file','width','height','backgroundColor','containerBackgroundColor','x','y', 'numberOfNodes', 'ddcDepth', 'ddcFilter', 'visualizationType'],
        'requiredAttributes': ['file'],
        'allowedChildren': [],
        'requiredChildren': [],
} );
ximpel.registerMediaType( r );