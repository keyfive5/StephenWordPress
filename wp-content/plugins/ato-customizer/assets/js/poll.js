/**
 * ATO "One Question" poll: vote via AJAX, then animate percentage
 * bars and count each percentage up from 0 (the running counter).
 */
(function () {
	'use strict';

	function animateCount(el, target) {
		var start = null;
		var duration = 900;
		function step(ts) {
			if (!start) start = ts;
			var progress = Math.min((ts - start) / duration, 1);
			var eased = 1 - Math.pow(1 - progress, 3);
			el.textContent = Math.round(eased * target) + '%';
			if (progress < 1) window.requestAnimationFrame(step);
		}
		window.requestAnimationFrame(step);
	}

	function showResults(poll, percentages, total, chosen) {
		var options = poll.querySelector('.ato-poll-options');
		var results = poll.querySelector('.ato-poll-results');
		if (options) options.hidden = true;
		if (!results) return;
		results.hidden = false;

		results.querySelectorAll('.ato-poll-row').forEach(function (row) {
			var i = parseInt(row.getAttribute('data-choice'), 10);
			var pct = percentages && percentages[i] !== undefined ? parseInt(percentages[i], 10) : parseInt(row.querySelector('.ato-poll-pct').getAttribute('data-pct'), 10) || 0;
			if (i === chosen) row.classList.add('is-choice');
			var bar = row.querySelector('.ato-poll-bar i');
			var pctEl = row.querySelector('.ato-poll-pct');
			pctEl.textContent = '0%';
			// Next frame so the width transition runs.
			window.requestAnimationFrame(function () {
				window.requestAnimationFrame(function () {
					bar.style.width = pct + '%';
					animateCount(pctEl, pct);
				});
			});
		});

		if (typeof total === 'number') {
			var totalEl = poll.querySelector('.ato-poll-total');
			if (totalEl) totalEl.textContent = total + (total === 1 ? ' vote so far' : ' votes so far');
		}
	}

	function bindPoll(poll) {
		var key = poll.getAttribute('data-poll');

		poll.querySelectorAll('.ato-poll-option').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var choice = parseInt(btn.getAttribute('data-choice'), 10);
				poll.querySelectorAll('.ato-poll-option').forEach(function (b) { b.disabled = true; });

				var body = new FormData();
				body.append('action', 'ato_poll_vote');
				body.append('nonce', window.atoPollData ? window.atoPollData.nonce : '');
				body.append('poll', key);
				body.append('choice', String(choice));

				window.fetch(window.atoPollData ? window.atoPollData.ajaxUrl : '/wp-admin/admin-ajax.php', {
					method: 'POST',
					body: body,
					credentials: 'same-origin'
				})
					.then(function (r) { return r.json(); })
					.then(function (json) {
						if (json && json.success) {
							document.cookie = 'ato_poll_' + key + '=1; path=/; max-age=31536000; SameSite=Lax';
							showResults(poll, json.data.percentages, json.data.total, choice);
						}
					})
					.catch(function () {
						poll.querySelectorAll('.ato-poll-option').forEach(function (b) { b.disabled = false; });
					});
			});
		});

		// Already voted (server rendered results): animate on view.
		if (poll.getAttribute('data-voted') === '1') {
			showResults(poll, null, undefined, -1);
		}
	}

	function initAll() {
		document.querySelectorAll('.ato-poll').forEach(bindPoll);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAll);
	} else {
		initAll();
	}
})();
