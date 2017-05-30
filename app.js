/* global $, BWD, window */

window.goLogin = function() {
  BWD.Config.set({
    APIEnv: $('#env').val(),
    APIKey: $('#apiKey').val()
  });

  $('#bwdAccessTokenStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Redirecting to login...');

  window.location = BWD.Client.getLogin();
};

window.goLogout = function() {
  window.location = BWD.Client.getLogout();
};

window.getApigeeAccessToken = function() {
  window.event.preventDefault();

  BWD.Config.set({
    APIEnv: $('#env').val(),
    BackendEnv: $('#backEnv').val(),
    APIKey: $('#apiKey').val(),
    APISecret: $('#apiSecret').val(),
  });

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
          .html('Successfully retrieved access token. The token will be ' +
            'stored for use in other methods, like for listing jobs.<br/><br/>' +
            'This request can be performed with curl using the following options:<pre>' + window.mockCurlToken() + '</pre>');
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

window.getAuth0Token = function(tokenType) {
  window.event.preventDefault();

  var auth0id = $('#auth0_id').val();
  BWD.Config.set({
    Auth0ID: auth0id
  });

  var email = $('#auth0_email').val();
  var password = $('#auth0_password').val();

  $('#bwdAuth0Status')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Auth.login(email, password)
    .then(function(result) {
      console.log('BWD.Auth.login() returned successfully. Results:', result);
      if (result.hasOwnProperty('accessToken') ||
      result.hasOwnProperty('idToken')) {
        BWD.Config.set({
          APIEnv: $('#env').val(),
          BackendEnv: $('#backEnv').val()
        });
        if (tokenType === 'id') {
          $('#auth0IdToken').val(result.idToken);
          BWD.Config.set({
            AccessToken: {
              id_token: result.idToken
            }
          });
        } else {
          $('#auth0AccessToken').val(result.accessToken);
          BWD.Config.set({
            AccessToken: {
              access_token: result.accessToken
            }
          });
        }
        $('#bwdAuth0Status')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully retrieved Auth0' + tokenType + ' token. The token will be ' +
            'stored for use in other methods, like for listing jobs.<br/>');
      } else {
        $('#auth0AccessToken').val('');
        $('#bwdAuth0Status')
          .attr('class', 'alert')
          .addClass('alert-danger')
          .text('Received response, but did not receive a valid auth0 token.' +
            ' Please try again.');
      }
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Auth.login(). Error:', error);
      $('#auth0IdToken').val('');
      $('#auth0AccessToken').val('');
      $('#bwdAuth0Status')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when fetching an auth0 token: ' + error.message);
    });
};

