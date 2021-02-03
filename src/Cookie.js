export class Cookie {

    static setCookie(name, value, expirationInDays, sameSite, secure) {
        const date = new Date();
        date.setTime(date.getTime() + (expirationInDays * 24 * 60 * 60 * 1000));

        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/${secure ?? ''}${sameSite ? ';samesite=' + sameSite : '' }`
    }

    static removeCookie(cookie) {
        if (cookie instanceof Array) {
            cookie.forEach((cookie) => {
                this.setCookie(cookie, '', -1)
            })
        } else {
            this.setCookie(cookie, '', -1)
        }
    }

}