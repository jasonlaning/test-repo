var apiKey = 'f3eJCOiKbJ2ZMrlU898kj7q8g11J4hEW5IbJY9Zl';

var state = {
	queryTerm: '',
	senatorBios: [],
	senatorVotes: [],
	senatorHTML: [],
	statePicked: ''
}

function getMembers() {

	state.senatorBios = [];
	state.senatorVotes = [];
	state.senatorHTML = [];

	var settings = {
		'async': true,
		'crossDomain': true,
		'url': 'https://api.propublica.org/congress/v1/members/senate/' + state.queryTerm + '/current.json',
		'method': 'GET',
		'headers': {
			'x-api-key': apiKey,
  		}
	}

	$.ajax(settings).done(function (response) {
		if (response.results.length > 0) {
			getMemberData(response.results, settings);
		}
		else {
			displaySenatorHTML(response);
		}
	});
}

function getMemberData(members, settings) {
	
	var settings1 = {
		url: '',
		headers: {
			'x-api-key': apiKey,
  		}
	};

	var settings2 = {
		url: '',
		headers: {
			'x-api-key': apiKey,
  		}
	};
	
	for (var i = 0; i < members.length; i++) {
		settings1.url = 'https://api.propublica.org/congress/v1/members/' + members[i].id + '.json';
		settings2.url = 'https://api.propublica.org/congress/v1/members/' + members[i].id + '/votes.json';
		console.log(settings1);
		console.log(settings2);

		$.when($.ajax(settings1), $.ajax(settings2)).done(function (response1, response2) {
				state.senatorBios.push (response1[0].results);
				state.senatorVotes.push (response2[0].results);
			
				if (state.senatorBios.length === members.length) {
					getSenatorHTML(state.senatorBios, state.senatorVotes)
					displaySenatorHTML(state.senatorHTML);	
				}
		});
	}
}

function getVotesHTML(votes) {
	voteHTML = '';

	console.log(votes);

	for (var i = 0; i < 5; i++) {
		vote = votes[i];
		voteHTML += '<p>Voted: <strong>' + vote.position + '</strong> <span class="lighter">(' + vote.date + ')</span>';
		if (vote.bill.title) {
			var billNum = vote.bill.number.split('.').join("");
			voteHTML += '<p><a href="https://projects.propublica.org/represent/bills/' + 
			vote.congress + '/' + billNum + '">' + 
			vote.bill.number + '</a>: ' + vote.bill.title + '&#8212;' + vote.bill.latest_action + '</p><br />';
		}
		else {			
		voteHTML += '<p>' + vote.description + '</p><br />';
		}
	}

	return voteHTML;
}

function getCommittees(bio) {
	var committees = '';
	var committeeList = bio.roles[0].committees;
	console.log('committees', committeeList);

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

function getSenatorHTML(bios, votes) {

	for (var i = 0; i < 2; i++) {
		console.log('bios', bios);
		console.log('bios[' + i + ']', bios[i]);
		var bio = bios[i][0];
		var vote = votes[i][0];     
    	var imgUrl = 'https://theunitedstates.io/images/congress/450x550/' + bio.member_id + '.jpg'; // 225x275 or 450x550
    	var phoneNum = bio.roles[0].phone;
    	var votesHTML = getVotesHTML(vote.votes);
    	if ((bio.member_id === 'S001202') && !phoneNum) {
    		phoneNum = '202-224-4124';
    	}
    	var bioUrl = bio.url;
    	if ((bio.member_id === 'S001202') && !bioUrl) {
    		bioUrl = 'https://strange.senate.gov';
    	}    	
    	var committees = getCommittees(bio);

		state.senatorHTML += ('<div class="senator">' +
							'<img src="' + imgUrl + '" class="senator-pic">' +
							'<div class="senator-text">' +
							'<h1>' + bio.first_name + ' ' + bio.last_name + ' (' + bio.roles[0].party + ')</h1>' + 							
							'<p>' +
							'<span class = "lighten italic">' + state.stateSelected + ', ' + bio.roles[0].title + '</span><br />' +
							'<a href="tel:' + phoneNum + '" class = "phone-button">' +
							'<img src="images/green-phone.png" class="phone-pic">' + phoneNum + 
							'</a><br />' +
							'Website: <a href="' + bioUrl + '">' + bioUrl + '</a>' +
							'</p>' +
							'<p><span class="lighten italic">Committee membership:</span> ' + committees + '<p>' +				
							'<section class = "votes-data">' +
							'<h2>Recent Votes</h2>' +
							votesHTML +						 
							'</section>' +
							'</div>' +
							'</div>');
							//console.log(state.senatorHTML);
	}
}

function displaySenatorHTML(senatorHTML) {
	var resultElement = '';
	console.log('displaying already');

	if (senatorHTML) {
		resultElement = '<div class="to-fade">' + senatorHTML + '</div>';
	}
	else {
		resultElement = '<p class="center">Residents of Washington DC have no representation ' +
						'in the United States Senate.</p>';
	}

	$('.js-searching-alert').toggleClass('no-display');
	$('#js-search-results').html(resultElement);
	$('html, body').animate({scrollTop:$('#js-search-results').position().top});
	$('.to-fade').addClass('fade-in');
}

function watchSubmit() {
	$('.js-selector-form').submit(function(event) {
		event.preventDefault();
		event.stopPropagation();
		$('.js-searching-alert').toggleClass('no-display');
		state.queryTerm = $(this).find('option:selected').val();
		state.stateSelected = $('option:selected').html();		
		getMembers();
	});
}

watchSubmit();
