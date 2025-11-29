export class Timestamp {
    static SERVER_TIMEZONE = 'GMT';

    static TIME_12H_PATTERN = /^(0?[1-9]|(1[0-2]))(:[0-5][0-9])? ?(am|a\.m\.|pm|p\.m\.)$/i;
    static TIME_24H_PATTERN = /^(0?[1-9]|(1[0-9])|(2[0-3]))(:[0-5][0-9])?$/;

    static DAY_PERIOD_SUFFIXES = [
        { dayPeriod: 'am', regex: / ?am$/ },
        { dayPeriod: 'pm', regex: / ?pm$/ },
        { dayPeriod: 'am', regex: / ?a\.m\.$/ },
        { dayPeriod: 'pm', regex: / ?p\.m\.$/ },
    ];

    //constructor(tz, ts = null) {
    constructor(timezone, dateValue) {
        // Set locales
        this.locales = 'en-US';

        // Check if we have a timezone
        if (!timezone) {
            timezone = Timestamp.SERVER_TIMEZONE;
        }

        // Parse the date
        //const serverDate = (dateValue ? new Date(dateValue) : new Date());

        let serverDate = dateValue ? new Date(dateValue) : new Date();

        // Validate the provided timestamp
        // This works because getTime() returns NaN when the date is invalid, NaN is always not equal to NaN
        if (serverDate.getTime() != serverDate.getTime() || serverDate == 'Invalid Date') {
            throw new Error(`Invalid date: ${dateValue}`);
        }

        // Validate the timezone (TODO - Figure out how to do this)
        if (!Timestamp.timezoneIsValid(timezone)) {
            throw new RangeError(`Invalid time zone: ${timezone}`);
        }

        const shortOrLong = 'short';
        const options = {
            weekday: shortOrLong, // narrow, short, long
            month: shortOrLong, // numeric, 2-digit, narrow, short, long
            day: 'numeric', // numeric, 2-digit
            hour: 'numeric', // numeric, 2-digit
            minute: 'numeric', // numeric, 2-digit
            dayPeriod: 'short', // narrow, short, long
            timeZoneName: 'long', // short, long
            timeZone: timezone,
        };
        const serverOptions = Object.assign({}, options);
        serverOptions.timeZone = 'GMT';

        const offsetDate = new Date(
            serverDate.toLocaleString(this.locales, { timeZone: timezone })
        );
        const offsetHours =
            Math.round((serverDate.getTime() - offsetDate.getTime()) / (1000 * 60)) / 60;
        const shiftedDate = new Date(serverDate);

        if (dateValue && typeof dateValue == 'string') {
            shiftedDate.setHours(shiftedDate.getHours() + offsetHours);
        }

        //const serverDisplayDatetime  = new Intl.DateTimeFormat('en-UK', serverOptions).format(shiftedDate);
        //const shiftedDisplayDatetime = new Intl.DateTimeFormat('en-US',       options).format(shiftedDate);

        this.ts = shiftedDate;
        this.tz = timezone;
    }

    // *********** //
    // * Getters * //
    // *********** //

    get ts() {
        return this.timestampValue;
    }

    get tz() {
        return this.timeZoneValue;
    }

    // *********** //
    // * Setters * //
    // *********** //

    set ts(value) {
        this.timestampValue = value;
    }

    set tz(value) {
        if (value != null && !Timestamp.timezoneIsValid(value)) {
            throw new Error('Invalid time zone');
        }
        this.timeZoneValue = value;
    }

    // ***************** //
    // * Class Methods * //
    // ***************** //

    static now(timezone) {
        let timestamp = new Timestamp(timezone);

        //if (timezone) {
        //    timestamp = timestamp.convertToTimezone(timezone);
        //}

        return timestamp;
    }

    static today(timezone) {
        let timestamp = new Timestamp(timezone);

        //if (timezone) {
        //    timestamp = timestamp.convertToTimezone(timezone);
        //}

        return timestamp;
    }

    static timezoneIsValid(tz) {
        if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
            throw 'Time zones are not available in this environment';
        }

        try {
            Intl.DateTimeFormat(this.locales, { timeZone: tz });
            return true;
        } catch (error) {
            return false;
        }
    }

    static timeIsValid(timeString) {
        return (
            timeString.match(Timestamp.TIME_12H_PATTERN) ||
            timeString.match(Timestamp.TIME_24H_PATTERN)
        );
    }

    static parse(dateString, timeString, timezone) {
        if (!Timestamp.timeIsValid(timeString)) {
            throw new RangeError(`Invalid time: ${timeString}`);
        }

        if (!Timestamp.timezoneIsValid(timezone)) {
            throw new RangeError(`Invalid timezone: ${timezone}`);
        }

        // Prepare the time string
        timeString = timeString.toLowerCase().trim();

        // Define the parts
        let hours;
        let minutes = '00';
        let dayPeriod = '';

        // Parse the day period
        for (let d = 0; d < Timestamp.DAY_PERIOD_SUFFIXES.length; d++) {
            const dayPeriodSuffix = Timestamp.DAY_PERIOD_SUFFIXES[d];

            if (timeString.match(dayPeriodSuffix.regex)) {
                dayPeriod = dayPeriodSuffix.dayPeriod;
                timeString = timeString.replace(dayPeriodSuffix.regex, '').trim();
                break;
            }
        }

        // Parse the hours and minutes
        const parts = timeString.split(':');

        hours = parts[0];
        if (parts.length == 2) {
            minutes = parts[1];
        }

        const dateTimeString = `${dateString} ${hours}:${minutes} ${dayPeriod}`;
        return new Timestamp(timezone, dateTimeString);
    }

    // **************************************** //
    // * Instance Methods - DateTime addition * //
    // **************************************** //

    add(delta) {
        let date = new Date(this.ts);

        const years = delta.years ? delta.years : 0;
        const months = delta.months ? delta.months : 0;
        const days = delta.days ? delta.days : 0;
        const hours = delta.hours ? delta.hours : 0;
        const minutes = delta.minutes ? delta.minutes : 0;
        const seconds = delta.seconds ? delta.seconds : 0;
        const ms = delta.ms ? delta.ms : 0;

        date.setFullYear(date.getFullYear() + years);
        date.setMonth(date.getMonth() + months);
        date.setDate(date.getDate() + days);
        date.setHours(
            date.getHours() + hours,
            date.getMinutes() + minutes,
            date.getSeconds() + seconds,
            date.getMilliseconds() + ms
        );

        return new Timestamp(this.tz, date);
    }

    addDays(days) {
        return this.add({ days: days });
    }

    daysUntil(timestamp = new Timestamp(this.tz)) {
        const timeDiff = this.ts.getTime() - timestamp.ts.getTime();
        return timeDiff / (1000.0 * 3600.0 * 24.0);
    }

    // *************************************************** //
    // * Instance Methods - Get a part of this timestamp * //
    // *************************************************** //

    getYear = (timezone) => parseInt(this.format24hour({ year: 'numeric' }, timezone));
    getMonth = (timezone) => parseInt(this.format24hour({ month: 'numeric' }, timezone));
    getMonthDay = (timezone) => parseInt(this.format24hour({ day: 'numeric' }, timezone));
    getHour = (timezone) => parseInt(this.format24hour({ hour: 'numeric' }, timezone));
    getMinute = (timezone) => parseInt(this.format24hour({ minute: 'numeric' }, timezone));
    getSecond = (timezone) => parseInt(this.format24hour({ second: 'numeric' }, timezone));
    getMillisec = (timezone) =>
        parseInt(this.format24hour({ fractionalSecondDigits: 3 }, timezone));

    // Get the date alone
    getDate = (timezone) => new Date(this.getLogDate(timezone));

    // ****************************************** //
    // * Instance Methods - DateTime formatting * //
    // ****************************************** //

    format(options = {}, timezone = this.tz) {
        if (!options.timeZone) {
            options.timeZone = timezone;
        }
        return new Intl.DateTimeFormat(this.locales, options).format(this.ts);
    }

    format24hour(options = {}, timezone = this.tz) {
        if (!options.timeZone) {
            options.timeZone = timezone;
        }
        return new Intl.DateTimeFormat('en-UK', options).format(this.ts);
    }

    formatToParts(timezone = this.tz) {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            fractionalSecondDigits: 3,
            hour12: true,
            timeZone: timezone,
            timeZoneName: 'short',
        };

        if (this.tz != null) options.timeZone = this.tz;
        return new Intl.DateTimeFormat(this.locales, options).formatToParts(this.ts);
    }

    getWeekdayName(shortOrLong = 'long') {
        return this.format({
            weekday: shortOrLong, // narrow, short, long
        });
    }

    getDayPeriod() {
        const tsParts = this.formatToParts();
        const dayPeriod = tsParts.find((element) => element.type == 'dayPeriod').value;
        return dayPeriod;
    }

    getTimezoneName() {
        const tsParts = this.formatToParts();
        const timeZoneName = tsParts.find((element) => element.type == 'timeZoneName').value;
        return timeZoneName;
    }

    getEventDisplayDateTime(shortOrLong = 'long', timezone) {
        return this.format(
            {
                weekday: shortOrLong, // narrow, short, long
                month: shortOrLong, // numeric, 2-digit, narrow, short, long
                day: 'numeric', // numeric, 2-digit
                hour: 'numeric', // numeric, 2-digit
                minute: 'numeric', // numeric, 2-digit
                dayPeriod: 'short', // narrow, short, long
                timeZoneName: shortOrLong, // short, long
            },
            timezone
        );
    }

    getEventDisplayDate(shortOrLong = 'long', timezone) {
        return this.format(
            {
                weekday: shortOrLong, // narrow, short, long
                month: shortOrLong, // numeric, 2-digit, narrow, short, long
                day: 'numeric', // numeric, 2-digit
            },
            timezone
        );
    }

    getEventDisplayTime(shortOrLong = 'long', timezone) {
        return this.format(
            {
                hour: 'numeric', // numeric, 2-digit
                minute: 'numeric', // numeric, 2-digit
                dayPeriod: 'short', // narrow, short, long
                timeZoneName: shortOrLong, // short, long
            },
            timezone
        );
    }

    getEventDate() {
        const year = this.getYear();
        const month = `${this.getMonth()}`.padStart(2, '0');
        const day = `${this.getMonthDay()}`.padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    getEventTime(timezone) {
        return this.format(
            {
                hour: 'numeric', // numeric, 2-digit
                minute: 'numeric', // numeric, 2-digit
                dayPeriod: 'short', // narrow, short, long
                timeZone: this.tz,
            },
            timezone
        );
    }

    getLogDate(timezone) {
        const year = this.getYear(timezone);
        const month = `${this.getMonth(timezone)}`.padStart(2, '0');
        const day = `${this.getMonthDay(timezone)}`.padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    getLocalTime(options = {}) {
        options.timeZone = this.tz;
        return new Intl.DateTimeFormat(this.locales, options).format(this.ts);
    }
}
