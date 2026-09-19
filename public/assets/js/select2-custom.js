// Custom Select2 Initialization function
function initSelect2() {
    if (typeof $ !== 'undefined' && $.fn.select2) {
        $('.select2').each(function () {
            // Check if already initialized by a global template script
            if ($(this).hasClass('select2-hidden-accessible')) {
                // Destroy the existing instance so we can apply our custom theme and settings
                try {
                    $(this).select2('destroy');
                } catch (e) { }
            }

            // Apply our custom initialization with the search box active
            $(this).select2({
                width: '100%'
            });
        });
    }
}

$(document).ready(function () {
    // Initialize on page load
    initSelect2();

    // Automatically focus the search field when a select2 dropdown is opened
    $(document).on('select2:open', function (e) {
        setTimeout(function () {
            var searchField = document.querySelector('.select2-container--open .select2-search__field') || document.querySelector('.select2-search__field');
            if (searchField) {
                // Focus using standard JS
                searchField.focus();

                // Fallback to jQuery focus if available
                if (typeof $ !== 'undefined') {
                    $(searchField).focus();
                }
            }
        }, 150);
    });
});
