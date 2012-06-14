this.utils ?= {}
utils = this.utils
###
knockout, django依存型のutil

TODO: modelにdicsとmap関数を暗黙的に実装する必要がある
 dicsにかんしては継承で、mapにかんしてはinterface定義に置き換えたい
 （must be overridedな関数にして継承にするかprototypeを使うか．)
TODO: エラーハンドリング

###

utils.debug = true

utils.log = (obj) ->
	if utils.debug
		console.log obj

utils.break = () ->
	if utils.debug
		throw Error('break')

# 型を返す
# @see http://minghai.github.com/library/coffeescript/07_the_bad_parts.html
utils.type = do ->
	classToType = {}
	for name in "Boolean Number String Function Array Date RegExp Undefined Null".split(" ")
		classToType["[object " + name + "]"] = name.toLowerCase()
	(obj) ->
		strType = Object::toString.call(obj)
		classToType[strType] or "object"
