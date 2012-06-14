this.utils ?= {}
utils = this.utils



# knockout拡張 -----------------------------------------------

ko.observableArray.fn.kls = false
ko.observableArray.fn.filter = false
ko.observableArray.fn.sorter = false
# dbを監視してko.arrayを更新する場合の更新呼び出し
ko.observableArray.fn._dispatchall = () ->
	@.removeAll()
	for key, val of @kls.dics()
		if @filter
			if @filter(val)
				@.push(val)
		else
			@.push(val)

ko.observableArray.fn.is_bind_stopped = false
ko.observableArray.fn.bind_func = false
ko.observableArray.fn.bind_stop = () ->
	@.is_bind_stopped = true
ko.observableArray.fn.bind_start = () ->
	@.is_bind_stopped = false
	@.bind_func()


ko.observableArray.fn.is_loading = false
ko.observableArray.fn.is_errored = false

class utils.model
	###
	model関係のutil
	https://gist.github.com/2769209
	###

	# 無ければfalse
	@get: (pk, kls) ->
		if pk of kls.dics()
			return kls.dics()[pk]
		else
			return false

	# 無ければ作成
	@get_or_create: (pk, kls) ->
		if pk of kls.dics()
			return kls.dics()[pk]
		else
			obj = new kls()
			obj.pk(pk)
			kls.dics()[pk] = obj
			return obj

	@get_and_delete: (pk, kls) ->
		if pk of kls.dics()
			obj = kls.dics()[pk]
			delete kls.dics()[pk]
			# このpkを監視している先を削除．
			# ここテストしてない
			torelations = kls._torelations()
			if pk of torelations
				for key of torelations[pk]
					for from in torelations[pk][key]
						from[key]("")
						from[key+'__relation_id'] = -1
			# 逆参照の場合はどーする
			fromrelations = kls._fromrelations()
			if pk of fromrelations
				for key of fromrelations[pk]
					for to in fromrelations[pk][key]
						to[key+'__reverse']("")



	# djangoクラスオブジェクトのマッピング用
	@map: (jsn, kls, param) ->
		pk = kls.unique_key(jsn)
		if kls.has_field_wrapper
			jsn = jsn.fields
		if !kls.is_active(jsn)
			is_active = false
			utils.model.get_and_delete(pk, kls)
			return false
		else
			obj = @get_or_create(pk, kls)
			obj.map(jsn, param)
			kls._bind_relations(obj)
		return obj

	# APIの登録
	@register_function: (kls, funcname) ->
		kls[funcname] = (query, target, callback) ->
			kls.custom(funcname, query, target, callback)
		kls['bind_'+funcname] = (query, target, callback) ->
			kls.bind_custom(funcname, query, target, callback)
	@models: {}

