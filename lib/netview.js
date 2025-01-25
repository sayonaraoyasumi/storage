jQuery(function(){

	const slotOffset = 2;
	const pathname = location.pathname;

	let chapterNumber = 1;
	let scrollPersent = 0;

	let mode;
	if ( jQuery("#bboard").hasClass("yoko") ){
		mode = "yoko";
	} else {
		mode = "tate";
	}

	// カレントの.novelを覚えておく
	let curchapslot = chapterNumber + slotOffset;
	let currentChapter = jQuery(".novel:nth-child(" + curchapslot + ")");

	// カレントの.novelの全幅を覚えておく
	let sw = jQuery(currentChapter).get(0).scrollWidth;
	let sh = jQuery(currentChapter).get(0).scrollHeight;

	// cookie 処理 ========================================================
	// chapter
//	console.log("ACTION: 処理スタート");
	// クエリを格納するハッシュ
	const queryParams = {};
	const urlObject = new URL(location.href); // URLオブジェクトを作成
	const searchParams = urlObject.searchParams; // searchParamsオブジェクトを取得
	// searchParamsをループしてハッシュに格納
	for (const [key, value] of searchParams.entries()) {
		queryParams[key] = value;
	}
	const queryChapter = queryParams.c * 1;
	const queryStart = queryParams.s * 1;
	const queryStartOffset = queryParams.so * 1;
	const queryEnd = queryParams.e * 1;
	const queryEndOffset = queryParams.eo * 1;
	let targetText, beforeText, midText, afterText;
	if ( queryChapter ){
		// クエリからチャプターが来てる場合
		if ( queryChapter && queryStart && queryEnd ){
			// 抜粋の処理を行う
			chapterNumber = queryChapter * 1;
//			console.log("ACTION: 抜粋処理 - chapter = " + chapterNumber );

			// エラーの除去処理
			let capTextError = 'ない';
			if( queryStart > queryEnd){
				capTextError = "範囲指定が間違っているようです";
//				console.log( "開始ノード" + queryStart );
//				console.log( "終了ノード" + queryEnd );
//				console.log( capTextError );
			} else {
				// まずは抜粋モードを設定
				jQuery("#aboard").addClass("hilightmode");
//				console.log( "抜粋モードを設定 " );
				if ( queryStart == queryEnd ){
					// 開始と終了が同じノードにある場合の処理
//					console.log("開始と終了が同じノードにある場合の処理 ======================");
					targetText = jQuery("#n-" + queryStart).html();
//					console.log( "キャプチャスタート " + queryStartOffset );
					beforeText = targetText.slice(0, queryStartOffset);
					midText = targetText.slice( queryStartOffset, queryEndOffset );
//					console.log( "キャプチャエンド " + queryEndOffset );
					afterText = targetText.slice( queryEndOffset );
					jQuery("#n-" + queryStart).html(beforeText + '<span class="textHilightEdge textHilight" id="startHilight">' + midText + '</span>' + afterText);

				} else {
					// 開始ノードにタグを打ち込む
//					console.log("開始ノードにタグを打ち込む ======================");
					targetText = jQuery("#n-" + queryStart).html();
//					console.log( "キャプチャスタート " + queryStart + "章" + queryStartOffset + "文字" );
					beforeText = targetText.slice(0, queryStartOffset);
					afterText = targetText.slice(queryStartOffset);
					// 新しいHTMLを構築
					jQuery("#n-" + queryStart).html(beforeText + '<span class="textHilightEdge textHilight" id="startHilight">' + afterText + '</span>');

					// 終了ノードにタグを打ち込む
//					console.log("終了ノードにタグを打ち込む ======================");
					targetText = jQuery("#n-" + queryEnd).html();
//					console.log( "キャプチャエンド " + queryEnd + "章" + queryEndOffset + "文字" );
					beforeText = targetText.slice(0,queryEndOffset);
					afterText = targetText.slice(queryEndOffset);
					// 新しいHTMLを構築
					jQuery("#n-" + queryEnd).html('<span class="textHilightEdge textHilight">' + beforeText + '</span>' + afterText);

					// 途中のノードにクラスを追加する
					if( queryStart + 1 < queryEnd ){
//						console.log("途中のノードにクラスを追加する");
						for (let i = queryStart + 1; i < queryEnd; i++) {
//							console.log("　追加 #n-" + i );
							targetText = jQuery("#n-" + i ).addClass("textHilight");
						}
					}
				}
				// まだここは抜粋処理の中
				let me = document.getElementById( 'startHilight' );
				// 親
				let oya = jQuery( me ).parent().parent();
				let oyawidth = jQuery(oya).width();
				let oyaheight = jQuery(oya).height();
//				console.log( "oyawidth " + oyawidth );
//				console.log( "oyaheight " + oyaheight );
				// 親を表示する
				jQuery( oya ).removeClass("hide");

// テスト実装
//
//
// 試験的に一個外側に配置
// 
				// 0.3秒待って
/*
				setTimeout(() => {
					// 暗くしてるの消す
					jQuery('#overlay').removeClass().addClass("bright"); //
					// 表紙を消す
					jQuery('#coverimage').fadeOut(500);
				}, 300); 
*/
				// ノードの座標を割り出す
				// 自分
				let myleft = me.offsetLeft;
				let myTop = me.offsetTop;
				// console.log( '自分の左からの位置は？ ' + myleft );
				// console.log( '自分の上からの位置は？ ' + myTop );

				if ( mode == "tate" ){
					let scrolltarget = myleft - oyawidth * 0.8;
					jQuery( oya ).scrollLeft( scrolltarget * 0.8 );
console.log("myleft " + myleft);
console.log("oyawidth " + oyawidth);
console.log("scrolltarget " + scrolltarget);
				}else{
					jQuery( oya ).scrollTop( myTop + oyaheight * 0.8 );
				}

//				console.log("ノードまでスクロールさせる");

// TODO
// 
// COOKIEの中身消す
// 
				jQuery.removeCookie('scroll',{ path: pathname });
console.log("cookie scroll" + jQuery.cookie("scroll"));

			}
			// ここまでひたすら抜粋の処理
		} else {
			// 抜粋処理なしで、チャプター表示
			chapterNumber = queryChapter * 1;
//			console.log("query: chapter is " + chapterNumber );
		}

// テスト実装
// 
// クエリからチャプタ－来てたら、いずれにしても表紙は消す。
// 
		// 0.3秒待って
		setTimeout(() => {
			// 暗くしてるの消す
			jQuery('#overlay').removeClass().addClass("bright"); //
			// 表紙を消す
			jQuery('#coverimage').fadeOut(500);
		}, 300); 


	} else if (jQuery.cookie("chapter")){
		// 本文
		chapterNumber = jQuery.cookie("chapter") * 1;
//		console.log("cookie: chapter is " + chapterNumber );
	}

	// 外側
	chapterChange( chapterNumber + slotOffset );

	// font
	if (jQuery.cookie("font")){
		jQuery(".novel").removeClass("minimum mini mid big bigger");
		jQuery(".fontSwitch").removeClass("pick");
		jQuery("." + jQuery.cookie("font") + "font").addClass("pick");
		jQuery(".novel").addClass(jQuery.cookie("font"));
//		console.log("cookie: font is " + jQuery.cookie("font") );
	}

	// fontfamily
	if (jQuery.cookie("fontfamily")){
		jQuery(".novel, .fontChange").removeClass("serif sansserif");
		jQuery(".novel, .fontChange").addClass(jQuery.cookie("fontfamily"));
//		console.log("cookie: fontfamily is " + jQuery.cookie("fontfamily") );
	}

/*
	// writhing-mode
	if (jQuery.cookie("tateyoko")){
		mode = jQuery.cookie("tateyoko");
		jQuery("#bboard").addClass(mode);
//		console.log("cookie: writhing-mode is " + mode );
	}
*/
	// background
	if (jQuery.cookie("background")){
		let bgfromcookie = jQuery.cookie("background");
		jQuery('body').removeClass().addClass( bgfromcookie ); //
//		console.log("cookie: background is " + bgfromcookie );
	}

	// scroll
	if (jQuery.cookie("scroll")){
		if ( mode == "tate" ){
			jQuery(currentChapter).scrollLeft(jQuery.cookie("scroll"));
		}else{
			jQuery(currentChapter).scrollTop(jQuery.cookie("scroll"));
		}
//		console.log("cookie: scroll is " + jQuery.cookie("scroll") );
	}

	// 各種ボタン ========================================================
	// ページ送り（スクロール）処理
	jQuery(".novel").click(function(e){
		// 範囲が選択されている場合は処理しない
		const selection = window.getSelection();
		if( selection.toString().length ){ return; }
		// ここから処理
		let ww, sx, hh, sy, next;
		if ( mode == "tate" ){
			ww = jQuery(this).width();
			sx = jQuery(this).scrollLeft();
			next = sx + ww * 0.92;
			if( e.offsetX + jQuery(this).offset().left - jQuery(this).offset().left < ww/2 ){
				next = sx - ww * 0.92;
			}
			sw = jQuery(this).get(0).scrollWidth;
			scrollPersent = next / sw;
			jQuery(this).animate({scrollLeft: next});
		}else{
			hh = jQuery(this).height();
			sy = jQuery(this).scrollTop();
			next = sy + hh * 0.92;
			if( e.offsetY + jQuery(this).offset().top - jQuery(this).offset().top < hh/2 ){
				next = sy - hh * 0.92;
			}
			sh = jQuery(this).get(0).scrollHeight;
			scrollPersent = next / sh ;
			jQuery(this).animate({scrollTop: next});
		}
		jQuery.cookie("scroll", next, { expires: 1000, path: pathname });
	});

	// 文字変更ボタン
	jQuery(".fontChange").click(function( event ){
		let ff;
		event.stopPropagation();
		if( jQuery(this).hasClass("serif") ){
			ff = "sansserif";
			jQuery(".novel").removeClass("serif").addClass(ff);
			jQuery(this).removeClass("serif").addClass(ff);
		} else {
			ff = "serif";
			jQuery(".novel").removeClass("sansserif").addClass(ff);
			jQuery(this).removeClass("sansserif").addClass(ff);
		}
		jQuery.cookie("fontfamily", ff, { expires: 1000, path: pathname });
//		console.log("set cookie: fontfamily " + jQuery.cookie("fontfamily"));
	});

	// 文字サイズボタン
	jQuery(".fontSwitch").click(function( event ){
		event.stopPropagation();
//		console.log("ACTION: 文字サイズボタン");
		// まずは座標をパーセンテージで取得
		if ( mode == "tate" ){
			sw = jQuery(currentChapter).get(0).scrollWidth;
			scrollPersent = jQuery(currentChapter).scrollLeft() / sw;
		}else{
			sh = jQuery(currentChapter).get(0).scrollHeight;
			scrollPersent = jQuery(currentChapter).scrollTop() / sh;
		}
		// 押されたボタンを識別
		let size;
		if(jQuery(this).hasClass("biggerfont")) { size = "bigger"; }
		if(jQuery(this).hasClass("bigfont"))    { size = "big";    }
		if(jQuery(this).hasClass("midfont"))    { size = "mid";    }
		if(jQuery(this).hasClass("minifont"))   { size = "mini";   }
		if(jQuery(this).hasClass("minimumfont")){ size = "minimum";}
		// クラスを剥がして再付与
		jQuery(".novel").removeClass("minimum mini mid big bigger").addClass(size);
		// クッキー食わせる
		jQuery.cookie("font", size, { expires: 1000, path: pathname });
//		console.log("set cookie: font " + jQuery.cookie("font") );
		// ボタンのハイライト
		jQuery(".fontSwitch").removeClass("pick");
		jQuery(this).addClass("pick");
		// スクロール位置を再セットする
		doScroll( scrollPersent );
	});

	// 章送り戻しボタン
	jQuery(".novel .back,.novel .forward").click(function(){
//		console.log("ACTION: 章送り戻しボタン");
		// 次へ
		if(jQuery(this).hasClass("forward")){
			chapterNumber++;
			scrollPersent = 0;
		// 戻る
		}else{
			chapterNumber--;
			if( mode == "tate" ){
				scrollPersent = -1;
			}else{
				scrollPersent = 1;
			}
		}
		// 実行
		chapterChange( chapterNumber + slotOffset );
		// スクロールのセット
		doScroll(scrollPersent);
		// ハイライトモードの解除
		// jQuery("#aboard").removeClass("hilightmode");
		// console.log( "抜粋モードを解除" );
		// ハイライトモードで表示しているタグを外す。
		// hilightTurnOff();
		if( jQuery("#aboard").hasClass("hilightmode") ){
			let url = location.origin + location.pathname;
			location.href = url;
		}

	});

	// 章切り替え
	jQuery(".chapterJump").click(function( event ){
//		console.log("ACTION: 章切り替え");
		event.stopPropagation();
		chapterNumber = jQuery(this).attr("chapter") * 1;
		// 実行
		chapterChange( chapterNumber + slotOffset );
		// ウインドウ閉じる
		jQuery(".chapterBox").slideUp(200);
		// ハイライトモードの解除
		// jQuery("#aboard").removeClass("hilightmode");
		// console.log( "抜粋モードを解除" );
		// ハイライトモードで表示しているタグを外す。
		// hilightTurnOff();
		if( jQuery("#aboard").hasClass("hilightmode") ){
			let url = location.origin + location.pathname;
			location.href = url;
		}
	});

	// 目次ボタン
	jQuery(".topBar").click(function( event ){
//		console.log("ACTION: 目次ボタン");
		event.stopPropagation();
		jQuery(".chapterBox").slideToggle(200);
	});

	// ボトムバーのクリック
	jQuery(".bottomBar").click(function(){

		// 抜粋モードを解除
		// jQuery("#aboard").removeClass("hilightmode");
		// console.log( "抜粋モードを解除" );
		// ハイライトモードで表示しているタグを外す。
		// hilightTurnOff();
		if( jQuery("#aboard").hasClass("hilightmode") ){
			let url = location.origin + location.pathname;
			location.href = url;
		}

		if( jQuery('.optionBar').hasClass("show") ){
			//	オプションバー表示されてたら閉じる
//			console.log("ACTION: オプションバーを閉じる");
			jQuery('.optionBar').removeClass("show");
			jQuery('.optionBar').slideUp(200);
		} else {
//			console.log("ACTION: ボトムバーのクリックでオプションバーを開く");
			jQuery(".makelink").removeClass('touch');

			const selection = window.getSelection();
			if (selection.rangeCount > 0 && selection.toString()) {
//				console.log("Selected Text:", selection.toString());
				jQuery('.thistext').addClass("haveachoice");
			} else {
//				console.log("No text is selected.");
				jQuery('.thistext').removeClass("haveachoice");
			}

			// バーの表示
			jQuery('.optionBar').addClass("show");
			jQuery('.optionBar').css('display', 'flex').hide().slideDown(200);
		}
	});
/*
	function hilightTurnOff(){

		jQuery('.textHilightEdge').replaceWith(function() {
			return jQuery(this).text(); // タグ自身を外し、テキストだけを残す
		});
		jQuery('span').removeClass('textHilight')

	}
*/
	// オプションバーのマウスアウトでオプションバーを閉じる
	jQuery(".optionBar").mouseout(function( event ){
//		console.log("ACTION: オプションバーを閉じる");
		// relatedTargetで移動先の要素を取得
		const relatedTarget = event.relatedTarget;

		// 自分自身または子要素なら処理をスキップ
		if (jQuery(this).has(relatedTarget).length > 0 || this === relatedTarget) {
			return;
		}
		jQuery('.optionBar').removeClass("show");
		jQuery('.optionBar').slideUp(200);
	});

	// オプションバーでオプションバーを閉じる
	jQuery(".optionBar").click(function(){
//			console.log("ACTION: オプションバーを閉じる");
			jQuery('.optionBar').removeClass("show");
			jQuery('.optionBar').slideUp(200);
	});

	// リンク作成ボタン
	jQuery(".makelink").click(function( event ){
		event.stopPropagation();
//		console.log("ACTION: リンク作成ボタン");
		let url = location.origin + location.pathname;
		let title = document.title;
		let anouncemessage;
		if ( jQuery(this).hasClass('thisbook') ){
			// 本のURL
			const metaDescription = document.querySelector('meta[name="description"]');
			let content;
			if (metaDescription) {
				content = metaDescription.getAttribute('content');
			}
			let url2book = content + " / " + title + " " + url;
			navigator.clipboard.writeText(url2book);
			anouncemessage = "クリップボードに<strong>この本</strong>のリンクをコピーしました<hr/>" + url2book;
//			console.log( "COPY to CLIPBOARD: " + url2book );
		} else if ( jQuery(this).hasClass('thischapter') ){
			// チャプターのURL
			let mytitle = jQuery(currentChapter).find("h3").html();
			let url2chapter = title + " より 「" + mytitle + "」 " + url + "?c=" + chapterNumber;
			navigator.clipboard.writeText(url2chapter);
			anouncemessage = "クリップボードに<strong>この章</strong>のリンクをコピーしました<hr/>" + url2chapter;
//			console.log( "COPY to CLIPBOARD: " + url2chapter );
		} else if ( jQuery(this).hasClass('haveachoice') ){
			let selection = window.getSelection(); // 選択範囲を取得
//console.log( selection );
			let selectedText = selection.toString();
//console.log( "選択した文字列: " + selectedText );
			let textLength = selectedText.length; // 文字列の長さを取得
			let captureerror = 0;
			if (selection.rangeCount > 0) {
				let range = selection.getRangeAt(0); // 最初の選択範囲を取得
				// 開始ノードと終了ノードを取得
				let startNode = range.startContainer.parentNode;
				let endNode = range.endContainer.parentNode;
				// IDを取得（IDがない場合は "ごめんなさい" 表示）
				let startNodeId = startNode.id || captureerror++;
				let endNodeId = endNode.id || captureerror++;
				if( captureerror ){
					anouncemessage = "選択範囲が、ルビや縦中横から始まる（終わる）場合、この機能は使用できません";
//					console.log( "COPY to CLIPBOARD: " + anouncemessage );
				} else {
					// 選択した部分のテキストから改行を抜く
					let trimedtext = selectedText.replace(/[\n\r]/g, "");
					// 表示する抜粋の長さ
					let caplength = 120;
					// 選択した文字列が長い場合、
					if( caplength < textLength ) {
						trimedtext = trimedtext.slice(0,caplength) + "……";
					}
					// コピーする文字列を作成
					let title = document.title;
					let url = location.origin + location.pathname;
					let startpos = startNodeId.replace(/\D/g, "");
					let endpos = endNodeId.replace(/\D/g, "");
					let pretext = trimedtext.replace(/　/g, "") + " / " + title + " より抜粋 ";
// デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　
// デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　
// デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！
//					pretext = "";
// デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　
// デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　
// デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　デバッグ用！　
					let url2text = pretext + url 
						+ "?c=" + chapterNumber 
						+ "&s=" + startpos
						+ "&so=" + range.startOffset 
						+ "&e=" + endpos
						+ "&eo=" + range.endOffset;
//	console.log('開始位置: node-' +  startpos + " " + range.startOffset + "文字目" );
//	console.log('終了位置: node-' +  endpos + " " + range.endOffset + "文字目" );
//	console.log('URL: ', url2text);
					navigator.clipboard.writeText(url2text);
//					console.log( "スタート: " + url2text );
					anouncemessage = "クリップボードに<strong>選択した文章</strong>へのリンクをコピーしました<hr/>" + url2text;
				}
			} else {
				anouncemessage = "クリップボードにコピーできませんでした";
			}
		} else {
//	console.log('thisbook でも thischapter でも haveachoice でもない ' );
			// thisbook でも thischapter でも haveachoice でもない
			anouncemessage = "クリップボードにコピーできませんでした";
		}
//	console.log('アナウンスフェイズ ' );
		// アナウンスする
		jQuery('#anouncebox .voice').html(anouncemessage.replace(/　/g, ""));
		jQuery('#anouncebox').css('display', 'flex').hide().fadeIn(500);
		// ボタンの色変える
//	console.log('ボタンの色変える ' );
		jQuery(this).addClass('touch');
		// オプションバー閉じる
		jQuery('.optionBar').removeClass("show");
		jQuery('.optionBar').slideUp(500);
	});

	// アナウンス
	jQuery("#anouncebox").click(function( event ){
		event.stopPropagation();
//		console.log("ACTION: アナウンスを消す");
		jQuery( this ).fadeOut(200);
		jQuery(".makelink").removeClass('touch');
		jQuery('.optionBar').removeClass("show");
		jQuery('.optionBar').slideUp(200);
	});

/*
	// 縦横ボタン
	// 最新バージョンでは未使用のため、動作チェックなし
	jQuery(".tateyoko").click(function( event ){
//		console.log("ACTION: 縦横ボタン");
		event.stopPropagation();
		// まずは座標をパーセンテージで取得
		if ( mode == "tate" ){
			sw = jQuery(currentChapter).get(0).scrollWidth;
			scrollPersent = jQuery(currentChapter).scrollLeft() / sw;
		}else{
			sh = jQuery(currentChapter).get(0).scrollHeight;
			scrollPersent = jQuery(currentChapter).scrollTop() / sh;
		}
		// クラスを設定
		if ( mode == "yoko" ){
			mode = "tate";
			jQuery("#bboard").removeClass("yoko");
			jQuery("#bboard").addClass("tate");
		}else{
			mode = "yoko";
			jQuery("#bboard").removeClass("tate");
			jQuery("#bboard").addClass("yoko");
		}
		// クッキー
		jQuery.cookie("tateyoko", mode, { expires: 1000, path: pathname });
//		console.log("set cookie: tateyoko " + jQuery.cookie("tateyoko"));
		// スクロール再セット
		scrollPersent *= -1;
		doScroll(scrollPersent);
	});
*/

	jQuery(".novel").scroll(function(){
//		console.log("ACTION: スクロール");
		if ( mode == "tate" ){
			sw = jQuery(currentChapter).get(0).scrollWidth;
			scrollPersent = jQuery(currentChapter).scrollLeft() / sw;
			jQuery.cookie("scroll", jQuery(currentChapter).scrollLeft(), { expires: 1000, path: pathname });
		}else{
			sh = jQuery(currentChapter).get(0).scrollHeight;
			scrollPersent = jQuery(currentChapter).scrollTop() / sh;
			jQuery.cookie("scroll", jQuery(currentChapter).scrollTop(), { expires: 1000, path: pathname });
		}
	});
/*
	// ボードの拡大
	// 最新バージョンでは未使用のため、動作チェックなし
	jQuery('.zoomButton').click(function(){
//		console.log("ACTION: ボードの拡大");
		var frame = jQuery('#aboard');
		var target = jQuery('#bboard');
		if(jQuery(target).css('position') == "absolute"){
			// ウインドウにアタッチ
			var t = jQuery(frame).offset().top - jQuery(window).scrollTop();
			var l = jQuery(frame).offset().left - jQuery(window).scrollLeft();
			var w = jQuery(frame).css('width');
			var h = jQuery(frame).css('height');
			jQuery(target).css({'top': t });
			jQuery(target).css({'left': l });
			jQuery(target).css({'width': w });
			jQuery(target).css({'height': h });
			jQuery(target).css({'position': 'fixed'});
			reSizeMe(target , 
				0,
				0,
				jQuery(window).width(),
				window.innerHeight,
				300);
		}else{
			// フレームにアタッチ
			var t = jQuery(window).scrollTop() - jQuery(frame).offset().top;
			var l = jQuery(window).scrollLeft() - jQuery(frame).offset().left;
			jQuery(target).css({'top': t });
			jQuery(target).css({'left': l });
			jQuery(target).css({'position': 'absolute'});
			reSizeMe(target ,
				jQuery(frame).css('top'),
				jQuery(frame).css('left'),
				jQuery(frame).css('width'),
				jQuery(frame).css('height'),
				300);
		}
	});
*/

	jQuery(window).resize(function() {
//		console.log("ACTION: リサイズ処理");
		//リサイズされたときの処理
		var target = jQuery('#bboard');
		if(jQuery(target).css('position') == "fixed"){
			jQuery(target).css({top: 0});
			jQuery(target).css({width: jQuery(window).width()});
			jQuery(target).css({left: 0});
			jQuery(target).css({height: window.innerHeight});
		}
	});

	// 章切り替えの中身
	function chapterChange( slot ){
//		console.log("ACTION: 章切り替え実行 " + slot );
		jQuery(".novel").addClass("hide");
		jQuery.cookie("chapter", chapterNumber, { expires: 1000, path: pathname });
//		console.log("set cookie: chapter " + jQuery.cookie("chapter"));
		jQuery(".novel:nth-child("+slot+")").removeClass("hide");
		currentChapter = jQuery(".novel:nth-child("+slot+")");
		// 章タイトル更新
		let mytitle = jQuery(currentChapter).find("h3").html();
//		console.log("currentChapter = " + mytitle);
		jQuery(".myTitle").html(mytitle);
	}

	// スクロール
	function doScroll( percent ){
//		console.log("ACTION: スクロール実行");
		if ( mode == "tate" ){
			jQuery(".novel").scrollTop( 0 );
			sw = jQuery(currentChapter).get(0).scrollWidth;
			jQuery(currentChapter).scrollLeft( sw * percent - 1 );
			jQuery(currentChapter).scrollLeft( sw * percent );
		}else{
			jQuery(".novel").scrollLeft( 0 );
			sh = jQuery(currentChapter).get(0).scrollHeight;
			jQuery(currentChapter).scrollTop( sh * percent + 1 );
			jQuery(currentChapter).scrollTop( sh * percent );
		}
	}
/*
	// ボードの拡大用関数
	// ズームボタンからのみ呼ばれる
	function reSizeMe(target,t,l,w,h){
		jQuery(target).animate({top: t},{queue: false}, 300);
		jQuery(target).animate({left: l},{queue: false}, 300);
		jQuery(target).animate({width: w},{queue: false}, 300);
		jQuery(target).animate({height: h},{queue: false}, 300);
	}
*/
	// 表紙を消す
	jQuery('#coverimage').on('click', function( event ) {
		event.stopPropagation();
		jQuery(".novel:nth-child("+ chapterNumber + slotOffset +")").removeClass("hide");
		jQuery('#overlay').removeClass().addClass("bright"); //
		jQuery(this).fadeOut(500);
//		console.log("表紙消す");
	});

	// ヘルプを表示
	jQuery('#showhelp').on('click', function( event ) {
		event.stopPropagation();
		jQuery('#overlay').removeClass().addClass("dark"); //
		jQuery('#helpbox').css('display', 'flex').hide().fadeIn(500);
//		console.log("ヘルプを表示");
	});

	// ヘルプを消す
	jQuery('#helpbox').on('click', function( event ) {
		event.stopPropagation();
		jQuery('#overlay').removeClass().addClass("bright"); //
		jQuery(this).fadeOut(500);
//		console.log("ヘルプを消す");
	});

	// 最初に戻る
	jQuery('#gotostart').on('click', function( event ) {
		event.stopPropagation();
		chapterNumber = 1;
		scrollPersent = 0;
		jQuery('#overlay').removeClass().addClass("dark"); //
		jQuery('#coverimage').fadeIn(500);
		chapterChange( chapterNumber + slotOffset );
//		console.log("最初に戻る");
		// ハイライトモードの解除
		// jQuery("#aboard").removeClass("hilightmode");
		// console.log( "抜粋モードを解除" );
		// ハイライトモードで表示しているタグを外す。
		// hilightTurnOff();
		if( jQuery("#aboard").hasClass("hilightmode") ){
			let url = location.origin + location.pathname;
			location.href = url;
		}
	});

	// BGセレクターを消す
	jQuery('.bgselector').on('click', function( event ) {
		event.stopPropagation();
		jQuery(this).fadeOut(500);
//		console.log("BGセレクターを消す");
	});

	// BGセレクターを表示
	jQuery('.configButton').on('click', function( event ) {
		event.stopPropagation();
		jQuery('#overlay').removeClass().addClass("dark"); //
		jQuery('.bgselector').css('display', 'flex').hide().fadeIn(500);
//		console.log("BGセレクターを表示");
	});

	// BGを変更する
	jQuery('.picturebutton').on('click', function( event ) {
		event.stopPropagation();
		let newbg = jQuery(this).attr('changebgto');
		// クッキー食わせる
		jQuery.cookie("background", newbg, { expires: 1000, path: pathname });
//		console.log("set cookie: background " + jQuery.cookie("background") );
		jQuery('body').removeClass().addClass( newbg ); //
		jQuery('#overlay').removeClass().addClass("bright"); //
		jQuery('.bgselector').fadeOut(500);
//		console.log("BG変更する");
	});

	// リンクのプロパゲーションを止める
	jQuery('.exitButton').on('click', function( event ) {
		event.stopPropagation();
	});

});

