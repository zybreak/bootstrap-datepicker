/* ===========================================================
 * bootstrap-datepicker.js
 * http://github.com/zybreak/bootstrap-datepicker
 * ===========================================================
 *
 * Contributed by Scott Torborg - github.com/storborg
 * Loosely based on jquery.date_input.js by Jon Leighton, heavily updated and
 * rewritten to match bootstrap javascript approach and add UI features.
 * =========================================================== */


!function ($) {

    var selector = '[data-datepicker]',
        all = [];

    function clearDatePickers(except) {
        var ii;
        for (ii = 0; ii < all.length; ii++) {
            if (all[ii] !== except) {
                all[ii].hide();
            }
        }
    }

    function DatePicker(element, options) {
        this.$el = $(element);
        this.proxy('show').proxy('ahead').proxy('hide').proxy('keyHandler').proxy('selectDate');

        options = $.extend({}, $.fn.datepicker.defaults, options);

        if ((!!options.parse) || (!!options.format) || !this.detectNative()) {
            $.extend(this, options);
            this.$el.data('datepicker', this);
            all.push(this);
            this.init();
        }
    }

    DatePicker.prototype = {

        detectNative: function (el) {
            // Attempt to activate the native datepicker, if there is a known good
            // one. If successful, return true. Note that input type="date"
            // requires that the string be RFC3339, so if the format/parse methods
            // have been overridden, this won't be used.
            if (navigator.userAgent.match(/(iPod|iPad|iPhone); CPU(\ iPhone)? OS 5_\d/i)) {
                // jQuery will only change the input type of a detached element.
                var $marker = $('<span>').insertBefore(this.$el);
                this.$el.detach().attr('type', 'date').insertAfter($marker);
                $marker.remove();
                return true;
            }
            return false;
        },
        init: function () {
            var $months = this.nav('months', 1),
                $years = this.nav('years', 12),
                $nav = $('<div>').addClass('nav').append($months, $years),
                $calendar = $("<div>").addClass('calendar'),
                i;

            // If the limit param is a Date obj, convert to an int offset in milliseconds. 
            if(Object.prototype.toString.call(this.limit) === '[object Date]') {
              var today = new Date();
              this.limit = this.limit.getTime() - today.getTime();
            }

            this.$month = $('.name', $months);
            this.$year = $('.name', $years);

            // Populate day of week headers, realigned by startOfWeek.
            for (i = 0; i < this.shortDayNames.length; i++) {
                $calendar.append('<div class="dow">' + this.shortDayNames[(i + this.startOfWeek) % 7] + '</div>');
            }

            this.$days = $('<div>').addClass('days');
            $calendar.append(this.$days);

            this.$picker = $('<div>')
                .click(function (e) {
                    e.stopPropagation();
                })
                // Use this to prevent accidental text selection.
                .mousedown(function (e) {
                    e.preventDefault();
                })
                .addClass('datepicker')
                .append($nav, $calendar)
                .insertAfter(this.$el);

            this.$el
                .focus(this.show)
                .click(this.show)
                .change($.proxy(function () {
                    this.selectDate();
                }, this));

            this.selectDate();
            this.hide();
        },
        nav: function (c, months) {
            var $subnav = $('<div>' +
                '<span class="prev button">&larr;</span>' +
                '<span class="name"></span>' +
                '<span class="next button">&rarr;</span>' +
                '</div>').addClass(c);
            $('.prev', $subnav).click($.proxy(function () {
                this.ahead(-months, 0);
            }, this));
            $('.next', $subnav).click($.proxy(function () {
                this.ahead(months, 0);
            }, this));

            return $subnav;
        },
        updateName: function ($area, s) {
            // Update either the month or year field, with a background flash
            // animation.
            var cur = $area.find('.fg').text(),
                $fg = $('<div>').addClass('fg').append(s),
                $bg = $('<div>').addClass('bg');

            $area.empty();
            if (cur !== s) {
                $area.append($bg, $fg);
                $bg.fadeOut('slow', function () {
                    $(this).remove();
                });
            } else {
                $area.append($fg);
            }
        },
        selectMonth: function (date) {
            var newMonth = new Date(date.getFullYear(), date.getMonth(), 1),
                rangeStart = this.rangeStart(date),
                rangeEnd = this.rangeEnd(date),
                num_days = this.daysBetween(rangeStart, rangeEnd),
                ii,
                today = new Date();

                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                today.setMilliseconds(0);

            if (!this.curMonth || !(this.curMonth.getFullYear() === newMonth.getFullYear() &&
                this.curMonth.getMonth() === newMonth.getMonth())) {

                this.curMonth = newMonth;

                this.$days.empty();

                for (ii = 0; ii <= num_days; ii++) {
                    var thisDay = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate() + ii, 12, 00),
                        $day = $('<div>').attr('date', this.format(thisDay));
                    $day.text(thisDay.getDate());

                    if (thisDay.getMonth() !== date.getMonth()) {
                        $day.addClass('overlap');
                    }

                    if(today.getTime() + this.limit < thisDay.getTime() || (this.preventPast && today.getTime() > thisDay.getTime()))
                        $day.addClass('disabled');

                    this.$days.append($day);
                }

                this.updateName(this.$month, this.monthNames[date.getMonth()]);
                this.updateName(this.$year, this.curMonth.getFullYear());

                $('div', this.$days).click($.proxy(function (e) {
                    var $targ = $(e.target);

                    // If the class is disabled, cancel click event.
                    if($targ.hasClass('disabled')) return;

                    // The date= attribute is used here to provide relatively fast
                    // selectors for setting certain date cells.
                    this.update($targ.attr("date"));

                    // Don't consider this selection final if we're just going to an
                    // adjacent month.
                    if (!$targ.hasClass('overlap')) {
                        this.hide();
                    }

                }, this));

                $("[date='" + this.format(today) + "']", this.$days).addClass('today');

            }

            $('.selected', this.$days).removeClass('selected');
            $('[date="' + this.selectedDateStr + '"]', this.$days).addClass('selected');
        },
        selectDate: function (date) {
            if (typeof (date) === "undefined") {
                date = this.parse(this.$el.val());
            }

            if (!date) {
                date = new Date();
            }

            this.selectedDate = date;
            this.selectedDateStr = this.format(this.selectedDate);
            this.selectMonth(this.selectedDate);
        },
        update: function (s) {
            this.$el.val(s).change();
        },
        show: function (e) {
            if (e) {
                e.stopPropagation();
            }

            // Hide all other datepickers.
            clearDatePickers(this);

            var offset = this.$el.offset();

            if(!this.noOffset) {
                this.$picker.css({
                    top: offset.top + this.$el.outerHeight() + 2,
                    left: offset.left
                });
            }

            this.$picker.show();

            $('html').on('keydown', this.keyHandler);
        },
        hide: function () {
            this.$picker.hide();
            $('html').off('keydown', this.keyHandler);
        },
        keyHandler: function (e) {
            // Keyboard navigation shortcuts.
            switch (e.keyCode) {
            case 9:
            case 27:
                // Tab or escape hides the datepicker. In this case, just return
                // instead of breaking, so that the e doesn't get stopped.
                this.hide();
                return;
            case 13:
                // Enter selects the currently highlighted date, unless it is disabled.
                if( $('.selected', this.$days).hasClass('disabled') ) return;
                this.update(this.selectedDateStr);
                this.hide();
                break;
            case 38:
                // Arrow up goes to prev week.
                this.ahead(0, -7);
                break;
            case 40:
                // Arrow down goes to next week.
                this.ahead(0, 7);
                break;
            case 37:
                // Arrow left goes to prev day.
                this.ahead(0, -1);
                break;
            case 39:
                // Arrow right goes to next day.
                this.ahead(0, 1);
                break;
            default:
                return;
            }
            e.preventDefault();
        },
        parse: function (s) {
            // Parse a partial RFC 3339 string into a Date.
            var m = s.match(/^(\d{4,4})-(\d{2,2})-(\d{2,2})$/);
            if (m) {
                return new Date(m[1], m[2] - 1, m[3]);
            } else {
                return null;
            }
        },
        format: function (date) {
            // Format a Date into a string as specified by RFC 3339.
            var month = (date.getMonth() + 1).toString(),
                dom = date.getDate().toString();
            if (month.length === 1) {
                month = '0' + month;
            }
            if (dom.length === 1) {
                dom = '0' + dom;
            }
            return date.getFullYear() + '-' + month + "-" + dom;
        },
        ahead: function (months, days) {
            // Move ahead ``months`` months and ``days`` days, both integers, can be
            // negative.
            this.selectDate(new Date(this.selectedDate.getFullYear(),
                this.selectedDate.getMonth() + months,
                this.selectedDate.getDate() + days));
        },
        proxy: function (meth) {
            // Bind a method so that it always gets the datepicker instance for
            // ``this``. Return ``this`` so chaining calls works.
            this[meth] = $.proxy(this[meth], this);
            return this;
        },
        daysBetween: function (start, end) {
            // Return number of days between ``start`` Date object and ``end``.
            start = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
            end = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
            return (end - start) / 86400000;
        },
        findClosest: function (dow, date, direction) {
            // From a starting date, find the first day ahead of behind it that is
            // a given day of the week.
            var difference = direction * (Math.abs(date.getDay() - dow - (direction * 7)) % 7);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + difference);
        },
        rangeStart: function (date) {
            // Get the first day to show in the current calendar view.
            return this.findClosest(this.startOfWeek,
                new Date(date.getFullYear(), date.getMonth()),
                -1);
        },
        rangeEnd: function (date) {
            // Get the last day to show in the current calendar view.
            return this.findClosest((this.startOfWeek - 1) % 7,
                new Date(date.getFullYear(), date.getMonth() + 1, 0),
                1);
        }
    };

    /* DATEPICKER PLUGIN DEFINITION
   * ============================ */

    $.fn.datepicker = function (options) {
        return this.each(function () {
            new DatePicker(this, options);
        });
    };

    $(function () {
        $(selector).datepicker();
        $('html').click(clearDatePickers);
    });

    $.fn.datepicker.DatePicker = DatePicker;

    $.fn.datepicker.defaults = {
        monthNames: [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"],
        shortDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        startOfWeek: 1
    };
}(window.jQuery || window.ender);
