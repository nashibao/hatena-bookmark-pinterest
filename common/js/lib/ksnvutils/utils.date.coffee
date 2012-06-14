this.utils ?= {}
utils = this.utils

class utils.date
	# safariとieが受け付けるdate用文字列に変換する
	@reverse_for_safari = (datestr, hoursplitter, datesplitter) ->
		daystr = datestr
		hourstr = false
		if hoursplitter
			date_hour = datestr.split(hoursplitter)
			if date_hour.length!=2
				return datestr
			daystr = date_hour[0]
			hourstr = date_hour[1]
		day_month_year = daystr.split(datesplitter)
		if day_month_year.length!=3
			return datestr
		daystr = "#{day_month_year[1]}/#{day_month_year[2]}/#{day_month_year[0]}"
		if hourstr
			return "#{daystr} #{hourstr}"
		return daystr

	# Dateオブジェクト/文字列を任意の文字列に変換する
	@formatedDate = do ->
		zFill = (number) ->
			numStr = String number
			if numStr.length < 2
				numStr = '0' + numStr
			numStr
		(date, format) ->
			if utils.type(date) is 'string'
				dateStrList = date.split /:|-|\s/
				date = new Date dateStrList[0],
					parseInt(dateStrList[1]) - 1, dateStrList[2],
					dateStrList[3], dateStrList[4], dateStrList[5]
			format.replace(/%Y/, date.getFullYear())
				.replace(/%m/, zFill(date.getMonth() + 1))
				.replace(/%d/, zFill(date.getDate()))
				.replace(/%H/, zFill(date.getHours()))
				.replace(/%M/, zFill(date.getMinutes()))
				.replace(/%S/, zFill(date.getSeconds()))

	@convertToJapaneseLikeTwitter = (date, nodate=false) ->
		today = new Date()
		interval = today - date
		minutes = Math.round(interval/(1000*60))
		hour = Math.round(interval/(60*60*1000))
		if minutes < 10 and not nodate
			return "いま"
		if minutes < 60 and not nodate
			return "#{minutes}分前"
		if hour < 24
			if nodate
				return "今日"
			else
				return "#{hour}時間前"
		return "#{date.getMonth()+1}/#{date.getDate()}"