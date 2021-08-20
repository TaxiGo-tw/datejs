const MockDate = require('mockdate')
const DateJS = require('..')

describe('test date js', function () {
	beforeEach(() => {
		// '2021-06-17 00:00'
		MockDate.set(1623888000000)
	})

	it('format', () => {
		function testFormat(time, format, toBe) {
			expect(DateJS.string(time).format(format)).toBe(toBe)
		}

		testFormat('2021-06-16 00:50', 'YYYY/MM月DD日 ahh:mm', '2021/06月16日 早上08:50')
		testFormat('2021-03-19 12:10', 'MM月DD日 ahh:mm', '03月19日 晚上08:10')
		testFormat('2021-03-19 12:10', 'MM月DD日 aHH:mm', '03月19日 晚上20:10')
		testFormat('2021-03-19 12:10', 'MM月DD日 HH:mm', '03月19日 20:10')
	})

	it('昨天今天明天', () => {
		compareDateJS('2021-06-16 00:50', '昨天早上08點50分')
		compareDateJS('2021-06-17 00:50', '今天早上08點50分')
		compareDateJS('2021-06-17 23:50', '明天早上07點50分')

		compareDateJSUnix(1623804600, '昨天早上08點50分')
		compareDateJSUnix(1623891000, '今天早上08點50分')
		compareDateJSUnix(1623973800, '明天早上07點50分')
	})

	it('上週本週下週', () => {
		compareDateJS('2021-06-11 23:50', '上週六早上07點50分')
		compareDateJS('2021-06-18 23:50', '本週六早上07點50分')
		compareDateJS('2021-06-19 23:50', '下週日早上07點50分')

		compareDateJSUnix(1623455400, '上週六早上07點50分')
		compareDateJSUnix(1624060200, '本週六早上07點50分')
		compareDateJSUnix(1624146600, '下週日早上07點50分')
	})

	it('去年今年明年', () => {
		compareDateJS('2020-12-31 15:59', '去年十二月31日晚上11點59分')
		compareDateJS('2021-12-31 15:59', '今年十二月31日晚上11點59分')
		compareDateJSUnix(1609430340, '去年十二月31日晚上11點59分')
		compareDateJSUnix(1640966340, '今年十二月31日晚上11點59分')

		compareDateJS('2020-01-01 00:00', '去年一月01日早上08點00分')
		compareDateJS('2021-06-29 17:00', '今年六月30日凌晨01點00分')
		compareDateJS('2022-12-30 17:00', '明年十二月31日凌晨01點00分')

		compareDateJSUnix(1577840400, '去年一月01日上午09點00分')
		compareDateJSUnix(1625014800, '今年六月30日上午09點00分')
		compareDateJSUnix(1672448400, '明年十二月31日上午09點00分')
	})

	it('其他日', () => {
		compareDateJS('2018-12-31 17:00', '2019年一月01日凌晨01點00分')
		compareDateJS('2024-12-31 17:00', '2025年一月01日凌晨01點00分')

		compareDateJSUnix(1546275600, '2019年一月01日凌晨01點00分')
		compareDateJSUnix(1735664400, '2025年一月01日凌晨01點00分')
	})

	afterEach(() => {
		MockDate.reset()
	})
})

function compareDateJS(time, toBe) {
	const x = DateJS.string(time).calendar()
	expect(x).toBe(toBe)
}

function compareDateJSUnix(time, toBe) {
	const x = DateJS.unix(time).calendar()
	expect(x).toBe(toBe)
}
