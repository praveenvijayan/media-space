/* Mediaspace
 * http://www.decodize.com/mediaspace/
 *
 * Copyright (c) 2010 Dec decodize (http://www.decodize.com/)
 * Built on top of the jQuery library
 * http://jquery.com
 * 
 * Media space usage
 * $('#media-container ul').mediaspace(); // Basic usage
 *
 *
 *
 *$('#media-container ul').mediaspace({ // With options
 *		container:'media-box',
 *		fit:false,
 *		title:true
 *});
 *
 * Media space options
 * container:'' - The id of the container in which media should display
 * wmode: 'opaque'  -   Set the flash wmode attribute 
 * autoplay: true   -  Automatically start videos: True/False  
 * fit:false  -  Fit image to container width and height. if set to false it will retain orginal width & height 
 * default_width:500 - Default width of the video, to change pass it as param (design.swf?width=792&amp;height=294) 
 * default_height:400 -  Default height of the video, to change pass it as param (video.mov?width=600&amp;height=200)  
 * title:false - if need to add title, set it to true 
 * closetitle:false, Allows to close caption/title 
 * firstitem:true -  Playes first item when loads 
 * 
 * Example
 * markup :
 * <div class="media">
 	<div id="main"></div> 
	
   	<ul>
 		<li>
			<a href="">
				<img src="image.jpg" />
				<div class="media-caption">My caption</div>
			</a>
		</li>
		<li>
			<a href="">
				<img src="video.mov?width=600&amp;height=200" />
				<div class="media-caption">My video caption</div>
			</a>
		</li>
		<li>
			<a href="">
				<img src="flash.swf?width=600&amp;height=200" />
			</a>
		</li>
    </ul>
  </div>
 * script :
   <script type="text/javascript">
  	$(function(){
		$('.media ul').mediaspace({title:true});		   
	})
  </script>
 * Style :
 * .media-caption{ display:none }
 *
 *
 */
 
