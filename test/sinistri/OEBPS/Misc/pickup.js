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
	try {
		const parentContent = window.parent.document.getElementById('content');
		const parentClasses = parentContent ? parentContent.className : '';
		const myTarget = document.getElementById('main');
		if (myTarget && parentClasses) {
			myTarget.className += ' ' + parentClasses;
		}
	} catch (e) {
		console.error('親フレームにアクセスできません', e);
	}	
}
window.addEventListener('DOMContentLoaded', showTargetSection);
window.addEventListener('hashchange', showTargetSection);
