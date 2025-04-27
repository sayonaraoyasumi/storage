	function showTargetSection() {
		const hash = window.location.hash;
		document.querySelectorAll('section').forEach(el => { el.style.display = 'none';
		});
		if (hash) {
		const target = document.querySelector(hash);
		if (target) {
			target.style.display = 'block';
		}
	}

	try {
	alert("フォントの設定……");
			console.log("フォントの設定……");
			const parentContent = window.parent.document.getElementById('content');
			const parentClasses = parentContent ? parentContent.className : '';
			const myTarget = document.getElementById('main');
			if (myTarget && parentClasses) {
	alert("クラス発見……" + parentClasses);
			console.log("クラス発見……" + parentClasses);
				myTarget.classList.remove("serif");
				myTarget.classList.remove("sansserif");
				myTarget.classList.remove("bigger");
				myTarget.classList.remove("big");
				myTarget.classList.remove("mid");
				myTarget.classList.remove("mini");
				myTarget.classList.remove("minimum");
				myTarget.className += ' ' + parentClasses;
			}
		} catch (e) {
			console.error('親フレームにアクセスできません', e);
		}

	}
	window.addEventListener('DOMContentLoaded', showTargetSection);
	window.addEventListener('hashchange', showTargetSection);

