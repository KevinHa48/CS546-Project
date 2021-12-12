(function($) {
    var buying_power = $('#buying-power'),
        total_assets = $('#total-assets'),
        add_balance_form = $('#add-balance-form'),
        add_balance_amt = $('#add-balance-amt'),
        add_balance_alert = $('#add-balance-alert')
        sell_song_btn = $('.sell-song-button')
        sell_song_modal = $('#sell-song-modal')
        song_modal_content = $('#song-modal-content')
        close_btn = $('#close')

    add_balance_form.submit(function(event) {
        event.preventDefault()
        add_balance_alert.hide()
        var buying_power_val = parseFloat(buying_power.text().slice(1)), // get rid of '$'
            total_assets_val = parseFloat(total_assets.text().slice(1)),
            add_balance_amt_val = parseInt(add_balance_amt.val())

        if (typeof add_balance_amt_val != 'number' || add_balance_amt_val <= 0) {
            add_balance_alert.text('Amount must be a number greater than 0!')
            add_balance_alert.show()
            add_balance_amt.val(0)
            return
        }
        if (buying_power_val + add_balance_amt_val > 1e6) {
            add_balance_alert.text('You cannot add more than $1,000,000 to your buying power!')
            add_balance_alert.show()
            add_balance_amt.val(0)
            return
        }
        $.ajax({
            method: add_balance_form.attr('method'),
            url: add_balance_form.attr('action'),
            data: {
                amt: add_balance_amt_val
            },
            success: res => {
                buying_power.text('$' + `${res.balance.toFixed(2)}`)
                total_assets.text('$' + `${(total_assets_val + add_balance_amt_val).toFixed(2)}`)
                add_balance_alert.text('$' + `${add_balance_amt_val}.00 added to your buying power!`)
                add_balance_alert.show()
                add_balance_amt.val(0)
                return
            },
            error: res => {
                add_balance_alert.text('Internal Server Error')
                add_balance_alert.show()
                return
            }
        })
    })

    function transactionStatus (status) {
        $('.modal-header').hide();
        $('.modal-info').hide();

        if(status) {
            $('.status').text('Song has been successfully sold!')
            $('.instruction').text('Click X or outside this box to close.')
        }
        else {
            $('.status').text('Song could not be sold because of an error.')
            $('.instruction').text('Click X or outside this box to close and retry.')
        }

        $('.status').show();
        $('.instruction').show();
    }

    sell_song_btn.click(function(event) {
        sell_song_modal.show();

        $('.status').hide();
        $('.instruction').hide();

        // Grab id of song you clicked sell on
        let song_id = $(this).attr('songId');
        console.log(song_id);

        let confirm_yes = $('.confirm-yes');
        let confirm_no = $('.confirm-no');

        $('.modal-header').text("Selling Confirmation");

        // Grab the button's parent in order to get the relevant song info for the modal.
        let song_cell = $(this).parent().siblings();
        console.log(song_cell)
        let song_name = song_cell.find('.song-name').text();
        console.log(song_name)
        let song_artist = song_cell.find('.artist').text();

        $('.modal-info').text(`Are you sure you want to sell 
                ${song_name} by ${song_artist}?`)
        
        $('.modal-header').show();
        $('.modal-info').show();
        confirm_yes.show();
        confirm_no.show();

        confirm_yes.unbind('click').on('click', function(event) {
            event.preventDefault();
            $.ajax({
                url: `wallet/songs/${song_id}`,
                type: 'delete',
                success: function() {
                    transactionStatus(true);
                    $(this).remove();
                },
                error: function() {
                    transactionStatus(false);
                }
            })
            confirm_yes.hide();
            confirm_no.hide();
        });

        confirm_no.click(function(event) {
            event.preventDefault();
            sell_song_modal.hide();
        })
        
        return false;
    })

    close_btn.click(function(event) {
        event.preventDefault();
        sell_song_modal.hide();
    })

    $(document).click(function(event) {
        // Why the modal itself? 
        // The sell-song-modal is the backdrop so technically you have to click there to hide..
        if($(event.target).is('#sell-song-modal')) {
            sell_song_modal.hide();
        }
    })

})(window.jQuery)