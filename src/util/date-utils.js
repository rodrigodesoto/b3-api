"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = exports.DateAddType = exports.hoursToMillis = exports.minutesToMillis = exports.secondsToMillis = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.tz.setDefault('America/Sao_Paulo');
const secondsToMillis = (seconds) => {
    if (!seconds) {
        return 0;
    }
    return seconds * 1000;
};
exports.secondsToMillis = secondsToMillis;
const minutesToMillis = (minutes) => {
    return (0, exports.secondsToMillis)((minutes || 0) * 60);
};
exports.minutesToMillis = minutesToMillis;
const hoursToMillis = (hours) => {
    return (0, exports.minutesToMillis)((hours || 0) * 60);
};
exports.hoursToMillis = hoursToMillis;
var DateAddType;
(function (DateAddType) {
    DateAddType["YEAR"] = "YEAR";
    DateAddType["MONTH"] = "MONTH";
    DateAddType["DAY"] = "DAY";
    DateAddType["HOUR"] = "HOUR";
    DateAddType["MINUTE"] = "MINUTE";
    DateAddType["SECOND"] = "SECOND";
    DateAddType["MILLISECOND"] = "MILLISECOND";
})(DateAddType = exports.DateAddType || (exports.DateAddType = {}));
exports.DateUtils = {
    dateAddYear(date, amount) {
        return exports.DateUtils.dateAdd(date, amount, DateAddType.YEAR);
    },
    dateAddMonth(date, amount) {
        return exports.DateUtils.dateAdd(date, amount, DateAddType.MONTH);
    },
    dateAddDay(date, amount) {
        return exports.DateUtils.dateAdd(date, amount, DateAddType.DAY);
    },
    dateAddHour(date, amount) {
        return exports.DateUtils.dateAdd(date, amount, DateAddType.HOUR);
    },
    dateAddMinute(date, amount) {
        return exports.DateUtils.dateAdd(date, amount, DateAddType.MINUTE);
    },
    dateAddSecond(date, amount) {
        return exports.DateUtils.dateAdd(date, amount, DateAddType.SECOND);
    },
    dateAddMillisecond(date, amount) {
        return exports.DateUtils.dateAdd(date, amount, DateAddType.MILLISECOND);
    },
    dateAdd(date, amount, field) {
        if ((!date) || (!amount)) {
            return date;
        }
        if (!field) {
            throw new error_1.ServerError('DateUtils.dateAdd', 'Missing field parameter');
        }
        const dataOp = new Date(date);
        switch (field) {
            case DateAddType.YEAR:
                dataOp.setFullYear(dataOp.getFullYear() + amount);
                break;
            case DateAddType.MONTH:
                dataOp.setMonth(dataOp.getMonth() + amount);
                break;
            case DateAddType.DAY:
                dataOp.setDate(dataOp.getDate() + amount);
                break;
            case DateAddType.HOUR:
                dataOp.setHours(dataOp.getHours() + amount);
                break;
            case DateAddType.MINUTE:
                dataOp.setMinutes(dataOp.getMinutes() + amount);
                break;
            case DateAddType.SECOND:
                dataOp.setSeconds(dataOp.getSeconds() + amount);
                break;
            case DateAddType.MILLISECOND:
                dataOp.setMilliseconds(dataOp.getMilliseconds() + amount);
                break;
        }
        return new Date(dataOp);
    },
    format(data, format) {
        if (!data) {
            data = new Date();
        }
        return (0, dayjs_1.default)(data).format(format);
    },
    dateHourToMillisString(date) {
        if (!date) {
            date = new Date();
        }
        return (0, dayjs_1.default)(date).format('HH:mm:ss.SSS+Z');
    },
    dateToStringAno(data) {
        if (!data) {
            data = new Date();
        }
        return (0, dayjs_1.default)(data).format('DD/MM/YYYY');
    },
    dateToStringYear(data) {
        if (!data) {
            data = new Date();
        }
        return (0, dayjs_1.default)(data).format('YYYY-MM-DD');
    },
    dateToStringMinutos(data) {
        if (!data) {
            data = new Date();
        }
        return (0, dayjs_1.default)(data).format('DD/MM/YYYY HH:mm');
    },
    dateToStringSegundos(data) {
        if (!data) {
            data = new Date();
        }
        return (0, dayjs_1.default)(data).format('DD/MM/YYYY HH:mm:ss');
    },
    setDateMinTime(date = new Date()) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    },
    setDateNoonTime(date = new Date()) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
    },
    setDateMaxTime(date = new Date()) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    },
    convertAnyToDate(dateAny) {
        if (!dateAny) {
            return null;
        }
        let dateString;
        if (dateAny instanceof Date) {
            return new Date(dateAny);
        }
        else if (typeof dateAny === 'number') {
            return new Date(dateAny);
        }
        else {
            dateString = String(dateAny);
        }
        const patterns = [
            /^(?<day>\d{1,2})\/(?<month>\d{1,2})\/(?<year>\d{4})$/,
            /^(?<day>\d{1,2})-(?<month>\d{1,2})-(?<year>\d{4})$/,
            /^(?<day>\d{1,2})\.(?<month>\d{1,2})\.(?<year>\d{4})$/,
            /^(?<year>\d{4})\/(?<month>\d{1,2})\/(?<day>\d{1,2})$/,
            /^(?<year>\d{4})-(?<month>\d{1,2})-(?<day>\d{1,2})$/,
            /^(?<year>\d{4})\.(?<month>\d{1,2})\.(?<day>\d{1,2})$/
        ];
        let dayJsString;
        for (const pattern of patterns) {
            const match = dateString.match(pattern);
            if (match === null || match === void 0 ? void 0 : match.groups) {
                const { day, month, year } = match.groups;
                dayJsString = year.concat('-').concat(month).concat('-').concat(day);
                break;
            }
        }
        if (!dayJsString) {
            return null;
        }
        const data = (0, dayjs_1.default)(dayJsString);
        if (!data.isValid()) {
            return null;
        }
        return data.toDate();
    },
    isBefore(date, dateToCompare) {
        return (date === null || date === void 0 ? void 0 : date.getTime()) < (dateToCompare === null || dateToCompare === void 0 ? void 0 : dateToCompare.getTime());
    },
    isAfter(date, dateToCompare) {
        return (date === null || date === void 0 ? void 0 : date.getTime()) > (dateToCompare === null || dateToCompare === void 0 ? void 0 : dateToCompare.getTime());
    }
};
//# sourceMappingURL=date-utils.js.map
