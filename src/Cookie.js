
export class Cookie {

    static set(name, value, expirationInDays, sameSite, secure) {

        const date = new Date();
        date.setTime(date.getTime() + (expirationInDays * 24 * 60 * 60 * 1000));

        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/${secure ?? ''}${sameSite ? ';samesite=' + sameSite : '' }`
    }

    static remove(cookie) {
        if (cookie instanceof Array) {
            cookie.forEach((cookie) => {
                this.set(cookie, '', -1)
            })
        } else {
            this.set(cookie, '', -1)
        }
    }

    static get all() {

        let cookies = {};

        if (document.cookie && document.cookie != '') {
            let split = document.cookie.split(';');
            for (let i = 0; i < split.length; i++) {
                let name_value = split[i].split("=");
                cookies[name_value[0].trim()] = name_value[1].trim();
            }
        }

        return cookies;
    }

    static get(name) {
        return this.all[name]
    }

    static exists(name) {
        return this.all().hasOwnProperty(name);
    }

    static hasValue(name, value) {
        if (!this.exists(name)) {
            return false
        }

        let $cookies = this.all();

        return $cookies[name] == value
    }


}