jQuery(function(){

	// リンク作成ボタン
	jQuery("#copybutton").click(function( event ){
		event.stopPropagation();
		console.log("ACTION: リンク作成ボタン");
		let url = location.origin + location.pathname;
		let title = document.title;
		let metaDescription = document.querySelector('meta[name="description"]');
		let content = metaDescription.getAttribute('content');
		let url2book = content + " / " + title + " " + url;
		navigator.clipboard.writeText(url2book);
		console.log( "COPY to CLIPBOARD: " + url2book );
		// アナウンスする
		jQuery('#copyanounce').fadeIn(100);
		jQuery('#copyanounce').html("クリップボードにリンクをコピーしました<hr/>" + url2book);
		jQuery('.copypannel').addClass('highlight');
		setTimeout(() => {
			jQuery('.copypannel').removeClass('highlight');
		}, 100); // 100ms間ハイライトを即座に適用してからフェードアウト

	});

	// ウインドウのリサイズ時
	function resizeIframe() {
		console.log( "ウインドウのリサイズ: " );
		const iframe = document.getElementById('autoResizeIframe');
		if (iframe && iframe.contentWindow && iframe.contentDocument) {
			iframe.style.height = iframe.contentDocument.body.scrollHeight + "px";
		}
	}
	// Iframeのサイズ調整
	console.log( "Iframeのサイズ調整: " );
	const iframe = document.getElementById('autoResizeIframe');
	iframe.addEventListener('load', resizeIframe);
	window.addEventListener('resize', resizeIframe);


	const thumbnail = document.querySelector(".thumbnail");
	const lightbox = document.getElementById("lightbox");
	const lightboxImg = document.getElementById("lightbox-img");

	// 画像クリック時にライトボックス表示
	thumbnail.addEventListener("click", () => {
		lightboxImg.src = thumbnail.dataset.large;
		lightbox.style.display = "flex";
	});

	// ライトボックスのクリックで閉じる
	lightbox.addEventListener("click", (e) => {
		lightbox.style.display = "none";
	});

});