class utils.model.Model
	# jsonの返り値、基本的にはmodelnameと一緒．
	@returnkey: 'items'
	@_modelname: 'items'
	@modelname = (modelname) ->
		@_modelname = modelname
		utils.model.models[modelname] = @
	# 関連指定
	@relations = (options) ->
		@__relations = options
		for key, tokls of options
			tokls._reverse_relations()[key] = @
	# プライマリキー
	@unique_key = (obj) ->
		obj.id
	@has_field_wrapper: false
	# observableにするもの
	@observable_keys: []
	@is_active: (obj) ->
		if 'is_active' of obj and !obj['is_active']
			return false
		return true
	# ここからAPI!!!!!!!!!!!!!!!!!!!!!!!!!
	# 監視
	@observe = (initial=[], options=options, query=false) ->
		arr = ko.observableArray(initial)
		arr.is_loading = ko.observable(false)
		kls = @
		arr.kls = kls
		if options
			{filter: filter, sorter: sorter} = options
			arr.filter = filter
			arr.sorter = sorter
		kls._observe(arr)
		if query
			@list(query)
		return arr
	# リアクティブAPI
	@bind_custom = (funcname, query, initial=[], callback=false) ->
		target = ko.observableArray(initial)
		target.is_loading = ko.observable(false)
		kls = @
		@custom(funcname, query, target, callback)
		bind_func = () ->
			if not target.is_bind_stopped
				target.removeAll()
				kls.custom(funcname, query, target, callback)
		target.bind_func = bind_func
		for key, val of query
			if ko.isObservable(val)
				val.subscribe (newval) ->
					bind_func()
		return target
	@bind_list = (query, initial=[], callback=false) ->
		target = ko.observableArray(initial)
		target.is_loading = ko.observable(false)
		kls = @
		@list(query, target, callback)
		bind_func = () ->
			if not target.is_bind_stopped
				target.removeAll()
				kls.list(query, target, callback)
		target.bind_func = bind_func
		for key, val of query
			if ko.isObservable(val)
				val.subscribe (newval) ->
					bind_func()
		return target
	@bind_detail = (pk_observable, initial='', callback=false) ->
		target = ko.observableArray(initial)
		target.is_loading = ko.observable(false)
		kls = @
		@detail(pk_observable(), target, callback)
		pk_observable.subscribe (newval) ->
			kls.detail(pk_observable(), target, callback)
		return target
	# 非同期DB API
	@custom = (funcname, query, target, callback) ->
		url = @endpoint + '/custom/' + @_modelname + '/' + funcname
		url += utils.api.parseParams(query) if query
		@_apicall(url, target, callback)
	@list = (query=false, target, callback) ->
		url = @endpoint + '/list/' + @_modelname 
		url += utils.api.parseParams(query) if query
		@_apicall(url, target, callback)
	@detail = (pk, target, callback) ->
		url = @endpoint + '/detail/' + @_modelname + '/' + pk
		@_apicall(url, target, callback)
	@create = (query, callback) ->
		url = @endpoint + '/create/' + @_modelname
		url += utils.api.parseParams(query) if query
		@_apicall(url, false, callback)
	@update = (pk, query, callback) ->
		url = @endpoint + '/update/' + @_modelname + '/' + pk
		url += utils.api.parseParams(query) if query
		@_apicall(url, callback)
	@delete = (pk, callback) ->
		url = @endpoint + '/delete/' + @_modelname + '/' + pk
		@_apicall(url, false, callback)
	# インデックス作成
	# {key:{val:[obj]}}
	# keyはmakeindexなりなんなりする
	# @indexs = (options) ->
	# 	indexs = @_indexs()
	# 	for key in options
	# 		indexs[key] = {}
	# @_indexs = () ->
	# 	@__indexs ?= {}
	# 同期DB API (knockoutでくるまないよ!!)
	# TODO: 後でインデックスでもつける
	@list_sync = (options, filter) ->
		dics = @dics()
		results = []
		for pk in dics
			obj = dics[pk]
			bl = true
			for key of options
				val = obj[key]
				tempval = options[key]
				if val != tempval
					bl = false
					break
			if bl
				if filter
					if filter(obj)
						results.push(obj)
				else
					results.push(obj)
		return results
	@detail_sync = (options) ->
		dics = @dics()
		result = false
		for pk of dics
			obj = dics[pk]
			bl = true
			for key of options
				val = obj[key]
				tempval = options[key]
				if val != tempval
					bl = false
					break
			if bl
				result = obj
				break
		return result

	# 外部公開はここまで！！!!!!!!!!!!!!!!!!!
	# あとは
	# 中で使うだけ!!!!!!!!!!!!!!!!!!!!!!!!!!
	@dics = ->
		@_dics ?= {}
	@clean = ->
		@_dics = {}
	# {pk:key:[obj]}
	@_relations = ->
		@__relations ?= {}
	@_reverse_relations = ->
		@__reverse_relations ?= {}
	@_torelations = ->
		@__fromrelationstorelations ?= {}
	# {pk:key:[obj]}
	@_fromrelations = ->
		@__fromrelations ?= {}
	@_start_observe = (from, key, id) ->
		torelations = @_torelations()
		if id not of torelations
			torelations[id] = {}
		if key not of torelations[id]
			torelations[id][key] = []
		if from not in torelations[id][key]
			torelations[id][key].push(from)
	@_make_from_relation = (kls, to, key, id) ->
		fromrelations = kls._fromrelations()
		if id not of fromrelations
			fromrelations[id] = {}
		if key not of fromrelations[id]
			fromrelations[id][key] = []
		if to not in fromrelations[id][key]
			fromrelations[id][key].push(to)
	@_bind_relations = (obj) ->
		pk = @unique_key(obj)
		torelations = @_torelations()
		if pk of torelations
			for key of torelations[pk]
				for fromobj in torelations[pk][key]
					fromobj[key](obj)
					# 逆参照
					if obj[key+'__reverse']
						obj[key+'__reverse'](fromobj)
					else
						obj[key+'__reverse'] = ko.observable(fromobj)
					# fromkls = fromobj.__proto__.constructor
					fromkls = fromobj.constructor
					@_make_from_relation(fromkls, obj, key, @unique_key(fromobj))
					# ここで監視から削除すべきかな, 本当は
	constructor: () ->
		@pk = ko.observable(-1)
		# kls = @.__proto__.constructor
		kls = @.constructor
		reverse_relations = kls._reverse_relations()
		for key, fromkls of reverse_relations
			@[key+'__reverse'] = ko.observable("")
	relation: () ->

	map: (jsn, param) =>
		# jsonをそのままもらって突っ込む
		# とりあえずobservableにしてない
		# これIEで動くんだっけ？
		# kls = @.__proto__.constructor
		kls = @.constructor
		temprelations = []
		for key, val of jsn
			# リレーションの場合
			relations = kls._relations()
			fromrelations = kls._fromrelations()
			if key of relations
				temprelations.push(key)
			else
				if key in kls.observable_keys
					if @[key]
						@[key](val)
					else
						@[key] = ko.observable(val)
				else
					@[key] = val
		for key in temprelations
			val = jsn[key]
			# for key, val of jsn
			# リレーションの場合
			relations = kls._relations()
			fromrelations = kls._fromrelations()
			if key of relations
				tokls = relations[key]
				toobj = utils.model.get(val, tokls)
				@[key+'__relation_id'] = val
				tokls._start_observe(@, key, val)
				if not toobj
					toobj = ""
					# ここで監視を開始する
				else
					if toobj[key+'__reverse']
						toobj[key+'__reverse'](@)
					else
						toobj[key+'__reverse'] = ko.observable(@)
					kls._make_from_relation(kls, toobj, key, kls.unique_key(@))
				if @[key]
					@[key](toobj)
				else
					@[key] = ko.observable(toobj)
			else
				# if key in kls.observable_keys
				# 	if @[key]
				# 		@[key](val)
				# 	else
				# 		@[key] = ko.observable(val)
				# else
				# 	@[key] = val
		return @
	# 監視されている場合
	@_observers = ->
		@__observers ?= []
	@_observe = (observer) ->
		@_observers().push(observer)
	@_dispatchall = () ->
		for observer in @_observers()
			observer._dispatchall()
	@_apicall = (url, target, callback) ->
		if target
			target.is_loading(true)
		utils.api.get url,
			[{key:@_modelname, class:@, target: target}], (obj, objss)->
				callback(obj, objss) if callback
				if target
					target.is_loading(false)
