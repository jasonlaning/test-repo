// global variable to manage app state
var state = {
	queryTerm: '',
	senatorBios: [],
	senatorVotes: [],
	senatorHTML: [],
	statePicked: '',
	navBar: false
}

var apiKey = 'f3eJCOiKbJ2ZMrlU898kj7q8g11J4hEW5IbJY9Zl';

// get senator IDs from API
function getMembers() {
	state.senatorBios = [];
	state.senatorVotes = [];
	state.senatorHTML = [];
	var settings = {
		url: 'https://artseen-nyc-api.herokuapp.com/api/members',
		method: 'POST',
		data: JSON.stringify({
			url: 'https://api.propublica.org/congress/v1/members/senate/' + state.queryTerm + '/current.json',
		}),
		contentType: "application/json",
		headers: {
			'X-API-Key': apiKey,
  		}
	}

	$.ajax(settings).done(function (response) {
		console.log(response);
		if (response.result.results.length > 0) {
			getMemberData(response.result.results, settings);
		}
		else {
			displaySenatorHTML('');
		}
	});
}

// use senator IDs to get biographical data
function getMemberData(members, settings) {
	var settingsBios = {
		url: 'https://artseen-nyc-api.herokuapp.com/api/members',
		method: 'POST',
		data: {},
		contentType: "application/json",
		headers: {
			'X-API-Key': apiKey,
  		}
	};
	var settingsVotes = {
		url: 'https://artseen-nyc-api.herokuapp.com/api/members',
		method: 'POST',
		data: {},
		contentType: "application/json",
		headers: {
			'X-API-Key': apiKey,
  		}
	};
	
	for (var i = 0; i < members.length; i++) {
		settingsBios.data = JSON.stringify({url: 'https://api.propublica.org/congress/v1/members/' + 
			members[i].id + '.json'});
		settingsVotes.data = JSON.stringify({url: 'https://api.propublica.org/congress/v1/members/' + 
			members[i].id + '/votes.json'});

		$.when($.ajax(settingsBios), $.ajax(settingsVotes)).done(function (responseBios, responseVotes) {
				state.senatorBios.push(responseBios[0].result.results);
				state.senatorVotes.push(responseVotes[0].result.results);			
				if (state.senatorBios.length === members.length) {
					getSenatorHTML(state.senatorBios, state.senatorVotes)
					displaySenatorHTML(state.senatorHTML);	
				}
		});
	}
}

// use senator IDs to get voting data 
function getVotesHTML(votes) {
	voteHTML = '';

	for (var i = 0; i < 5; i++) {
		vote = votes[i];
		voteHTML += '<p>Voted: <strong>' + vote.position + '</strong> <span class="lighten">(' + vote.date + ')</span><br />';
		if (vote.bill.title) {
			var billNum = vote.bill.number.split('.').join("");
			voteHTML += '<a href="https://projects.propublica.org/represent/bills/' + 
			vote.congress + '/' + billNum + '" target="_blank">' + 
			vote.bill.number + '</a>: ' + vote.bill.title + '&#8212;' + vote.bill.latest_action + '</p>';
		}
		else {			
		voteHTML += vote.description + '</p>';
		}
	}

	return voteHTML;
}

// sort through bio data to get committee membership data
function getCommittees(bio) {
	var committees = '';
	var committeeList = bio.roles[0].committees;

	if ((bio.member_id === 'S001202') && committeeList.length == 0) {
		committees = 'Budget Committee, Armed Services Committee, Energy and ' +
					'Natural Resources Committee, and Agriculture, Nutrition and Forestry Committee.';
	}
	else {
		for (var i = 0; i < committeeList.length; i++) {
			if (i < committeeList.length - 1) {
				committees += committeeList[i].name + ', ';
			}
			else {
				committees += 'and ' + committeeList[i].name + '.';
			}
		}
	}

	return committees;
}

