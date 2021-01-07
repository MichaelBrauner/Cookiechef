export class Encoder {

    static encode(value) {
        return value !== undefined && encodeURIComponent(JSON.stringify(value))
    }

    static decode(value) {
        return value !== undefined && JSON.parse(decodeURIComponent(value))
    }

}