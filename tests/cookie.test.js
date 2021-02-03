import {SunfireCookie} from "./../../js/src/SunfireCookie";

let globalInstance = null

describe('Testing initialisation', () => {

    test('Can be imported', () => {
        expect(SunfireCookie).toBeDefined()
    });

    test('Is an object (class)', () => {
        expect(SunfireCookie).toBeInstanceOf(Object)
    })

    test('Initializes without errors', () => {
        expect(() => {
            initDefault(new SunfireCookie())
        }).not.toThrowError()
    })

    test('Domain property initializes correctly', () => {
        let instance = new SunfireCookie()
        initDefault(instance)
        expect(instance.COOKIE_DOMAIN).toBe(getDomain())
    })

    test('Samesite property initializes correctly', () => {
        let instance = new SunfireCookie()
        initDefault(instance)
        expect(instance.SAME_SITE).toBe(getSameSite())
    })

    test('Secure property initializes correctly', () => {
        let instance = new SunfireCookie()
        initDefault(instance)
        expect(instance.SECURE).toBe(getSecure())
    })

    test('Data property initializes correctly', () => {
        let instance = new SunfireCookie()
        initDefault(instance)

        // expect(instance.$defaultCookies).toStrictEqual(JSON.parse(getDefaultData()))
    })

})

describe('Testing functionality', () => {
    beforeAll(() => {
        globalInstance = new SunfireCookie()
        initDefault(globalInstance)
        return globalInstance
    })

    test('Cookiestore is not accepted by default', () => {
        expect(globalInstance.acceptedStore()).toBeFalsy()
    })

    test('Cookiestore can be accepted', () => {
        globalInstance.acceptStore()
        expect(globalInstance.acceptedStore()).toBeTruthy()
    })

    test('Cookies can be fetched', () => {
        expect(globalInstance.$cookies).toBeInstanceOf(Object)
    })

    test('Cookiestore can be refreshed.', () => {
        const startStore = globalInstance.$cookies
        expect(globalInstance.refreshData()).toBeInstanceOf(Object)
        expect(globalInstance.refreshData()).toStrictEqual(startStore)
    })

    test('Groups get denied.', () => {

        // group is approved/checked
        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').checked).toBe(true)
        globalInstance.denyGroup('Statistics')
        globalInstance.refreshData()

        // afterwards group is denied
        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').checked).toBe(false)
    })

    test('Groups get approved.', () => {
        globalInstance.denyGroup('Statistics')
        globalInstance.refreshData()

        // group is denied
        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').checked).toBe(false)
        globalInstance.approveGroup('Statistics')
        globalInstance.refreshData()

        // afterwards group is approved
        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').checked).toBe(true)
    })

    test('Cookie gets denied', () => {
        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').cookies[0].checked)
            .toBe(true)

        globalInstance.deny(globalInstance.$cookies.find((group) => group.name === 'Statistics').cookies[0].name)
        globalInstance.refreshData()

        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').cookies[0].checked)
            .toBe(false)
    })

    test('Cookie gets approved', () => {
        globalInstance.deny(globalInstance.$cookies.find((group) => group.name === 'Statistics').cookies[0].name)
        globalInstance.refreshData()

        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').cookies[0].checked)
            .toBe(false)

        globalInstance.approve(globalInstance.$cookies.find((group) => group.name === 'Statistics').cookies[0].name)
        globalInstance.refreshData()

        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').cookies[0].checked)
            .toBe(true)
    })

    test('Denying a group denies also all containing cookies',() => {

        const group = globalInstance.$cookies.find((group) => group.name === 'Statistics')

        expect(group.cookies.some((cookie) => cookie.checked)).toBeTruthy()

        globalInstance.denyGroup('Statistics')
        globalInstance.refreshData()

        expect(group.cookies.every((cookie) => !cookie.checked)).toBeTruthy()
    })

    test('Approving a group approves also all containing cookies',() => {
        const group = globalInstance.$cookies.find((group) => group.name === 'Statistics')

        globalInstance.denyGroup('Statistics')
        globalInstance.refreshData()
        expect(group.cookies.every((cookie) => !cookie.checked)).toBeTruthy()

        globalInstance.approveGroup('Statistics')
        globalInstance.refreshData()
        expect(group.cookies.every((cookie) => cookie.checked)).toBeTruthy()

    })

    test('Denying a cookie deletes it from the cookie store', () => {
        //rockme: Denying a cookie deletes it from the cookie store
    })

    test('Denying a Group deletes all cookies from the cookie store', () => {
        //rockme: Test - denying a group deletes all cookies from the cookie store
    })

    afterAll(()=> {
        globalInstance.removeCookie('cookie-consent')
        globalInstance = null
    })
})


function initDefault(instance) {
    instance.init(
        getDomain(),
        getSameSite(),
        getSecure(),
        getDefaultData()
    )
}

function getDefaultData() {
    return JSON.stringify([{
        "name": "Necessary",
        "description": "sun-cookie::text.necessary.message",
        "required": true,
        "checked": true,
        "cookies": [{
            "expiry": "persistent",
            "name": "session",
            "description": "This is just for authentication.",
            "required": true,
            "checked": true
        }]
    }, {
        "name": "Marketing",
        "description": "sun-cookie::text.marketing.message",
        "required": false,
        "checked": false,
        "cookies": []
    }, {
        "name": "Statistics",
        "description": "sun-cookie::text.statistics.message",
        "required": false,
        "checked": false,
        "cookies": [{
            "expiry": "persistent",
            "name": "google-analytics",
            "description": "We want to see, that u like this site and where you come from.",
            "required": false,
            "checked": false
        }]
    }])
}

function getDomain() {
    return 'localhost'
}

function getSameSite() {
    return 'lax'
}

function getSecure() {
    return ''
}