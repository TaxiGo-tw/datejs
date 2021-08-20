
let defaultTimezoneOffset = 0

module.exports = class DateJS {
	constructor() {
		this._date = new Date()
	}

	static setDefaultTimezone(newValue) {
		defaultTimezoneOffset = newValue
	}

	config(cb) {
		cb(this)
		return this
	}

	static string(time) {
		return new DateJS().config(x => x._date = new Date(time))
	}

	static unix(time) {
		return new DateJS().config(x => x._date = new Date(time * 1000))
	}

	unix() {
		return this._date.getTime() / 1000
	}

	/* operator */
	/**
	 * @returns offset timezone hourly from current
	**/
	tz(zone = defaultTimezoneOffset) {
		return DateJS.unix(this._date.getTime() / 1000 + zone * 3600)
	}

	add(num = 0, type = 'day') {
		switch (type) {
			case 'day':
				return DateJS.unix(this._date.getTime() / 1000 + num * 86400)
			case 'week':
				return DateJS.unix(this._date.getTime() / 1000 + num * 7 * 86400)
			case 'year':
				const date = new Date(this._date.getTime()) // copy
				return DateJS.unix(date.setFullYear(date.getFullYear() + num) / 1000)
			default:
				return
		}
	}

	/* 直接Call Date function */
	get(func) {
		const digit = this._date[func]()
		return (`${digit}`.length == 1 ? `0${digit}` : digit)
	}

	/* 二次加工 */
	getDate() { return '' + this.get('getFullYear') + this.get('getMonth') + this.get('getDate') }
	getYearWeek() {
		let date = this._date

		//歸零時間只留日期
		date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

		//find 1/1
		const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))

		const nextSunday = new Date(yearStart.getTime() + (7 - yearStart.getDay()) * 86400000)

		const weeks = (date.getTime() - nextSunday.getTime()) / (86400000 * 7)
		const weekNo = parseInt(weeks)

		return '' + this.get('getFullYear') + weekNo
	}

	/* compare */
	isSame(to, type) {
		switch (type) {
			case 'day':
				return this.getDate() == to.getDate()
			case 'week':
				return this.getYearWeek() == to.getYearWeek()
			case 'year':
				return this.get('getFullYear') == to.get('getFullYear')
			default:
				break;
		}
		return false
	}

	/* localize */
	getMonth(symbol = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']) {
		return symbol[this._date.getMonth()]  //月份
	}

	getWeekday(symbol = ['日', '一', '二', '三', '四', '五', '六']) {
		return symbol[this._date.getDay()]
	}

	getHour({ meridiem, length = 2 } = {}) {
		const h = this.get('getHours')
		const hour = meridiem ? (h > 12 ? h - 12 : h) : h

		if (`${hour}`.length < length) {
			return '0' + hour
		}
		return hour
	}

	getMeridiem() {
		const hour = this.get('getHours')
		const minute = this.get('getMinutes')

		const hm = parseInt(`${hour}` + `${minute}`)
		switch (true) {
			case hm < 600: return '凌晨'
			case hm < 900: return '早上'
			case hm < 1130: return '上午'
			case hm < 1230: return '中午'
			case hm < 1800: return '下午'
			case hm < 2400: return '晚上'
			default: return ''
		}
	}

	/* formatter */
	format(string, timezone = defaultTimezoneOffset) {
		const date = this.tz(timezone)

		return string
			.replace(/YYYY/g, date.get('getFullYear'))
			.replace(/MM/g, date.getMonth())
			.replace(/DD/g, date.get('getDate'))
			.replace(/a/g, date.getMeridiem())
			.replace(/HH/g, date.getHour())
			.replace(/hh/g, date.getHour({ meridiem: true }))
			.replace(/mm/g, date.get('getMinutes'))
	}

	calendar({ meridiem = true, timezone = defaultTimezoneOffset } = {}) {
		const copiedDateJS = DateJS.unix(this._date.getTime() / 1000).tz(timezone)

		const M = copiedDateJS.getMonth(['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'])
		const d = copiedDateJS.get('getDate')
		const h = copiedDateJS.get('getHours')
		const m = copiedDateJS.get('getMinutes')

		let monthDay = `${M}月${d}日`
		const now = new DateJS().tz(timezone)
		if (now.isSame(copiedDateJS, 'day')) {
			monthDay = '今天'
		} else if (now.add(1, 'day').isSame(copiedDateJS, 'day')) {
			monthDay = '明天'
		} else if (now.add(-1, 'day').isSame(copiedDateJS, 'day')) {
			monthDay = '昨天'
		}
		// weeks
		else if (now.isSame(copiedDateJS, 'week')) {
			monthDay = `本週${copiedDateJS.getWeekday()}`
		} else if (now.add(1, 'week').isSame(copiedDateJS, 'week')) {
			monthDay = `下週${copiedDateJS.getWeekday()}`
		} else if (now.add(-1, 'week').isSame(copiedDateJS, 'week')) {
			monthDay = `上週${copiedDateJS.getWeekday()}`
		}
		// years
		else if (now.add(-1, 'year').isSame(copiedDateJS, 'year')) {
			monthDay = `去年${M}月${d}日`
		} else if (now.isSame(copiedDateJS, 'year')) {
			monthDay = `今年${M}月${d}日`
		} else if (now.add(1, 'year').isSame(copiedDateJS, 'year')) {
			monthDay = `明年${M}月${d}日`
		} else {
			monthDay = `${copiedDateJS.get('getFullYear')}年${M}月${d}日`
		}


		const hm = meridiem ? copiedDateJS.getMeridiem() : ''
		const hour = meridiem ? (h > 12 ? h - 12 : h) : h
		const time = `${hm}${hour}點${m}分`

		return `${monthDay}${time}`
	}
}
