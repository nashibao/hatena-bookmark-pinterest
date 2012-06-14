this.utils ?= {}
utils = this.utils

# viewmodelに渡してtemplate拡張したりする
class utils.ui
	# formのバグ用
	# textinputが反映されないときが多いんで.
	# でも必要かどうか微妙
    @formtohash = (evt, url, dom) ->
        document.location = url + $('input', dom).val()
        return false

# animation関係
ko.bindingHandlers.fadeVisible = {
    init: (element, valueAccessor) ->
        value = valueAccessor()
        $(element).toggle(ko.utils.unwrapObservable(value))
    update: (element, valueAccessor) ->
        value = valueAccessor()
        if ko.utils.unwrapObservable(value) then $(element).fadeIn() else $(element).fadeOut()
}
# ページング
class utils.ui.PageManager
	constructor: (index_size=3)->
		@index_size = index_size
		@start_index = ko.observable(0)
		@end_index = ko.observable(@index_size)
		@pages = ko.observableArray([])
		@selected_page = ko.observable(0)
	set_max_index: (max_index)=>
		pages = []
		for i in [0..Math.floor((max_index-1)/@index_size)]
			pages.push(i)
		@pages(pages)
	set_index: (index)=>
		@start_index(index*@index_size)
		@end_index((index+1)*@index_size)
		@selected_page(index)
