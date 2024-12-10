module.exports = {
    safeParseJSON: (str, def = []) => {
        try {
            return JSON.parse(str)
        } catch (err) {
            return def
        }
    }
}