window.refreshAuth0Token = function() {
  window.event.preventDefault();

  $('#bwdAccessTokenStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Auth.refreshToken()
    .then(function(result) {
      console.log('BWD.Auth.refreshToken() returned successfully. Results:', result);
      $('#auth0AccessToken').val(result.accessToken);
      $('#auth0IdToken').val(result.idToken);
      $('#auth0Status')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully refreshed Auth0 token.<br/>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Auth.refreshToken(). Error:', error);
      $('#auth0Status')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when refreshing an auth0 token: ' + error.message);
    });
};

window.registerUser = function() {
  window.event.preventDefault();

  var fullname = $('#auth0_reg_fullname').val();
  var email = $('#auth0_reg_email').val();
  var password = $('#auth0_reg_password').val();

  $('#auth0RegisterStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Auth.signup(email, password, fullname)
    .then(function(result) {
      console.log('BWD.Auth.signup() returned successfully. Results:', result);
      $('#auth0AccessToken').val(result.accessToken);
      $('#auth0RegisterStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully registered new user.');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Auth.signup(). Error:', error);
      $('#auth0RegisterStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when registering an new user: ' + error.message);
    });
};

window.getJobs = function(preset) {
  window.event.preventDefault();

  var params = {
    range: $('#limit').val(),
    page: $('#page').val()
  };

  if (preset) {
    if (preset === 'nyc') {
      params['filter[location]'] = 29; // New York, NY
    } else if (preset === 'bac-chi') {
      // Bank of America jobs in Chicago
      params['filter[company]'] = 652; // Bank of America
      params['filter[location]'] = 24; // Chicago, IL
    }
  }

  window.jobsActivePreset = preset;

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
        .html('Successfully received ' + num + ' jobs out of ' + totalNum + ' total.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('jobs', params, 'GET') + '</pre>');
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

window.searchJobs = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdJobsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var query = {
    title: 'Healthcare',
    location: 26154,
    jobarea: 152
  };

  $('#bwdSearchJobsTableBody').html('');
  $('#bwdJobsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Jobs.search(query)
    .then(function(results) {
      console.log('BWD.Jobs.search() returned successfully. Results: ', results);
      var totalNum = results.count;
      var num = results.data.length;
      var tableHtml;
      for (var i = 0; i < num; i++) {
        var stat = results.data[i];
        tableHtml += '<tr><td>' + stat.id + '</td><td>' + stat.type +
          '</td><td>' + stat.source + '</tr>';
      }
      $('#bwdSearchJobsTableBody').html(tableHtml);
      $('#bwdJobsStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully received ' + num + ' stats .<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('search', query, 'GET') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Jobs.search(). Error: ',
        error);
      $('#bwdSearchJobsTableBody').html('');
      $('#bwdJobsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when searching jobs: ' + error.message);
    });
};

window.pageJobs = function(num) {
  $('#page').val(parseInt($('#page').val(), 10) + Number(num));
  window.getJobs(window.jobsActivePreset);
};

window.getJob = function() {
  window.event.preventDefault();

  var jobId = $('#jobId').val();

  $('#bwdJobTableBody').html('');
  $('#bwdJobStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Jobs.getById(jobId)
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
          .html('Successfully received job.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('jobs/' + jobId, null, 'GET') + '</pre>');
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

window.getInteractionForJob = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdJobStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var jobId = $('#jobId').val();

  $('#bwdJobInteractionsTableBody').html('');
  $('#bwdJobStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Jobs.getInteractions(jobId)
    .then(function(results) {
      console.log('BWD.Jobs.Interactions() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['id', 'title']);
        }

        $('#bwdJobStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received job interactions.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('jobs/' + jobId + '/todos', null, 'GET') + '</pre>');
      } else {
        $('#bwdJobStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No interactions for job found with given ID.');
      }
      $('#bwdJobInteractionsTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Jobs.getInteractions(). Error: ',
        error);
      $('#bwdJobInteractionsTableBody').html('');
      $('#bwdJobStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting interactions for the job: ' + error.message);
    });
};

window.setPreviewed = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdJobStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var jobId = $('#jobId').val();

  $('#bwdJobTableBody').html('');
  $('#bwdJobStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Jobs.setPreviewed(jobId)
    .then(function(results) {
      console.log('BWD.Jobs.setPreviewed() performed successfully.');
      $('#bwdJobStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set job previwed.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('jobs/' + jobId + '/previewed-job', null, 'GET') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Jobs.setPreviewed(). Error: ',
        error);
      $('#bwdJobTableBody').html('');
      $('#bwdJobStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when setting the job previewed: ' + error.message);
    });
};

window.setViewed = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdJobStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var jobId = $('#jobId').val();

  $('#bwdJobTableBody').html('');
  $('#bwdJobStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Jobs.setViewed(jobId)
    .then(function(results) {
      console.log('BWD.Jobs.setViewed() performed successfully.');
      $('#bwdJobStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set job viwed.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('jobs/' + jobId + '/viewed-job', null, 'GET') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Jobs.setViewed(). Error: ',
        error);
      $('#bwdJobTableBody').html('');
      $('#bwdJobStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when setting the job viewed: ' + error.message);
    });
};

window.getUser = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdUserStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  $('#bwdUserTableBody').html('');
  $('#bwdUserStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Users.getMe()
    .then(function(results) {
      console.log('BWD.Users.getMe() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        var user = results.data[0];
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
        tableHtml += objToTable(user, '');
        $('#bwdUserStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received user.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('users/me', null, 'GET') + '</pre>');
      } else {
        $('#bwdUserStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No user found.');
      }
      $('#bwdUserTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Users.getMe(). Error: ',
        error);
      $('#bwdUserTableBody').html('');
      $('#bwdUserStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting the user: ' + error.message);
    });
};

window.updateUser = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdUserStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  $('#bwdUserTableBody').html('');
  $('#bwdUserStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var firstName = $('#firstName').val();
  var lastName = $('#lastName').val();

  var user = {
    firstName: firstName,
    lastName: lastName
  };

  BWD.Users.updateMe(user)
    .then(function(results) {
      console.log('BWD.Users.updateMe() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        var user = results.data[0];
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
        tableHtml += objToTable(user, '');
        $('#bwdUserStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received user.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('users/me', user, 'PATCH') + '</pre>');
      } else {
        $('#bwdUserStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No user found.');
      }
      $('#bwdUserTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Users.updateMe(). Error: ',
        error);
      $('#bwdUserTableBody').html('');
      $('#bwdUserStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting the user: ' + error.message);
    });
};

window.getFavorites = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdFavoritesStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  $('#bwdFavoritesTableBody').html('');
  $('#bwdFavoritesStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var type = $('#favorite-filter').val();

  var query = {
    'filter[type]': type
  };

  BWD.Favorites.get(query)
    .then(function(results) {
      console.log('BWD.Favorites.get() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['type', 'ref', 'taxonomyref']);
        }

        $('#bwdFavoritesStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received favorites.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('favorites', query, 'GET') + '</pre>');
      } else {
        $('#bwdFavoritesStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No favorites found.');
      }
      $('#bwdFavoritesTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Favorites.get(). Error: ',
        error);
      $('#bwdFavoritesTableBody').html('');
      $('#bwdFavoritesStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting the favorites: ' + error.message);
    });
};

window.getFeed = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdFeedStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  $('#bwdFeedTableBody').html('');
  $('#bwdFeedStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var limit = $('#feedLimit').val();

  var query = {
    range: limit
  };

  BWD.Feed.get(query)
    .then(function(results) {
      console.log('BWD.Feed.get() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['type', 'id', 'source']);
        }

        $('#bwdFeedStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received feed.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('feed', query, 'GET') + '</pre>');
      } else {
        $('#bwdFeedStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No feed found.');
      }
      $('#bwdFeedTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Feed.get(). Error: ',
        error);
      $('#bwdFeedTableBody').html('');
      $('#bwdFeedStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting the feed: ' + error.message);
    });
};

window.getMessages = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdMessagesStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  $('#bwdMessagesTableBody').html('');
  $('#bwdMessagesStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var query = {
    'filter[msgType]': 'message',
    'fields': 'id,from,recipient,subject,body'
  };

  BWD.Messaging.getMessages(query)
    .then(function(results) {
      console.log('BWD.Messaging.getMessages() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i]);
        }
        function objToTableRow(data) {
          return '<tr><td>' + data.id + '</td><td>' + data.from + '</td><td>' + data.recipient[0] + '</td><td>' + data.subject + '</td><td>' + data.body + '</td></tr>';
        }

        $('#bwdMessagesStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received a list of messages.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('messages', null, 'GET') + '</pre>');
      } else {
        $('#bwdMessagesStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No messages found.');
      }
      $('#bwdMessagesTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Messaging.getMessages(). Error: ',
        error);
      $('#bwdMessagesTableBody').html('');
      $('#bwdMessagesStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting the message threads: ' + error.message);
    });
};

window.getLocations = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdLocationsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('You must get an API token before you can use this method.');
    return;
  }

  $('#bwdLocationsTableBody').html('');
  $('#bwdLocationsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var query = {
    fields: 'id,name,lat,long'
  };

  BWD.Locations.get(query)
    .then(function(results) {
      console.log('BWD.Locations.get() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['name', 'lat', 'long']);
        }

        $('#bwdLocationsStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received a list of locations.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('locations', null, 'GET') + '</pre>');
      } else {
        $('#bwdLocationsStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No locations found.');
      }
      $('#bwdLocationsTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Locations.get(). Error: ',
        error);
      $('#bwdLocationsTableBody').html('');
      $('#bwdLocationsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting locations: ' + error.message);
    });
};

window.getAutocompletionsForCompany = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdAutocompleteStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var companyTitle = $('#companyTitle').val();

  $('#bwdCompanyAutocompleteTableBody').html('');
  $('#bwdAutocompleteStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var query = {
    title: companyTitle
  };

  BWD.Companies.autocomplete(companyTitle)
    .then(function(results) {
      console.log('BWD.Companies.autocomplete() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['id', 'label']);
        }

        $('#bwdAutocompleteStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received companies.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('autocomplete/company', query, 'GET') + '</pre>');
      } else {
        $('#bwdAutocompleteStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No companies found with given title.');
      }
      $('#bwdCompanyAutocompleteTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Companies.autocomplete(). Error: ',
        error);
      $('#bwdCompanyAutocompleteTableBody').html('');
      $('#bwdAutocompleteStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting companies: ' + error.message);
    });
};

window.getAutocompletionsForJobAreas = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdJobAreasStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var jobAreaTitle = $('#jobAreaTitle').val();

  $('#bwdJobAreasTableBody').html('');
  $('#bwdJobAreasStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var query = {
    title: jobAreaTitle
  };

  BWD.JobAreas.autocomplete(jobAreaTitle)
    .then(function(results) {
      console.log('BWD.JobAreas.autocomplete() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['id', 'label']);
        }

        $('#bwdJobAreasStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received job areas.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('autocomplete/jobarea', query, 'GET') + '</pre>');
      } else {
        $('#bwdJobAreasStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No job areas found with given title.');
      }
      $('#bwdJobAreasTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.JobAreas.autocomplete(). Error: ',
        error);
      $('#bwdJobAreasTableBody').html('');
      $('#bwdJobAreasStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting job areas: ' + error.message);
    });
};

window.getAutocompletionsForLocations = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdAutocompleteLocationsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var locationTitle = $('#locationTitle').val();

  $('#bwdAutocompleteLocationsTableBody').html('');
  $('#bwdAutocompleteLocationsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var query = {
    title: locationTitle
  };

  BWD.Locations.autocomplete(locationTitle)
    .then(function(results) {
      console.log('BWD.Locations.autocomplete() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['id', 'label']);
        }

        $('#bwdAutocompleteLocationsStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received locations.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('autocomplete/location', query, 'GET') + '</pre>');
      } else {
        $('#bwdAutocompleteLocationsStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No locations found with given title.');
      }
      $('#bwdAutocompleteLocationsTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Locations.autocomplete(). Error: ',
        error);
      $('#bwdAutocompleteLocationsTableBody').html('');
      $('#bwdAutocompleteLocationsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting locations: ' + error.message);
    });
};

window.getAutocompletionsForSchools = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdSchoolsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var schoolTitle = $('#schoolTitle').val();

  $('#bwdSchoolsTableBody').html('');
  $('#bwdSchoolsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var query = {
    title: schoolTitle
  };

  BWD.Schools.autocomplete(schoolTitle)
    .then(function(results) {
      console.log('BWD.Schools.autocomplete() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['id', 'label']);
        }

        $('#bwdSchoolsStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received schools.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('autocomplete/school', query, 'GET') + '</pre>');
      } else {
        $('#bwdSchoolsStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No schools found with given title.');
      }
      $('#bwdSchoolsTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Schools.autocomplete(). Error: ',
        error);
      $('#bwdSchoolsTableBody').html('');
      $('#bwdSchoolsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting schools: ' + error.message);
    });
};

window.getAutocompletionsForFieldsOfStudy = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdFieldsOfStudyStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var fieldOfStudyTitle = $('#fieldOfStudyTitle').val();

  $('#bwdFieldsOfStudyBody').html('');
  $('#bwdFieldsOfStudyStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var query = {
    title: fieldOfStudyTitle
  };

  BWD.DegreeSpecializations.autocomplete(fieldOfStudyTitle)
    .then(function(results) {
      console.log('BWD.DegreeSpecializations.autocomplete() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['id', 'label']);
        }

        $('#bwdFieldsOfStudyStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received fields of study.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('autocomplete/cip', query, 'GET') + '</pre>');
      } else {
        $('#bwdFieldsOfStudyStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No fields of study found with given title.');
      }
      $('#bwdFieldsOfStudyTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.DegreeSpecializations.autocomplete(). Error: ',
        error);
      $('#bwdFieldsOfStudyTableBody').html('');
      $('#bwdFieldsOfStudyStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting fields of study: ' + error.message);
    });
};

window.getAutocompletionsForDegreePrograms = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdDegreeProgramsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var degreeProgramTitle = $('#degreeProgramTitle').val();

  $('#bwdDegreeProgramsBody').html('');
  $('#bwdDegreeProgramsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  var query = {
    title: degreeProgramTitle
  };

  BWD.DegreePrograms.autocomplete(degreeProgramTitle)
    .then(function(results) {
      console.log('BWD.DegreePrograms.autocomplete() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['id', 'label']);
        }

        $('#bwdDegreeProgramsStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received degree programs.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('autocomplete/degreeprogram', query, 'GET') + '</pre>');
      } else {
        $('#bwdDegreeProgramsStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No degree programs found with given title.');
      }
      $('#bwdDegreeProgramsTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.DegreePrograms.autocomplete(). Error: ',
        error);
      $('#bwdDegreeProgramsTableBody').html('');
      $('#bwdDegreeProgramsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting degree programs: ' + error.message);
    });
};