// sort through biographical data to get social media links
function getSocialLinks(bio) {
	var socialLinks = '';

	if ((bio.member_id === 'S001202') && !bio.url) {
    	socialLinks += '<a href="https://strange.senate.gov" class="social-link" target="_blank">Official Website</a>';
    } 
    if ((bio.member_id === 'S001202') && !bio.facebook_account) {
    	socialLinks += '<a href="https://www.facebook.com/SenatorLutherStrange" class="social-link" target="_blank">Facebook</a>';
    }
    if ((bio.member_id === 'S001202') && !bio.twitter_account) {
    	socialLinks += '<a href="https://twitter.com/SenatorStrange" class="social-link" target="_blank">Twitter</a>';
    }
    if (bio.url) {
    	socialLinks += '<a href="' + bio.url + '" class="social-link" target="_blank">Official Website</a>';
    }
    if (bio.facebook_account) {
    	socialLinks += '<a href="https://www.facebook.com/' + bio.facebook_account + '" class="social-link" target="_blank">Facebook</a>';
    }
    if (bio.twitter_account) {
    	socialLinks += '<a href="https://twitter.com/' + bio.twitter_account + '" class="social-link" target="_blank">Twitter</a>';
    }
	return socialLinks;   
}

// use bio and voting data to create html for results page
function getSenatorHTML(bios, votes) {
	for (var i = 0; i < 2; i++) {
		var bio = bios[i][0];
		var vote = votes[i][0];     
    	var imgUrl = 'https://theunitedstates.io/images/congress/450x550/' + bio.member_id + '.jpg'; // 225x275 or 450x550
    	var phoneNum = bio.roles[0].phone;
    	var votesHTML = getVotesHTML(vote.votes);
    	if ((bio.member_id === 'S001202') && !phoneNum) {
    		phoneNum = '202-224-4124';
    	}
    	var socialLinks = getSocialLinks(bio);
    	var committees = getCommittees(bio);

		state.senatorHTML += ('<div class="senator">' +
							'<img src="' + imgUrl + '" class="senator-pic">' +
							'<div class="senator-text">' +
							'<h1>' + bio.first_name + ' ' + bio.last_name + ' (' + bio.roles[0].party + ')</h1>' + 							
							'<p class="senator-state">' +
							'<span class="lighten italic">U.S. Senator, ' + state.stateSelected + '</span><br />' +
							'</p>' +
							'<a href="tel:' + phoneNum + '" class = "phone-button">' +
							'<img src="images/green-phone.png"><p>' + phoneNum + 
							'</p></a>' +
							'<p class="social-links">' + socialLinks + '</p>' +
							'<p><span class="lighten italic">Office address:</span><br />' +
							bio.roles[0].office +
							'</p>' +
							'<p><span class="lighten italic">Committee memberships:</span><br />' + committees + '<p>' +				
							'<section class = "votes-data">' +
							'<h2>Recent Votes</h2>' +
							votesHTML +						 
							'</section>' +
							'</div>' +
							'</div>');
	}
}

// render search results
function displaySenatorHTML(senatorHTML) {
	var resultElement = '';

	if (senatorHTML) {
		resultElement = '<div class="to-fade">' + senatorHTML + '</div>';
	}
	else {
		resultElement = '<p class="DC-message">Sorry, but residents of Washington DC have no representation ' +
						'in the United States Senate.</p>';
	}
	if (!state.navBar) {
		$('.js-searching-alert').toggleClass('no-display');
	};
	$('#js-search-results').html(resultElement);	
	$('.to-fade').addClass('fade-in');	
	if (!state.navBar) {
		state.navBar = true;
		$('.form-box').addClass('js-nav-bar');
		$('.results-wrap').addClass('js-nav-bar-padding');
		$('footer').addClass('js-nav-bar');
	};
	$('html, body').animate({scrollTop:$('.results-wrap').position().top});
}

// event handler
function watchSubmit() {
	$('.js-selector-form').change(function(event) {
		event.preventDefault();
		event.stopPropagation();
		if (!state.navBar) {
		$('.js-searching-alert').toggleClass('no-display');
		};
		state.queryTerm = $(this).find('option:selected').val();
		state.stateSelected = $('option:selected').html();		
		getMembers();
	});
}

watchSubmit();
