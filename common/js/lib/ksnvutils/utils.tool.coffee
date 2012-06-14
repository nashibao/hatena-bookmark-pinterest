this.utils ?= {}
utils = this.utils

class utils.tool
	@_browser = false
	@browser = () ->
		if @_browser
			return @_browser
		ua = navigator.userAgent.toLowerCase()
		if ua.indexOf("safari") != -1
			@_browser = 'safari'
		else if ua.indexOf("firefox") != -1
			@_browser = 'firefox'
		else if ua.indexOf("opera") != -1
			@_browser = 'opera'
		else if ua.indexOf("netscape") != -1
			@_browser = 'netscape'
		else if ua.indexOf("msie") != -1
			@_browser = 'ie'
		else if ua.indexOf("mozilla/4") != -1
			@_browser = 'netscape'
		
		return @_browser