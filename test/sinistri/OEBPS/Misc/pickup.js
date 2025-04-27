function showTargetSection() {
	const hash = window.location.hash;
	document.querySelectorAll('.pagination').forEach(el => { el.style.display = 'none';
	});
	if (hash) {
		const target = document.querySelector(hash);
		if (target) {
			target.style.display = 'block';
			window.scrollTo(0, 0);
		}
	}
}
window.addEventListener('DOMContentLoaded', showTargetSection);
window.addEventListener('hashchange', showTargetSection);
