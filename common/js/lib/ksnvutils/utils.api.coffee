this.utils ?= {}
utils = this.utils

class utils.api
	###
	network関係のutil
	get, post
	###

	@parseParams = (dic) ->
		str = '?'
		for key, val of dic
			if ko.isObservable(val)
				str += key + '=' + val() + '&'
			else if utils.type(val) == 'array'
				str += key + '=[' + val + ']&'
			else
				str += key + '=' + val + '&'
		return str

	@getJSON = (url, data, callback) ->
		utils.log url
		$.ajaxSetup {cache: false}
		$.getJSON url, data, (data) ->
			$.ajaxSetup {cache: true}
			utils.log data
			callback data

	@postJSON = (url, data, callback) ->
		utils.log url
		$.ajaxSetup {cache: false}
		$.ajax {
			url: url,
			type: "POST",
			data: data,
			dataType: "json",
			complete: (data, dataType) ->
				utils.log data
				$.ajaxSetup {cache: true}
				callback data
			}

	@get = (url, params, callback) ->
		@getJSON url, (data) ->
			tempnames = []
			objss = {}
			for val in params
				{key:key, class:kls, target:target, filter: filter, identifier:identifier, options:options} = val
				objs = []
				objss[key] = objs
				tempnames.push(key)
				identifier ?= []
				da = data[key]
				if options and 'reverse' of options
					da = da.reverse()
				for jsn in da
					obj = jsn
					if kls
						obj = utils.model.map(jsn, kls, identifier)
						if not filter or filter(obj)
							target.push(obj) if target
					else
						if not filter or filter(obj)
							target.push(obj) if target
					objs.push(obj)
				kls._dispatchall()
			for modelname of utils.model.models
				if modelname not in tempnames
					kls = utils.model.models[modelname]
					da = data[modelname]
					if da
						for jsn in da
							utils.log jsn
							obj = utils.model.map(jsn, kls, [])
							objs.push(obj)
						kls._dispatchall()
			callback(data, objss)
			utils.log data

	@post = (url, query, params, callback, progress) ->
		@postJSON url, query, (d) ->
			data = $.evalJSON d.responseText
			utils.log data
			objss = {}
			for val in params
				objs = []
				{key:key, class:kls, identifier:identifier, options:options} = val
				objss[key] = objs
				identifier ?= []
				# TODO: ださいので[0]が無いように修正したい!!
				jsn = data[key]
				# jsn = data[key][0]
				if kls
					obj = utils.model.map(jsn, kls, identifier)
					objs.push(obj)
				kls._dispatchall()
			callback(data, objss)
			utils.log data