window.getArticles = function(preset) {
  window.event.preventDefault();

  var params = {
    range: $('#articlesLimit').val(),
    page: $('#articlesPage').val()
  };

  // if (preset) {
  //   if (preset === 'nyc') {
  //     params['filter[location]'] = 29; // New York, NY
  //   }
  // }

  $('#bwdArticlesTableBody').html('');
  $('#bwdArticlesStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Articles.get(params)
    .then(function(results) {
      console.log('BWD.Articles.get() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['id', 'title']);
        }

        $('#bwdArticlesTableBody').html(tableHtml);
        $('#bwdArticlesStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received articles.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('articles', params, 'GET') + '</pre>');
      } else {
        $('#bwdArticlesStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No articles was found.');
      }
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Articles.get(). Error: ',
        error);
      $('#bwdArticlesTableBody').html('');
      $('#bwdArticlesStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when fetching articles: ' + error.message);
    });
};

window.getArticle = function() {
  window.event.preventDefault();

  var articleId = $('#articleId').val();

  $('#bwdArticleStatsTableBody').html('');
  $('#bwdArticleStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Articles.getById(articleId)
    .then(function(results) {
      console.log('BWD.Articles.getById() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        var article = results.data[0];
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
        tableHtml += objToTable(article, '');
        $('#bwdArticleStatsStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received article.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('articles/' + articleId, null, 'GET') + '</pre>');
      } else {
        $('#bwdArticleStatsStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No article found with given ID.');
      }
      $('#bwdArticleStatsTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Articles.getById(). Error: ',
        error);
      $('#bwdArticleStatsTableBody').html('');
      $('#bwdArticleStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting the article: ' + error.message);
    });
};

window.setViewedArticle = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdArticleStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var articleId = $('#articleId').val();

  $('#bwdArticleStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Articles.setViewed(articleId)
    .then(function(results) {
      console.log('BWD.Articles.setViewed() performed successfully.');
      $('#bwdArticleStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set article viewed.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('articles/' + articleId + '/viewed', null, 'POST') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Articles.setViewed(). Error: ',
        error);
      $('#bwdArticleStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when setting the article viewed: ' + error.message);
    });
};

window.setPreviewedArticle = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdArticleStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var articleId = $('#articleId').val();

  $('#bwdArticleStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Articles.setPreviewed(articleId)
    .then(function(results) {
      console.log('BWD.Articles.setPreviewed() performed successfully.');
      $('#bwdArticleStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set article previewed.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('articles/' + articleId + '/previewed', null, 'POST') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Articles.setPreviewed(). Error: ',
        error);
      $('#bwdArticleStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when setting the article previewed: ' + error.message);
    });
};

window.setFavoriteArticle = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdArticleStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var articleId = $('#articleId').val();

  $('#bwdArticleStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Articles.setFavorite(articleId)
    .then(function(results) {
      console.log('BWD.Articles.setFavorite() performed successfully.');
      $('#bwdArticleStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set article favorite.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('articles/' + articleId + '/favorite', null, 'POST') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Articles.setFavorite(). Error: ',
        error);
      $('#bwdArticleStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when setting the article favorite: ' + error.message);
    });
};

window.setPassArticle = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdArticleStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var articleId = $('#articleId').val();

  $('#bwdArticleStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Articles.setPass(articleId)
    .then(function(results) {
      console.log('BWD.Articles.setPass() performed successfully.');
      $('#bwdArticleStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set article pass.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('articles/' + articleId + '/pass', null, 'POST') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Articles.setPass(). Error: ',
        error);
      $('#bwdArticleStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when setting the article pass: ' + error.message);
    });
};

window.getCompanyInfoFromGlassdoor = function() {
  window.event.preventDefault();

  var companyId = $('#glassdoorCompanyId').val();

  var params = {
    companyId: companyId
  };

  BWD.Glassdoor.getCompanyInfo(params)
    .then(function(results) {
      console.log('BWD.Glassdoor.getCompanyInfo() returned successfully. Results:', results);
      var tableHtml;
      if (results.data.length) {
        var companyInfo = results.data[0];
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
        tableHtml += objToTable(companyInfo, '');
        $('#bwdGlassdoorDataStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received company info from Glassdoor.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('glassdoor/', params, 'GET') + '</pre>');
      } else {
        $('#bwdGlassdoorDataStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No company info found with given ID.');
      }
      $('#bwdGlassdoorDataTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Glassdoor.getCompanyInfo(). Error:', error);
      $('#bwdGlassdoorDataTableBody').html('');
      $('#bwdGlassdoorDataStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting company info from Glassdoor: ' + error.message);
    });
};

window.getCompanies = function() {
  window.event.preventDefault();

  var params = null;
  if ($('#companiesLimit').val()) {
    params = {
      range: $('#companiesLimit').val()
    };
  }

  $('#bwdCompaniesTableBody').html('');
  $('#bwdCompaniesStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Companies.get(params)
    .then(function(results) {
      console.log('BWD.Companies.get() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        for (var i = 0; i < results.data.length; i++) {
          tableHtml += objToTableRow(results.data[i], ['id', 'name', 'url']);
        }

        $('#bwdCompaniesTableBody').html(tableHtml);
        $('#bwdCompaniesStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received companies.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('companies', params, 'GET') + '</pre>');
      } else {
        $('#bwdCompaniesStatus')
          .attr('class', 'alert')
          .addClass('alert-warning')
          .text('No companies was found.');
      }
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Companies.get(). Error: ',
        error);
      $('#bwdCompaniesTableBody').html('');
      $('#bwdCompaniesStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when fetching companies: ' + error.message);
    });
};

window.getCompany = function() {
  window.event.preventDefault();

  var companyId = $('#companyId').val();

  $('#bwdCompanyStatsTableBody').html('');
  $('#bwdCompanyStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Companies.getById(companyId)
    .then(function(results) {
      console.log('BWD.Companies.getById() returned successfully. Results: ', results);
      var tableHtml;
      if (results.data.length) {
        var company = results.data[0];
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
        tableHtml += objToTable(company, '');
        $('#bwdCompanyStatsStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('Successfully received company.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('companies/' + companyId, null, 'GET') + '</pre>');
      } else {
          $('#bwdCompanyStatsStatus')
            .attr('class', 'alert')
            .addClass('alert-warning')
            .text('No company found with given ID.');
      }
      $('#bwdCompanyStatsTableBody').html(tableHtml);
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Companies.getById(). Error: ',
        error);
      $('#bwdCompanyStatsTableBody').html('');
      $('#bwdCompanyStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when getting the company: ' + error.message);
    });
};

window.setFavoriteCompany = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdCompanyStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var companyId = $('#companyId').val();

  $('#bwdCompanyStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Companies.setFavorite(companyId)
    .then(function(results) {
      console.log('BWD.Companies.setFavorite() performed successfully.');
      $('#bwdCompanyStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set company favorite.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('companies/' + companyId + '/favorite', null, 'POST') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Companies.setFavorite(). Error: ',
        error);
      $('#bwdCompanyStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when setting the company favorite: ' + error.message);
    });
};

window.setPassCompany = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdCompanyStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var companyId = $('#companyId').val();

  $('#bwdCompanyStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Companies.setPass(companyId)
    .then(function(results) {
      console.log('BWD.Companies.setPass() performed successfully.');
      $('#bwdCompanyStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set company favorite.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('companies/' + companyId + '/favorite', null, 'POST') + '</pre>');
    })
    .catch(function(error) {
        console.log('An error occurred when invoking BWD.Companies.setPass(). Error: ',
          error);
        $('#bwdCompanyStatsStatus')
          .attr('class', 'alert')
          .addClass('alert-danger')
          .text('An error occurred when setting the company passed: ' + error.message);
    });
};

window.checkCompanyStats = function(stats) {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdCompanyStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var companyId = $('#companyId').val();

  $('#bwdCompanyStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  switch(stats) {
    case 'favorite':
      BWD.Companies.isFavorite(companyId)
        .then(function(results) {
          console.log('BWD.Companies.isFavorite() performed successfully.');
          $('#bwdCompanyStatsStatus')
            .attr('class', 'alert')
            .addClass('alert-success')
            .html('This request can be performed with curl using the following options:<pre>' + window.mockCurl('companies/' + companyId + '/favorite', null, 'GET') + '</pre>');
          $('#bwdCompanyStatsInfo')
            .attr('class', 'alert')
            .addClass('alert-info')
            .text('Favorite - ' + results.data.stat);
        })
        .catch(function(error) {
          console.log('An error occurred when invoking BWD.Companies.isFavorite(). Error: ',
            error);
          $('#bwdCompanyStatsStatus')
            .attr('class', 'alert')
            .addClass('alert-danger')
            .text('An error occurred when setting the company favorite: ' + error.message);
        });
      break;
    case 'pass':
      BWD.Companies.isPass(companyId)
        .then(function(results) {
          console.log('BWD.Companies.isPass() performed successfully.');
          $('#bwdCompanyStatsStatus')
            .attr('class', 'alert')
            .addClass('alert-success')
            .html('This request can be performed with curl using the following options:<pre>' + window.mockCurl('companies/' + companyId + '/pass', null, 'GET') + '</pre>');
          $('#bwdCompanyStatsInfo')
            .attr('class', 'alert')
            .addClass('alert-info')
            .text('Pass - ' + results.data.stat);
        })
        .catch(function(error) {
          console.log('An error occurred when invoking BWD.Companies.isPass(). Error: ',
            error);
          $('#bwdCompanyStatsStatus')
            .attr('class', 'alert')
            .addClass('alert-danger')
            .text('An error occurred when setting the company passed: ' + error.message);
        });
      break;
    case 'view':
      BWD.Companies.isViewed(companyId)
        .then(function(results) {
          console.log('BWD.Companies.isViewed() performed successfully.');
          $('#bwdCompanyStatsStatus')
            .attr('class', 'alert')
            .addClass('alert-success')
            .html('This request can be performed with curl using the following options:<pre>' + window.mockCurl('companies/' + companyId + '/viewed', null, 'GET') + '</pre>');
          $('#bwdCompanyStatsInfo')
            .attr('class', 'alert')
            .addClass('alert-info')
            .text('Viewed - ' + results.data.stat);
        })
        .catch(function(error) {
          console.log('An error occurred when invoking BWD.Companies.isViewed(). Error: ',
            error);
          $('#bwdCompanyStatsStatus')
            .attr('class', 'alert')
            .addClass('alert-danger')
            .text('An error occurred when setting the company viewed: ' + error.message);
        });
      break;
    case 'preview':
      BWD.Companies.isPreviewed(companyId)
        .then(function(results) {
          console.log('BWD.Companies.isPreviewed() performed successfully.');
          $('#bwdCompanyStatsStatus')
            .attr('class', 'alert')
            .addClass('alert-success')
            .html('This request can be performed with curl using the following options:<pre>' + window.mockCurl('companies/' + companyId + '/previewed', null, 'GET') + '</pre>');
          $('#bwdCompanyStatsInfo')
            .attr('class', 'alert')
            .addClass('alert-info')
            .text('Previewed - ' + results.data.stat);
        })
        .catch(function(error) {
          console.log('An error occurred when invoking BWD.Companies.isPreviewed(). Error: ',
            error);
          $('#bwdCompanyStatsStatus')
            .attr('class', 'alert')
            .addClass('alert-danger')
            .text('An error occurred when setting the company previewed: ' + error.message);
        });
      break;
  }
};

window.setViewedCompany = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdCompanyStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var companyId = $('#companyId').val();

  $('#bwdCompanyStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Companies.setViewed(companyId)
    .then(function(results) {
      console.log('BWD.Companies.setViewed() performed successfully.');
      $('#bwdCompanyStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set company viewed.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('companies/' + companyId + '/viewed', null, 'POST') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Companies.setViewed(). Error: ',
        error);
      $('#bwdCompanyStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when setting the company viewed: ' + error.message);
    });
};

window.setPreviewedCompany = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdCompanyStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var companyId = $('#companyId').val();

  $('#bwdCompanyStatsStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Companies.setPreviewed(companyId)
    .then(function(results) {
      console.log('BWD.Companies.setPreviewed() performed successfully.');
      $('#bwdCompanyStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set company previewed.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('companies/' + companyId + '/previewed', null, 'POST') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Companies.setPreviewed(). Error: ',
        error);
      $('#bwdCompanyStatsStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when setting the company previewed: ' + error.message);
    });
};

window.setMessagesRead = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdCompanyStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var ids = $('#messageIds').val();

  $('#bwdMessagesStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

  BWD.Messaging.readMessages(ids)
    .then(function(results) {
      console.log('BWD.Messaging.readMessages() performed successfully.');
      $('#bwdMessagesStatus')
        .attr('class', 'alert')
        .addClass('alert-success')
        .html('Successfully set messages as read.<br/><br/>This request can be performed with curl using the following options:<pre>' + window.mockCurl('messageIds/' + ids + '/read', null, 'POST') + '</pre>');
    })
    .catch(function(error) {
      console.log('An error occurred when invoking BWD.Messaging.readMessages(). Error: ',
        error);
      $('#bwdMessagesStatus')
        .attr('class', 'alert')
        .addClass('alert-danger')
        .text('An error occurred when setting the messages as read: ' + error.message);
    });
};

window.checkMessagesRead = function() {
  window.event.preventDefault();

  if (!isAuthenticated()) {
    $('#bwdCompanyStatsStatus')
      .attr('class', 'alert')
      .addClass('alert-danger')
      .text('You must get an API token before you can use this method.');
    return;
  }

  var ids = $('#messageIds').val();

  $('#bwdMessagesStatus')
    .attr('class', 'alert')
    .addClass('alert-warning')
    .text('Loading...');

    BWD.Messaging.isMessagesRead(ids)
      .then(function(results) {
        console.log('BWD.Messaging.isMessagesRead() performed successfully.');
        $('#bwdMessagesStatus')
          .attr('class', 'alert')
          .addClass('alert-success')
          .html('This request can be performed with curl using the following options:<pre>' + window.mockCurl('messages/' + ids + '/read', null, 'GET') + '</pre>');

        var stats = [].concat(results.data);

        $('#bwdMessagesStatsInfo')
          .attr('class', 'alert')
          .addClass('alert-info')
          .text('Read - ' + stats.map(function(item) {
            return item.stat;
          }));
      })
      .catch(function(error) {
        console.log('An error occurred when invoking BWD.Messaging.isMessagesRead(). Error: ',
          error);
        $('#bwdMessagesStatus')
          .attr('class', 'alert')
          .addClass('alert-danger')
          .text('An error occurred when getting the messages read status: ' + error.message);
      });
};

window.mockCurl = function(url, params, method) {
  var cmd = 'curl ';
  if (method) {
    cmd += '-X' + method + ' ';
  }
  var token = '';
  if (BWD.Config.get('AccessToken') && BWD.Config.get('AccessToken').access_token) {
    token = BWD.Config.get('AccessToken').access_token;
  } else if (BWD.Config.get('AccessToken') && BWD.Config.get('AccessToken').id_token) {
    token = 'JWT ' + BWD.Config.get('AccessToken').id_token;
  }
  if (token) {
    cmd += '-H "Authorization: Bearer ' + token + '" ';
  }

  var url = BWD.Client.buildUrl(url);
  var data = '';
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      if (data.length) {
        data += '&';
      }
      data += key.replace(/\[/g, '\\[').replace(/\]/g, '\\]') + '=' + params[key];
    }
  }
  if (!data.length) {
    cmd += url;
  } else if (method === 'GET' || !method) {
    cmd += '"' + url + '?' + data + '"';
  } else {
    cmd += url + ' -d "' + data + '"';
  }
  return cmd;
};

window.mockCurlToken = function() {
  var headerAuth = 'Basic ' + btoa(BWD.Config.get('APIKey') + ':' +
    BWD.Config.get('APISecret'));
  var cmd = 'curl -XPOST -H "Authorization: ' + headerAuth +
    '" -H "Content-Type: application/x-www-form-urlencoded" ' +
    BWD.Client.buildUrl('oauth/token') + ' -d "grant_type=client_credentials"';
  return cmd;
};

// Shared helpers

function objToTableRow(data, props) {
  var columns = [];
  props.forEach(function(prop) {
    if (data[prop]) {
      columns.push('<td>' + data[prop] + '</td>');
    } else {
      columns.push('<td></td>');
    }
  });
  return '<tr>' + columns.join() + '</tr>';
}

function isAuthenticated() {
  var token = BWD.Config.get('AccessToken');
  return token && (token.access_token || token.id_token);
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
