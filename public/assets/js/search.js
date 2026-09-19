 $('.select2').select2({
        theme: 'bootstrap4',
        width: '100%',
        minimumResultsForSearch: 0
    });

    // Automatically focus the search field when a select2 dropdown is opened
    $(document).on('select2:open', () => {
        document.querySelector('.select2-search__field').focus();
    }); 