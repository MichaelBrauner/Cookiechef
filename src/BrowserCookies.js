export class BrowserCookies {

    static get allCookies() {

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

    static getCookie(name) {
        return this.allCookies[name]
    }

    static cookieExists(name) {
        return this.allCookies().hasOwnProperty(name);
    }

    static cookieHasValue(name, value) {
        if (!this.cookieExists(name)) {
            return false
        }

        let $cookies = this.allCookies();

        return $cookies[name] == value
    }

}