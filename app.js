var state = {
	queryTerm: '',
	senatorHTML: []
}

function getMembers() {
	state.senatorHTML = [];

	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "https://api.propublica.org/congress/v1/members/senate/" + state.queryTerm + "/current.json",
		"method": "GET",
		"headers": {
			"x-api-key": "f3eJCOiKbJ2ZMrlU898kj7q8g11J4hEW5IbJY9Zl",
  		}
}

	$.ajax(settings).done(function (response) {
		if (response.results.length > 0) {
			console.log(response.results);
			getMemberData(response.results, settings);
		}
		else {
			$('.js-search-results').html('<p>No Results</p>');
		}
	});
}

function getMemberData(members, settings) {
	var response = {};
	console.log('member:' + members[0].id);
		
	for (var i = 0; i < members.length; i++) {
		settings.url = "https://api.propublica.org/congress/v1/members/" + members[i].id + '.json';
		$.ajax(settings).done(function (response) {
			console.log('second response');
			console.log(response.results);
			getSenatorHTML(response.results);
			console.log(state.senatorHTML.length);
			console.log(members.length);
			if (state.senatorHTML.length === members.length) {
			displaySenatorHTML(state.senatorHTML);
		}
		});
	}
}

function preLoadImg(url) {
	var img = new Image(); 
    img.src = url;
}

function getSenatorHTML(data) {
	console.log('data for get html:');
	console.log(data);
	data = data[0];    
    var imgUrl = 'https://theunitedstates.io/images/congress/450x550/' + data.member_id + '.jpg';
    preLoadImg(imgUrl);
    var phoneNum = data.roles[0].phone;
    if ((data.member_id === 'S001202') && !phoneNum) {
    	phoneNum = '202-224-4124';
    }
    
	state.senatorHTML.push('<div class="senator">' +
							'<h2>' + data.first_name + ' ' + data.last_name + '</h2>' +
							'<h2>' + phoneNum + '</h2>' +
							'<p><img src="' + imgUrl + '"></p>' +
							'<p><a href="https://twitter.com/' + data.twitter_account + '" target="_blank">Twitter Account</a></p>' + 
							'</div>');
							console.log(state.senatorHTML);
}

function displaySenatorHTML(senatorHTML) {
	var resultElement = '';
	console.log('displaying already');

	if (senatorHTML) {
		for (var i = 0; i < senatorHTML.length; i++) {
		resultElement += senatorHTML[i];
		}
	}
	else {
		resultElement += '<p>No results</p>';
	}

	$('.js-search-results').html(resultElement);
}

function watchSubmit() {
	$('.js-search-form').submit(function(event) {
		event.preventDefault();
		event.stopPropagation();
		state.queryTerm = $(this).find('option:selected').val();
		
		getMembers();
	});
}

watchSubmit();