(function( $ ){

  $.fn.mediaspace = function( options ) {  

    var settings = {
      	container:'main', /*Container id in which image or video will display (class or elemnt name won't work ) */
		wmode: 'opaque', /* Set the flash wmode attribute */
		autoplay: false, /* Automatically start videos: True/False */
		fit:false, /*Fit image to container width and height. if set to false it will retain orginal width & height*/
		default_width:500, /*Default width of the video, to change pass it as param */
		default_height:400, /*Default height of the video, to change pass it as param */
		title:false, /*if need to add title, set it to true*/
		closetitle:false, /*Allows to close caption/title*/
		firstitem:true /*Playes first item when loads */
    };

    return this.each(function() {        
      // If options exist, lets merge them
      // with our default settings
      if ( options ) { 
        $.extend( settings, options );
      }
 		 	var toInject = "", itemSrc = "", obj = $(this), title='',
			image_markup =  '<img id="fullResImage" src="" />',
	
			flash_markup = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><param name="flashvars" value="{flashvars}"><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',
			
			quicktime_markup = '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',
			
			iframe_markup = '<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>'
			
			//Content width and height
			contentWidth = $('#' + settings.container).width();
			contentHeight = $('#' + settings.container).height();
 						
			if(settings.firstitem){
				findurl ($('a:first', obj));
			}
			
			$('a', obj).click(function(){
				findurl($(this));	
				return false;
			});
			
			//Finds elemets url
			function findurl(objurl){
				itemSrc =  objurl.attr('href');
				itemTitle = $('.media-caption',objurl.parent());
				title='';
				//Title
				if(settings.title && itemTitle.length > 0){
					if(settings.closetitle){
					 	title = "<div class='md-caption'>" + itemTitle.html() + "<a href='javascript:void(0);' class='closeTitle'>Close</a></div>" ;
					}else{
						title = "<div class='md-caption'>" + itemTitle.html() + "</div>" ;
					}
				}
				currentObj = $(objurl);
				flip_getfiletypes(itemSrc, title);
				typechk(itemSrc);
				
			}
			
			 if(window.$().live){
				$('.closeTitle').live('click', function(){
					$(this).parents('.md-caption').remove();
				});
			}else{
				$('body').click(function(e){
					var target = $(e.target);
					if (target.is(".closeTitle")) {
						target.parents('.md-caption').remove();
					}
				});	
			}		
			
 			
			//Getting type of content
			function flip_getfiletypes(itemSrc){
					
					if (itemSrc.match(/youtube\.com\/watch/i)) {
						return 'youtube';
					}else if (itemSrc.match(/vimeo\.com/i)) {
						return 'vimeo';
					}else if(itemSrc.indexOf('.mov') != -1){ 
						return 'quicktime';
					}else if(itemSrc.indexOf('.swf') != -1){
						return 'flash';
					}else if(itemSrc.indexOf('iframe') != -1){
						return 'iframe';
					}else if(itemSrc.indexOf('custom') != -1){
						return 'custom';
					}else if(itemSrc.substr(0,1) == '#'){
						return 'inline';
					}else{
						return 'image';
					};
				};
				
				
			//Calling function for inserting objects (image, video and flash)	
			function typechk(elem){
			// Get the dimensions
			movie_width = ( parseFloat(grab_param('width', itemSrc)) ) ? grab_param('width',itemSrc) : settings.default_width.toString();
			movie_height = ( parseFloat(grab_param('height',itemSrc)) ) ? grab_param('height',itemSrc) : settings.default_height.toString();
			
			
				switch (flip_getfiletypes(itemSrc, title)){
					case 'image':
						objtitle = currentObj.find('img').attr('title');
						objalt = currentObj.find('img').attr('alt');
						
						if(settings.fit){
							toInject = "<img src='"+elem+"' width='"+contentWidth+"' height='"+contentHeight+"' alt='' title='' />";
						}else{
							toInject = "<img src='"+elem+"' title='"+objtitle+"' alt='"+objalt+"' />";
						}
					break;
				
					case 'youtube':
						movie = 'http://www.youtube.com/v/'+grab_param('v', elem);
						if(settings.autoplay) movie += "&autoplay=1";
						
						if(settings.fit){
							toInject = flash_markup.replace(/{width}/g,contentWidth).replace(/{height}/g,contentHeight).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,movie);
						}else{
							toInject = flash_markup.replace(/{width}/g,movie_width).replace(/{height}/g,movie_height).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,movie);
						}
					break;
				
					case 'vimeo':
						movie_id = elem;
						var regExp = /http:\/\/(www\.)?vimeo.com\/(\d+)/;
						var match = movie_id.match(regExp);
						
						movie = 'http://player.vimeo.com/video/'+ match[2] +'?title=0&amp;byline=0&amp;portrait=0';
						if(settings.autoplay) movie += "&autoplay=1;";
				
						vimeo_width = contentWidth + '/embed/?moog_width='+ contentWidth;
						
						if(settings.fit){
 							toInject = iframe_markup.replace(/{width}/g,vimeo_width).replace(/{height}/g,contentHeight).replace(/{path}/g,movie);
 						}else{
 							toInject = iframe_markup.replace(/{width}/g,movie_width).replace(/{height}/g,movie_height).replace(/{path}/g,movie);
 						}
					break;
				
					case 'quicktime':
						toInject = quicktime_markup.replace(/{width}/g,contentWidth).replace(/{height}/g,contentHeight).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,elem).replace(/{autoplay}/g,settings.autoplay);
					break;
				
					case 'flash':
						flash_vars = elem;
						flash_vars = flash_vars.substring(elem.indexOf('flashvars') + 10,elem.length);

						filename = elem;
						filename = filename.substring(0,filename.indexOf('?'));
						
						 if(settings.fit){
 							toInject =  flash_markup.replace(/{width}/g,contentWidth).replace(/{height}/g,contentHeight).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,filename+'?'+flash_vars).replace(/{flashvars}/g,flash_vars);
 						}else{
 							toInject =  flash_markup.replace(/{width}/g,movie_width).replace(/{height}/g,movie_height).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,filename+'?'+flash_vars).replace(/{flashvars}/g,flash_vars);
 						}
					break;
				
					case 'iframe':
						frame_url = elem;
						frame_url = frame_url.substr(0,frame_url.indexOf('iframe')-1);
						
						 if(settings.fit){
 							toInject = iframe_markup.replace(/{width}/g,contentWidth).replace(/{height}/g,contentHeight).replace(/{path}/g,frame_url);
 						}else{
 							toInject = iframe_markup.replace(/{width}/g,movie_width).replace(/{height}/g,movie_height).replace(/{path}/g,frame_url);
 						}
					break;
					
					/*case 'custom':
						correctSizes = _fitToViewport(movie_width,movie_height); // Fit item to viewport
						toInject = settings.custom_markup;
					break;
					
					case 'inline':
						// to get the item height clone it, apply default width, wrap it in the prettyPhoto containers , then delete
						myClone = $(pp_images[set_position]).clone().css({'width':settings.default_width}).wrapInner('<div id="pp_full_res"><div class="pp_inline clearfix"></div></div>').appendTo($('body'));
						correctSizes = _fitToViewport($(myClone).width(),$(myClone).height());
						$(myClone).remove();
						toInject = settings.inline_markup.replace(/{content}/g,$(pp_images[set_position]).html());
					break;*/
				};
				
				$('#' + settings.container).html(toInject + title);
			}
    });

  };
  
  function grab_param(name,url){
	  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	  var regexS = "[\\?&]"+name+"=([^&#]*)";
	  var regex = new RegExp( regexS );
	  var results = regex.exec( url );
	  return ( results == null ) ? "" : results[1];
	}
  
})( jQuery );