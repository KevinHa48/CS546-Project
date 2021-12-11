(function($) {
    var buying_power = $('#buying-power'),
        total_assets = $('#total-assets'),
        add_balance_form = $('#add-balance-form'),
        add_balance_amt = $('#add-balance-amt'),
        add_balance_alert = $('#add-balance-alert')

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
})(window.jQuery)