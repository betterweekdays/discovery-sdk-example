/* global $, BWD, window */

window.goLogin = function() {
  BWD.Config.set({
    APIEnv: $('#env').val(),
    APIKey: $('#apiKey').val()
  });

  $('#bwdAccessTokenTableBody').html('');
  $('#bwdAccessTokenStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Redirecting to login...');

  window.location = BWD.Client.getLogin();
};

window.goLogout = function() {
  window.location = BWD.Client.getLogout();
};

window.getAccessToken = function() {
  window.event.preventDefault();

  BWD.Config.set({
    APIEnv: $('#env').val(),
    APIKey: $('#apiKey').val(),
    APISecret: $('#apiSecret').val()
  });

  $('#bwdAccessTokenTableBody').html('');
  $('#bwdAccessTokenStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Client.getAccessToken()
    .then(function(results) {
      console.log('BWD.Client.getAccessToken() returned successfully. Results:',
        results);
      if (results.hasOwnProperty('access_token') &&
          results.hasOwnProperty('status') && results.status === 'approved') {
        $('#accessToken').val(results.access_token);
        $('#bwdAccessTokenStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .text('Successfully retrieved access token. The token will be ' +
            'stored for use in other methods, like for listing jobs.');
      } else {
        $('#accessToken').val('');
        $('#bwdAccessTokenStatus')
          .attr('class', 'alert')
          .addClass('alert-danger')
          .text('Received response, but did not receive a valid access token.' +
            ' Please try again.');
      }
    })
    .catch(function(error) {
      console.log(
        'An error occurred when invoking BWD.Client.getAccessToken(). Error:',
        error);
      $('#accessToken').val('');
      $('#bwdAccessTokenStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when fetching an access token: ' +
          error.message);
    });
};

window.getJobs = function() {
  window.event.preventDefault();

  var token = BWD.Config.get('AccessToken');
  if (!token || !token.access_token) {
    $('#bwdJobsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var params = {
    count: $('#limit').val(),
    page: $('#page').val()
  };

  $('#bwdJobsTableBody').html('');
  $('#bwdJobsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Jobs.get(params)
    .then(function(results) {
      console.log('BWD.Jobs.get() returned successfully. Results: ', results);
      var totalNum = results.count;
      var num = results.data.length;
      var tableHtml;
      for (var i = 0; i < num; i++) {
        var job = results.data[i];
        var company = job.company ? job.company.name : '';
        var location = job.location ? job.location.name : '';
        tableHtml += '<tr><td>' + job.id + '</td><td>' + job.title +
          '</td><td>' + company + '</td><td>' + location + '</td></tr>';
      }
      $('#bwdJobsTableBody').html(tableHtml);
      $('#bwdJobsStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .text('Successfully received ' + num + ' jobs out of ' + totalNum + ' total.');
      $('.pager-prev').parent().css('display', results.previous ? 'inline' : 'none');
      $('.pager-next').parent().css('display', results.next ? 'inline' : 'none');
      $('.pager').removeClass('hide');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Jobs.get(). Error: ',
        error);
      $('#bwdJobsTableBody').html('');
      $('#bwdJobsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when fetching jobs: ' + error.message);
      $('.pager').addClass('hide');
      $('.pager li').hide();
    });
};

window.pageJobs = function(num) {
  $('#page').val(parseInt($('#page').val(), 10) + Number(num));
  window.getJobs();
};

window.getJob = function() {
  window.event.preventDefault();

  var token = BWD.Config.get('AccessToken');
  if (!token || !token.access_token) {
    $('#bwdJobStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var params = {
    'filter[id][value]': $('#jobId').val()
  };

  $('#bwdJobTableBody').html('');
  $('#bwdJobStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Jobs.get(params)
    .then(function(results) {
      console.log('BWD.Jobs.get() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        var job = results.data[0];
        function isScalar(obj) {
          return (/string|number|boolean/).test(typeof obj);
        }
        function objToTable(entity, prefix) {
          var str = '';
          $.each(entity, function(key, value) {
            key = (prefix.length) ? prefix + '.' + key : key;
            if (value && !isScalar(value)) {
              str += objToTable(value, key);
              return;
            }
            str += '<tr><td>' + key + '</td><td>' + value + '</td></tr>';
          });
          return str;
        }
        tableHtml += objToTable(job, '');
        $('#bwdJobStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .text('Successfully received job.');
      } else {
        $('#bwdJobStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No job found with given ID.');
      }
      $('#bwdJobTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Jobs.get(). Error: ',
        error);
      $('#bwdJobTableBody').html('');
      $('#bwdJobStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting the job: ' + error.message);
    });
};

// Check for a hash parameter
var anchors = ['home', 'access-token', 'jobs', 'job'];
var hash = window.location.hash;
var matches = hash ? hash.match(/^#(\w+),(\w+)/) : false;
if (matches && matches.length === 3 && anchors.indexOf(matches[1]) === -1) {
  // Assume this is an access token returned as a callback from the API.
  var token = {access_token: matches[1]};
  BWD.Config.set('AccessToken', token);
  BWD.Config.set('APIEnv', matches[2]);
  $('#apiKey').val(matches[2]);
  $('#apiKey,#apiSecret,#env').attr('readonly', 'readonly');
  $('#accessToken').val(token.access_token);
  $('.nav-pills a[href="#access-token"]').tab('show');
  window.location.hash = '';
}
