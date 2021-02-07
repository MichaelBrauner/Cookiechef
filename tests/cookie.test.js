import {Whisk} from "./../../js/src/Whisk";
import {Cookie} from "../src/Cookie"

let globalInstance = null

describe('Testing initialisation', () => {

    test('Can be imported', () => {
        expect(Whisk).toBeDefined()
    });

    test('Is an object (class)', () => {
        expect(Whisk).toBeInstanceOf(Object)
    })

    test('Initializes without errors', () => {
        expect(() => {
            initDefault(new Whisk())
        }).not.toThrowError()
    })

    test('Domain property initializes correctly', () => {
        let instance = new Whisk()
        initDefault(instance)

        expect(instance.settings.domain).toBe(getDomain())
    })

    test('Samesite property initializes correctly', () => {
        let instance = new Whisk()
        initDefault(instance)

        expect(instance.settings.samesite).toBe(getSameSite())
    })

    test('Secure property initializes correctly', () => {
        let instance = new Whisk()
        initDefault(instance)

        expect(instance.settings.secure).toBe(getSecure())
    })

    test('Data property initializes correctly', () => {
        let instance = new Whisk()
        initDefault(instance)

        expect(instance.$cookies).toEqual(JSON.parse(getDefaultData()))
        expect(instance.settings.defaultCookies).toEqual(JSON.parse(getDefaultData()))
    })

    test('Object gets initialized with default data', () => {
        let instance = new Whisk()
        instance.init()
    })

})

describe('Testing functionality', () => {
    beforeAll(() => {
        globalInstance = new Whisk()
        initDefault(globalInstance)
        return globalInstance
    })

    test('Cookiestore is not accepted by default', () => {
        expect(globalInstance.isStoreAccepted()).toBeFalsy()
    })

    test('Cookiestore can be accepted', () => {
        globalInstance.acceptStore()
        expect(globalInstance.isStoreAccepted()).toBeTruthy()
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

        //ensure group that group is approved/checked
        approveGroup('Statistics')
        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').checked).toBe(true)

        // afterwards group is denied
        denyGroup('Statistics')
        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').checked).toBe(false)
    })

    test('Groups get approved.', () => {

        // ensure that group is denied
        denyGroup('Statistics')
        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').checked).toBe(false)

        // afterwards group is approved
        approveGroup('Statistics')
        expect(globalInstance.$cookies.find((group) => group.name === 'Statistics').checked).toBe(true)
    })

    test('Cookie gets denied', () => {

        approveGroup('Statistics')
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

    test('Denying a group denies also all containing cookies', () => {

        approveGroup('Statistics')
        const group = globalInstance.$cookies.find((group) => group.name === 'Statistics')

        expect(group.cookies.some((cookie) => cookie.checked)).toBeTruthy()
        denyGroup('Statistics')

        expect(group.cookies.every((cookie) => !cookie.checked)).toBeTruthy()
    })

    test('Approving a group approves also all containing cookies', () => {
        const group = globalInstance.$cookies.find((group) => group.name === 'Statistics')

        denyGroup('Statistics')
        expect(group.cookies.every((cookie) => !cookie.checked)).toBeTruthy()

        approveGroup('Statistics')
        expect(group.cookies.every((cookie) => cookie.checked)).toBeTruthy()

    })

    test('Denying a cookie deletes it from the document.cookie store', () => {
        Cookie.set('google-analytics', 'test', 100)

        expect(Cookie.get('google-analytics')).toBeTruthy()
        globalInstance.deny(globalInstance.$cookies.find((group) => group.name === 'Statistics').cookies[0].name)
        expect(Cookie.get('google-analytics')).toBeFalsy()
    })

    test('Denying a Group deletes all containing cookies from the document.cookie store', () => {

        const group = globalInstance.$cookies.find((group) => group.name === 'Statistics')

        group.cookies.forEach((cookie) => {
            Cookie.set(cookie.name, cookie.description, cookie.expiry)
        })

        globalInstance.denyGroup('Statistics')

        group.cookies.forEach((cookie) => {
            expect(Cookie.get(cookie.name)).toBeFalsy()
        })
    })

    test('Cookie can only be set, if it is approved', () => {

        expect(Cookie.get('test-cookie')).toBeFalsy()

        globalInstance.setCookie('test-cookie',
            'We want to test multiple cookies.',
            'persistent');

        expect(Cookie.get('test-cookie')).toBeFalsy()
    })

    test('Cookies can be checked for approval before setting it', () => {
        expect(Cookie.get('test-cookie')).toBeFalsy()

        if (globalInstance.isApproved('test-cookie')) {
            Cookie.set('test-cookie', 'test value', 1)
        }
        expect(Cookie.get('test-cookie')).toBeFalsy()

        globalInstance.approve('test-cookie')

        if (globalInstance.isApproved('test-cookie')) {
            Cookie.set('test-cookie', 'test value', 1)
        }
        expect(Cookie.get('test-cookie')).toBeTruthy()

    })

    afterAll(() => {
        globalInstance.removeCookie('cookie-consent')
        globalInstance = null
    })
})


function initDefault(instance) {
    instance.init({
        domain: getDomain(),
        sameSite: getSameSite(),
        secure: getSecure(),
        data: getDefaultData()
    })
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
        }, {
            "expiry": "persistent",
            "name": "test-cookie",
            "description": "We want to test multiple cookies.",
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

function denyGroup(name) {
    globalInstance.denyGroup(name)
    globalInstance.refreshData()
}

function approveGroup(name) {
    globalInstance.approveGroup(name)
    globalInstance.refreshData()
}