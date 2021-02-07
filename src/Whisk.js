import 'regenerator-runtime/runtime'
import {Cookie} from "./Cookie";
import {Encoder} from "./Encoder";
import {isEmpty} from "lodash";

export class Whisk {

    #COOKIE_CHECKED_VALUE = 1
    #COOKIE_DOMAIN
    #SAME_SITE
    #COOKIE_NAME = 'cookie-consent'
    #SECURE

    #secureDefault = ''
    #sameSiteDefault = 'lax'
    #cookiesDefault = JSON.stringify([])

    #BASIC_STORE = {
        'consents_approved': [],
        'consents_denied': [],
        'accepted': false
    }

    #$cookieStore
    #$defaultCookies

    constructor() {
        this.#$cookieStore = this.#BASIC_STORE
        this.$cookies = null
    }

    approve(data) {
        this.#createBasicStore()

        if (data instanceof Array) {

            this.#$cookieStore.consents_denied = this.#$cookieStore.consents_denied.filter((cookie) => {
                return !data.includes(cookie)
            })

            data.forEach((cookie) => {
                !this.isApproved(cookie) && this.#$cookieStore.consents_approved.push(cookie)
            })

        } else {

            this.#$cookieStore.consents_denied = this.#$cookieStore.consents_denied.filter((cookie) => {
                return cookie !== data
            })

            this.#$cookieStore.consents_approved.push(data)
        }

        this.#save()
    }

    deny(data) {
        this.#createBasicStore()

        if (data instanceof Array) {
            this.#$cookieStore.consents_approved = this.#$cookieStore.consents_approved.filter((cookie) => {
                return !data.includes(cookie)
            })

            data.forEach((cookie) => {
                !this.isDenied(cookie) && this.#$cookieStore.consents_denied.push(cookie)
            })
        } else {

            this.#$cookieStore.consents_approved = this.#$cookieStore.consents_approved.filter((cookie) => {
                return cookie !== data
            })

            this.#$cookieStore.consents_denied.push(data)
        }

        Cookie.remove(data)

        this.#save()
    }

    approveGroup(name) {
        this.#createBasicStore()
        this.approve(this.#getCookiesOfGroup(name))
    }

    denyGroup(name) {
        this.#createBasicStore()
        this.deny(this.#getCookiesOfGroup(name))
        this.#removeAllCookiesOfGroup(name)
    }

    isApproved(name) {
        return this.#$cookieStore.consents_approved.indexOf(name) !== -1
    }

    isDenied(name) {
        return this.#$cookieStore.consents_denied.indexOf(name) !== -1
    }

    isStoreAccepted() {
        return this.#$cookieStore && this.#$cookieStore.accepted
    }

    acceptStore() {
        this.#createBasicStore()

        this.#$cookieStore.accepted = true
        this.#save()
    }

    refreshData() {
        this.#fetchCookieStore()
        this.$cookies = this.#vote()
        return this.$cookies
    }

    setCookie(name, value, expirationInDays) {
        if (!this.isApproved(name)) {
            return false
        }

        Cookie.set(name, value, expirationInDays)
    }

    get settings() {
        return {
            'domain': this.#COOKIE_DOMAIN,
            'samesite': this.#SAME_SITE,
            'secure': this.#SECURE,
            'defaultCookies': this.#$defaultCookies
        }
    }

    #getCookiesOfGroup(name) {
        const group = this.$cookies.find((cookie) => {
            return cookie.name === name
        })

        return group.cookies.map((cookie) => {
            return cookie.name
        })
    }

    #removeAllCookiesOfGroup(name) {
        Cookie.remove(
            this.#getCookiesOfGroup(name)
        )
    }

    #createBasicStore() {

        if (!this.#$cookieStore) {
            this.#$cookieStore = this.#BASIC_STORE
            this.#save()
            return this.#$cookieStore
        }

        return false
    }

    #getGroup(name) {
        return this.$cookies && this.$cookies.find((group) => group.name === name)
    }

    #groupCheck(name) {
        if (this.#getGroup(name) && this.#getGroup(name).required) {
            return true
        }
        if (this.#isGroupChecked(name)) {
            return true
        }

        if (this.#allCookiesOfGroupUntouched(name)) {
            return this.#getDefaultOfGroup(name)
        }

        return false
    }

    #cookieCheck(name) {

        const group = this.#getBaseGroupOfCookie(name)

        const cookie = group && group.cookies.find((cookie) => cookie.name === name)

        if (!group) {
            return false
        }

        if (group.required || cookie.required) {
            return true
        }

        if (this.#isGroupChecked(group.name)) {
            return true
        }

        if (this.isApproved(name)) {
            return true
        }

        return false
    }

    #getBaseGroupOfCookie(name) {
        return this.$cookies && this.$cookies.find((group) => {
            return group.cookies.find((cookie) => cookie.name === name)
        })
    }

    #getDefaultOfGroup(name) {

        const group = this.#$defaultCookies.find((group) => group.name === name)

        return group.checked;
    }

    #isGroupChecked(name) {
        return (this.#noCookiesOfGroupDenied(name) && this.isStoreAccepted())
            || this.#allCookiesOfGroupApproved(name)
    }

    #allCookiesOfGroupUntouched(name) {
        return this.#getGroup(name).cookies.some((cookie) => {
            if (this.isApproved(cookie.name) && this.isDenied(cookie.name)) {
                return false
            }
        })
    }


    #noCookiesOfGroupDenied(name) {
        return this.#getGroup(name) && !this.#getGroup(name).cookies.some((cookie) => {
            if (this.isDenied(cookie.name)) {
                return true
            }
        })

    }

    #allCookiesOfGroupApproved(name) {
        const group = this.#getGroup(name)

        return group && !isEmpty(group.cookies) && group.cookies.every((cookie) => {
            return this.isApproved(cookie.name)
        })
    }


    init(options) {

        if (!options) {

            this.#initializeDefaults()

        } else {
            this.#COOKIE_DOMAIN = options.domain ?? window.location.origin
            this.#SAME_SITE = options.sameSite ?? this.#sameSiteDefault
            this.#SECURE = options.secure ?? this.#secureDefault
            const values = options.data ?? this.#cookiesDefault
            this.#$defaultCookies = JSON.parse(values)
            this.$cookies = JSON.parse(values)
        }


        this.#initData()
    }

    #initializeDefaults() {
        this.#COOKIE_DOMAIN = window.location.origin
        this.#SAME_SITE = this.#sameSiteDefault
        this.#SECURE = this.#secureDefault
        this.#$defaultCookies = JSON.parse(this.#cookiesDefault)
        this.$cookies = JSON.parse(this.#cookiesDefault)
    }

    #save() {
        Cookie.set(
            this.#COOKIE_NAME,
            Encoder.encode(this.#$cookieStore),
            1,
            this.#SAME_SITE,
            this.#SECURE)
    }

    #fetchCookieStore() {
        const savedStore = Encoder.decode(Cookie.get(this.#COOKIE_NAME))

        if (savedStore) {
            this.#$cookieStore = savedStore
        } else {
            this.#createBasicStore()
        }

    }

    #initData() {

        this.#fetchCookieStore()

        this.$cookies = this.#vote()

        return this.#$defaultCookies
    }

    #vote() {

        return this.#$defaultCookies.map((group) => {

            group.checked = this.#groupCheck(group.name)

            group.cookies.map((cookie) => {
                cookie.checked = this.#cookieCheck(cookie.name)
            })

            return group
        })
    }
}