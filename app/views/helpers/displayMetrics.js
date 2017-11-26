/**
 * Created by johnokeeffe on 16/05/2017.
 */
'use strict'

function displayMetrics (context, month, year) {
  let result = ''
  // console.log('displayMetrics context: ' + JSON.stringify(context, null, 2))
  // console.log('displayMetrics month: ' + JSON.stringify(month, null, 2))
  // console.log('displayMetrics year: ' + JSON.stringify(year, null, 2))

  if (!context) {
    return result + '<div class="ui grid">' +
                      '<div class="ui two wide column"></div>' +
                        '<div class="ui twelve wide column fluid form">' +
                          '<div class="ui very padded text segment">' +
                            '<h3 class="ui red header">No metrics available for that month</h3>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>'
  } else {
    return result + '<div class="ui grid">' +
        '<div class="ui two wide column">' +
        '</div>' +
        '<div class="ui twelve wide column fluid form">' +
        '<table class="ui celled blue table segment">' +
        '<thead>' +
        '<tr>' +
        '<th colspan="5" class="ui blue header">' + month + ' ' + year + '</th>' +
    '</tr>' +
    '<tr>' +
    '<th class="two wide"> Total Tickets <br> this month</th>' +
    '<th class="two wide"> Unresolved Tickets this month</th>' +
    '<th class="two wide"> % Unresolved</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>' +
        '<tr>' +
        '<td>' + context.numTickets + '</td>' +
    '<td>' + context.unresolved + '</td>' +
    '<td>' + context.unresolvedPercent + '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</div>' +
    '</div>' +
    '<div class="ui grid">' +
        '<div class="ui two wide column">' +
        '</div>' +
        '<div class="ui six wide column">' +
        '<table class="ui celled blue table segment">' +
        '<thead>' +
        '<tr>' +
        '<th class="three wide"> Avg. Reply Time <br>this month (mins)</th>' +
    '<th class="three wide"> Avg. Reply Time <br> all time (mins)</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr>' +
    '<td>' + context.avgReply + '</td>' +
    '<td>' + context.avgReplyAllTime + '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</div>' +
    '<div class="ui six wide column">' +
        '<table class="ui celled blue table segment">' +
        '<thead>' +
        '<tr>' +
        '<th class="three wide"> Avg. Resolution Time <br>this month (mins)</th>' +
    '<th class="three wide"> Avg. Resolution Time <br>all time (mins)</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr>' +
    '<td>' + context.avgRes + '</td>' +
    '<td>' + context.avgResAllTime + '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</div>' +
    '</div>'
  }
}

module.exports = displayMetrics
