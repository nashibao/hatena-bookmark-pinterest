this.utils ?= {}
utils = this.utils

class utils.router
	@decompose = (template) ->
		obj = {}
		hash = location.hash
		utils.log "hashchanged #{hash} to #{template}"
		props = template.split('/')
		hashs = hash.split('/')
		for i in [0..props.length-1]
			prop = props[i]
			if prop.indexOf(":")==0
				p = prop.replace(":","")
				if hashs.length > i
					h = hashs[i]
					obj[p]=h
				else
					obj[p]=undefined
		return obj