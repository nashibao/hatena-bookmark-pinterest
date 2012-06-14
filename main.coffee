this.app ?= {}
app = this.app
utils = this.utils
utils.debug = true
class ViewModel
    constructor: ->
app.vm = new ViewModel()
app.vm.ui = utils.ui
app.model ?= {}

tile_width = 320
tile_top = 100

class app.model.Entry extends utils.model.Model
    constructor: (options)->
        {title:title, subtitle:subtitle, image:image, link:link, num:num, timestamp: timestamp, domain: domain, id:id} = options
        @title = ko.observable(title)
        @subtitle = ko.observable(subtitle)
        @image = ko.observable(image)
        @link = ko.observable(link)
        @num = ko.observable(num)
        @timestamp = ko.observable(timestamp)
        @domain = ko.observable(domain)
        @id = ko.observable(id)

class app.model.Interest extends utils.model.Model
    constructor: (title, id) ->
        @title = ko.observable(title)
        @id = ko.observable(id)
        @page = 0
        @entries = ko.observableArray([])

        @columns = []
    more: () =>
        @page = @entries().length
        @load()
    load: () =>
        utils.log @page
        $.get "http://b.hatena.ne.jp/nashibao/interest/"+@title()+"?of="+@page+"&fragment=main", (data) =>
            dom = $(data)
            for d_entry in $(".main-entry-list > li", dom)
                # utils.log d_entry
                d_link = $(".entry-title > .entry-link", d_entry)
                id = $(".entry-comment", d_entry).attr('id')
                utils.log id
                title = d_link.text()
                link = d_link.attr('href')
                subtitle = $("p.entry-summary", d_entry).text().replace(' 続きを読む', '')
                image = $(".entry-image-block > .capture > img", d_entry).attr('src')
                num = $("a", $(".users", d_entry)).text().replace(' users', '')
                entry = new app.model.Entry({title:title, subtitle:subtitle, image:image, link:link, num:num, id:id})
                @entries.push(entry)
            @resizeall()

    resizeall: ()=>
        parent = $("#interest-dom")
        parent_width = parent.width()
        parent_left = parent.offset().left
        parent_top = parent.offset().top
        colnum = Math.floor(parent_width / (tile_width))
        yohaku = (parent_width - (colnum*tile_width))/2
        @columns = []
        for i in [0..colnum-1]
            @columns.push({height:tile_top, rows:[]})
        col_index = 0
        for entry in @entries()
            dom = $("#"+entry.id()+'-dom')
            imgdom = $("img", dom)
            column = @columns[col_index]
            column.rows.push(dom)
            dom.offset({top:parent_top+column.height, left:yohaku+parent_left+tile_width*col_index})
            column.height += dom.height()
            if imgdom.height()==0
                column.height += 195
            col_index += 1
            if col_index == colnum
                col_index = 0
        for i in [0..colnum-1]
            if $('#morebtn').offset().top < @columns[i].height
                $('#morebtn').offset({top:@columns[i].height+60})
    selected: ()=>
        app.vm.hatena.selectedInterest(@)
        if @entries().length > 0
            @resizeall()
        else
            @load()


class Hatena
    constructor: ->
        @interests = ko.observableArray([])
        @selectedInterest = ko.observable(false)
    load: =>
        $.get "http://b.hatena.ne.jp/nashibao/interest?fragment=interest_top_entries", (data) =>
            dom = $(data)
            for d_interest in $(".interest-sub-unit", dom)
                title = $(".content-title", d_interest).text()
                @interests.push(new app.model.Interest(title, title))
    resized: =>
        if app.vm.hatena.selectedInterest() and app.vm.hatena.selectedInterest().entries() and app.vm.hatena.selectedInterest().entries().length > 0
            if app.vm.hatena.selectedInterest().columns.length == 0
                app.vm.hatena.selectedInterest().resizeall()
            else
                colnum = Math.floor($("#interest-dom").width() / (tile_width))
                if colnum != app.vm.hatena.selectedInterest().columns.length
                    app.vm.hatena.selectedInterest().resizeall()

app.vm.hatena = new Hatena()

$(window).resize () =>
    app.vm.hatena.resized()

$(window).scroll () =>
    app.vm.hatena.resized()



$(document).ready ()=>
    ko.applyBindings(app.vm)

    app.vm.hatena.load()