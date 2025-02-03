jQuery(function(){

	// chapterナンバーを得る際に必要なオフセット
	// .novelにはIDもあるが、レガシー対応で.novel:nth-childで判定している
	// .topBar と .chapterBox が兄要素になる
	const slotOffset = 2;

	// クエリを省いたURL
	const pathname = location.pathname;

	// chapterナンバーとスクロール値のデフォルト
	// スクロール値は１が100%
	let chapterNumber = 1;
	let scrollPersent = 0;

	// 縦書きか横書きかは #bboard のクラスで判定
	// デフォルト（設定がない場合）は縦
	let mode;
	if ( jQuery("#bboard").hasClass("yoko") ){
		mode = "yoko";
	} else {
		mode = "tate";
	}

	// カレントの.novelのスロット番号を覚えておくためのバッファ
	let curchapslot = chapterNumber + slotOffset;

	// カレントのchapterのオブジェクト。
	let currentChapter = jQuery(".novel:nth-child(" + curchapslot + ")");

	// カレントの.novelの全幅・全高を覚えておく
	let sw = jQuery(currentChapter).get(0).scrollWidth;
	let sh = jQuery(currentChapter).get(0).scrollHeight;


	// =========================================================================================
	// 
	// クッキーの読み込み処理（スクロール幅計算の関係でfontだけ先に処理）
	// 

	// font
	if (jQuery.cookie("font")){
		jQuery(".novel").removeClass("minimum mini mid big bigger");
		jQuery(".fontSwitch").removeClass("pick");
		jQuery("." + jQuery.cookie("font") + "font").addClass("pick");
		jQuery(".novel").addClass(jQuery.cookie("font"));
		console.log("cookie: font is " + jQuery.cookie("font") );
	}

	// 
	// =========================================================================================
	// 

	// chapter
	console.log("――　 処理スタート");

	// クエリを格納するハッシュ
	const queryParams = {};
	const urlObject = new URL(location.href);    // URLオブジェクトを作成
	const searchParams = urlObject.searchParams; // searchParamsオブジェクトを取得

	// searchParamsをループしてハッシュに格納
	for (const [key, value] of searchParams.entries()) {
		queryParams[key] = value;
	}

	// ハッシュを分解
	const queryChapter = queryParams.c * 1;
	const queryStart = queryParams.s * 1;
	const queryStartOffset = queryParams.so * 1;
	const queryEnd = queryParams.e * 1;
	const queryEndOffset = queryParams.eo * 1;

	// クエリが存在してる場合以下のケースが考えられる
	//  ・引用へのリンク
	//  ・章へのリンク
	if ( queryChapter ){
		// 
		// クエリからチャプターが来てる
		// 
		if ( queryStart && queryEnd ){
			// 
			// queryStart と queryEnd があった場合、抜粋の処理を行う
			// 
			// chapterNumber をクエリで上書き
			chapterNumber = queryChapter * 1;

			// 
			// エラーの除去処理
			// 
			if( queryStart > queryEnd){

				let capTextError = "範囲指定が間違っているようです";
				console.log( "開始ノード" + queryStart );
				console.log( "終了ノード" + queryEnd );
				console.log( capTextError );

			// =========================================================================================
			// 
			// 抜粋モードの処理
			// 
			} else {
				// NOW 抜粋モード処理
				// まずは抜粋クラスを設定
				console.log( "抜粋クラスを設定 " );
				// 
				// テキストの一時保管用
				// 
				let targetText;
				let _beforeText;
				let _midText;
				let _afterText;
				let _finalText;
				// 
				// 開始と終了が同じノードにある場合の処理
				// 
				if ( queryStart == queryEnd ){
					console.log("開始と終了が同じノードにある場合の処理 ======================");
					// 対象のテキストを得る
					targetText = jQuery("#n-" + queryStart).html();
					// テキストを三分割する
					_beforeText = targetText.slice(0, queryStartOffset);
					_midText = targetText.slice( queryStartOffset, queryEndOffset );
					_afterText = targetText.slice( queryEndOffset );
					// 真ん中のテキストをタグで囲む
					_beforeText = '<span class="alttext" id="preHilight" altoff="0">' +  _beforeText + '</span>';
					_midText = '<span class="textHilightEdge textHilight endHilight alttext" id="startHilight" altoff="' + queryStartOffset + '">' +  _midText + '</span>';
					_afterText = '<span class="alttext" id="postHilight" altoff="' + queryEndOffset + '">' +  _afterText + '</span>';
					_finalText = _beforeText + _midText + _afterText;
					// 書き戻す
					jQuery("#n-" + queryStart).html(_finalText);

				// 
				// 開始と終了が複数ノードにまたがっている場合の処理
				// 
				} else {

					console.log("開始と終了が複数ノードにまたがっている場合の処理 ======================");

					// 開始ノードのテキストを得る
					targetText = jQuery("#n-" + queryStart).html();
					// テキストを二分割する
					_beforeText = targetText.slice(0, queryStartOffset);
					_afterText = targetText.slice(queryStartOffset);
					// テキストをタグで囲む
					_beforeText = '<span class="alttext" id="preHilight" altoff="0">' +  _beforeText + '</span>';
					_afterText = '<span class="textHilightEdge textHilight alttext" id="startHilight" altoff="' + queryStartOffset + '">' +  _afterText + '</span>';
					_finalText = _beforeText + _afterText;
					// 書き戻す
					jQuery("#n-" + queryStart).html(_finalText);

					// 終了ノードのテキストを得る
					targetText = jQuery("#n-" + queryEnd).html();
					// テキストを二分割する
					_beforeText = targetText.slice(0,queryEndOffset);
					_afterText = targetText.slice(queryEndOffset);
					// テキストをタグで囲む
					_beforeText = '<span class="textHilightEdge textHilight alttext endHilight" id="endHilight" altoff="0">' +  _beforeText + '</span>';
					_afterText = '<span class="alttext" id="postHilight" altoff="' + queryEndOffset + '">' +  _afterText + '</span>';
					_finalText = _beforeText + _afterText;
					// 書き戻す
					jQuery("#n-" + queryEnd).html(_finalText);

					// 途中のノードにクラスを追加する
					if( queryStart + 1 < queryEnd ){
						// 開始ノードの次のノードから、終了の前のノードまでループ
						for (let i = queryStart + 1; i < queryEnd; i++) {
							// textHilight クラスを追加
							targetText = jQuery("#n-" + i ).addClass("textHilight");
						}
					}
				}

				// 抜粋開始クラス（startHilight）を含む .novel クラスを得る
				// 
				let me   = jQuery( '#startHilight' );
				let jiji = jQuery( '#startHilight' ).closest(".novel");
				jQuery( jiji ).removeClass("hide");

				// 抜粋の場所までスクロールする処理
				// 
				console.log("ver 1.080");
				console.log("ーーーーーー★自分（ハイライト域）の座標:");
				const myposition = me.offset();
				console.log(`top = ${myposition.top}, left = ${myposition.left}`);

				console.log("ーーーーーー★自分（ハイライト域）の幅と高さ:");
				let myend = jQuery( '.endHilight' );
				const myendposition = myend.offset();
				let myStartWidth = jQuery(me).width();
				let myStartHeight = jQuery(me).height();
				console.log(`ハイライト域の最初の要素　top = ${myStartHeight}, left = ${myStartWidth}`);
				let myHeight = myposition.top - myendposition.top + myStartHeight ;
				let myWidth = myposition.left - myendposition.left + myStartWidth ;
				console.log("自分の横幅 = 最初の座標 - 最後の座標 + 最初の幅");
				console.log(`${myWidth} = ${myposition.left} - ${myendposition.left} + ${myStartWidth}`);
				console.log(`top = ${myHeight}, left = ${myWidth}`);

				console.log("ーーーーーー★ールートの座標:");
				const oyaposition = jiji.offset();
				console.log(`top = ${oyaposition.top}, left = ${oyaposition.left}`);

				console.log("ーーーーーー★ールートの幅と高さ:");
				let routeWidth = jQuery(jiji).width();
				let routeHeight = jQuery(jiji).height();
				console.log(`top = ${routeHeight}, left = ${routeWidth}`);

				console.log("ーーーー合計★スクロールさせる量:");
				let scrollHeight;
				let scrollWidth;
				if( myHeight > routeHeight ){
					console.log("　　　　　　自分の高さが高い");
					scrollHeight = myendposition.top - oyaposition.top - routeHeight * 0.98 + myHeight;
					console.log("自分の座標 - 親の座標 - 親の高さの98% + 自分の高さ ");
					console.log(`縦: ${myendposition.top} - ${oyaposition.top} - ${routeHeight} * 0.98 + ${myHeight}`);
					console.log(`                                         = ${scrollHeight}`);
				}else{
					console.log("　　　　　　自分の高さが低い");
					scrollHeight = myendposition.top - oyaposition.top - routeHeight * 0.5 + myHeight * 0.5;
					console.log("自分の座標 - 親の座標 - 親の高さの半分 + 自分の高さの半分 ");
					console.log(`縦: ${myendposition.top} - ${oyaposition.top} - ${routeHeight} * 0.5 + ${myHeight} * 0.5`);
					console.log(`                                         = ${scrollHeight}`);
				}
				if( myWidth > routeWidth ){
					console.log("　　　　　　自分の幅が広い");
					scrollWidth = myendposition.left - oyaposition.left - routeWidth * 0.98 + myWidth;
					console.log("自分の座標 - 親の座標 - 親の広さの98% + 自分の広さ ");
					console.log(`横: ${myendposition.left} - ${oyaposition.left} - ${routeWidth} * 098 + ${myWidth} `);
					console.log(`                                         = ${scrollWidth}`);
				}else{
					console.log("　　　　　　自分の幅が狭い");
					scrollWidth = myendposition.left - oyaposition.left - routeWidth * 0.5 + myWidth * 0.5;
					console.log("自分の座標 - 親の座標 - 親の広さの半分 + 自分の広さの半分 ");
					console.log(`横: ${myendposition.left} - ${oyaposition.left} - ${routeWidth} * 0.5 + ${myWidth} * 0.5`);
					console.log(`                                         = ${scrollWidth}`);
				}
				// 
				// スクロールの実行
				// 
				if ( mode == "tate" ){
					console.log("左へ " + scrollWidth + "スクロール");
					jQuery( jiji ).scrollLeft( scrollWidth );
				//	抜粋モードでは、cookie に scroll値を記憶しない
				}else{
					console.log("下へ " + scrollHeight + "スクロール");
					jQuery( jiji ).scrollTop( scrollHeight );
				//	抜粋モードでは、cookie に scroll値を記憶しない
				}
				// 
				// ハイライトを解除するボタンの表示（削除）
				// 
/*
				jQuery(".bottomBar .fontSwitch, .bottomBar .fontChange").addClass("away");
				jQuery(".bottomBar .stopHilight").removeClass("away");
*/
				// 
				// COOKIEの中のスクロール値を消す
				// 
				// 処理の都合上、このあとでクッキーからscrollを読み込む
				// そこで読み込まないように、ここで消しておく
				// 抜粋モードから抜けるルートは、【章チェンジ】【表紙に戻る】【その場でリロード】
				// なので、scrollクッキーはその際に設定（あるいは初期化）される
				// 
				jQuery.removeCookie('scroll',{ path: pathname });
				console.log("cookie scroll" + jQuery.cookie("scroll"));

			}
			// 
			// 抜粋モード処理 ここまで
			// 
			// 
			// =========================================================================================
		} else {
			// 抜粋処理なしで、チャプター表示
			chapterNumber = queryChapter * 1;
		}

		// 
		// クエリからチャプタ－来てたら、いずれにしても表紙は消す。
		// 
		// 0.3秒待って下記を実行
		setTimeout(() => {
			// フェード用の暗幕を消す
			jQuery('#overlay').removeClass().addClass("bright"); //
			// 表紙を消す
			jQuery('#coverimage').fadeOut(500);
		}, 300); 

	// 
	// chapter が cookieにある場合の処理
	// 
	} else if (jQuery.cookie("chapter")){
		chapterNumber = jQuery.cookie("chapter") * 1;
	}

	// 
	// ここはすべての条件判定の外側
	// 必ず通る
	// 

	// 
	// チャプター変更処理
	// chapterNumber はクッキー、もしくはクエリから来ている。あるいはデフォルト。
	// 
	chapterChange( chapterNumber + slotOffset );

	// =========================================================================================
	// 
	// クッキーの読み込み処理、続き
	// 

	// fontfamily
	if (jQuery.cookie("fontfamily")){
		const fontfamilyfromcookie = jQuery.cookie("fontfamily");
		jQuery(".novel, .fontChange").removeClass("serif sansserif").addClass( fontfamilyfromcookie );
		console.log("cookie: fontfamily is " + fontfamilyfromcookie );
	}
/*
	//
	// 縦横モード切り替えはなくしたので、クッキーも無視
	//
	// writhing-mode
	if (jQuery.cookie("tateyoko")){
		mode = jQuery.cookie("tateyoko");
		jQuery("#bboard").addClass(mode);
		console.log("cookie: writhing-mode is " + mode );
	}
*/
	// background
	if (jQuery.cookie("background")){
		const bgfromcookie = jQuery.cookie("background");
		jQuery('body').removeClass().addClass( bgfromcookie ); //
		console.log("cookie: background is " + bgfromcookie );
	}

	// scroll
	if (jQuery.cookie("scroll")){
		const scrollfromcookie = jQuery.cookie("scroll");
		if ( mode == "tate" ){
			jQuery(currentChapter).scrollLeft( scrollfromcookie );
		}else{
			jQuery(currentChapter).scrollTop( scrollfromcookie );
		}
		console.log("cookie: scroll is " + scrollfromcookie );
	}

	//
	//
	// =========================================================================================
	// 　各種イベント処理
	// =========================================================================================
	//
	//

	// 
	// ページ送り（スクロール）処理
	// 
	jQuery(".novel").click(function(e){
		// 
		// 範囲が選択されている場合は処理しない
		// 
		const selection = window.getSelection();
		if( selection.toString().length ){ return; }
		// 
		//	オプションバー表示されてたら閉じる
		// 
		if( jQuery('.optionBar').hasClass("show") ){
			console.log("――　 オプションバーを閉じる");
			jQuery('.optionBar').removeClass("show");
			jQuery('.optionBar').slideUp(200);
		}

		// 
		// ここから処理
		// 
		let next;
		// 親要素基準のX座標
		const offsetX = e.pageX - jQuery(this).offset().left;
		// 親要素基準のY座標
		const offsetY = e.pageY - jQuery(this).offset().top;
		const ww = jQuery(this).width();
		const sx = jQuery(this).scrollLeft();
		const hh = jQuery(this).height();
		const sy = jQuery(this).scrollTop();

		if ( mode == "tate" ){
			if( offsetX + jQuery(this).offset().left - jQuery(this).offset().left < ww * 0.2 ){
				next = sx - ww * 0.92;
			} else if( offsetX + jQuery(this).offset().left - jQuery(this).offset().left > ww * 0.8 ){
				next = sx + ww * 0.92;
			} else {
				// .excitation のトグル。onになっていると、翻訳テキストのあるものが浮かび上がる。
				jQuery("body").toggleClass("excitation");
			}
			let sw = jQuery(this).get(0).scrollWidth;
			scrollPersent = next / sw;
			jQuery(this).animate({scrollLeft: next});
		}else{
			if( offsetY + jQuery(this).offset().top - jQuery(this).offset().top < hh * 0.2 ){
				next = sy - hh * 0.92;
			} else if( offsetY + jQuery(this).offset().top - jQuery(this).offset().top > hh * 0.8 ){
				next = sy + hh * 0.92;
			} else {
				// .excitation のトグル。onになっていると、翻訳テキストのあるものが浮かび上がる。
				jQuery("body").toggleClass("excitation");
			}
			let sh = jQuery(this).get(0).scrollHeight;
			scrollPersent = next / sh ;
			jQuery(this).animate({scrollTop: next});
		}
		jQuery.cookie("scroll", next, { expires: 1000, path: pathname });
	});
	// 
	// おまけ。外からマウスが乗ったら、強制的に.excitationをon。気が付かせるために。
	// 
	jQuery(".novel").mouseenter(function(){
		jQuery("body").addClass("excitation");
	});
	jQuery(".novel").mouseleave(function(){
		jQuery("body").removeClass("excitation");
	});

	// 
	// 文字を選択したらオプションウインドウを開く
	// 
	document.addEventListener("selectionchange", function() {

		// マウスボタンを離した際に文字列を選択していたら、オプションバーを開く
		const selection = window.getSelection();
		if (selection.rangeCount > 0 && selection.toString()) {
			console.log("Selected Text:", selection.toString());
			jQuery('.thistext').addClass("haveachoice");

			//	オプションバー表示されてたら何もしない（多分そのケースはない）
			if( jQuery('.optionBar').hasClass("show") ){
				console.log("――　 オプションバーは開かれている");

			//	オプションバー非表示だった場合
			} else {
				console.log("――　 文字の選択でオプションバーを開く");
				jQuery(".makelink").removeClass('touch');

				// バーの表示
				jQuery('.optionBar').addClass("show");
				jQuery('.optionBar').css('display', 'flex').hide().slideDown(200);
			}
		}
	});

	// 
	// ハイライト解除（　このボタンは非表示　）
	// 
	jQuery(".stopHilight").click(function( event ){
		event.stopPropagation();
		chapterNumber = 1;
		scrollPersent = 0;
		jQuery('#overlay').removeClass().addClass("dark"); //
		jQuery('#coverimage').fadeIn(500);
		doScroll( scrollPersent );
		chapterChange( chapterNumber + slotOffset );
		console.log("最初に戻る");
	});

	// 
	// 文字変更ボタン
	// 
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
		console.log("set cookie: fontfamily " + jQuery.cookie("fontfamily"));
	});

	// 
	// 文字サイズボタン
	// 
	jQuery(".fontSwitch").click(function( event ){
		event.stopPropagation();
		console.log("――　 文字サイズボタン");
		// 
		// スクロール値の調整のため、まずは座標をパーセンテージで取得
		// 
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
		console.log("set cookie to " + pathname + "-------");
		console.log("set cookie: font " + jQuery.cookie("font") );

		// ボタンのハイライト（永続）
		jQuery(".fontSwitch").removeClass("pick");
		jQuery(this).addClass("pick");

		// スクロール位置を再セットする
		doScroll( scrollPersent );
	});

	// 
	// 章送り戻しボタン
	// 
	jQuery(".novel .back,.novel .forward").click(function(){
		console.log("――　 章送り戻しボタン");
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

	});

	// 
	// 章切り替え
	// 
	jQuery(".chapterJump").click(function( event ){
		console.log("――　 章切り替え");
		event.stopPropagation();
		chapterNumber = jQuery(this).attr("chapter") * 1;

		// 実行
		chapterChange( chapterNumber + slotOffset );

		// ウインドウ閉じる
		jQuery(".chapterBox").slideUp(200);

	});

	// 
	// 目次ボタン
	// 
	jQuery(".topBar").click(function( event ){
		console.log("――　 目次ボタン");
		event.stopPropagation();
		jQuery(".chapterBox").slideToggle(200);
	});

	// 
	// ボトムバーのクリック（オプションバーを開く）
	// 
	jQuery(".bottomBar").click(function(){

		//	オプションバー表示されてたら閉じる
		if( jQuery('.optionBar').hasClass("show") ){
			console.log("――　 オプションバーを閉じる");
			jQuery('.optionBar').removeClass("show");
			jQuery('.optionBar').slideUp(200);

		//	オプションバー非表示だった場合
		} else {
			console.log("――　 ボトムバーのクリックでオプションバーを開く");
			jQuery(".makelink").removeClass('touch');

			// オプションバーを開く際に、文字列を選択していたら、
			// 【選択範囲へのリンクをクリップボードにコピーする】が有効になる
			const selection = window.getSelection();
			if (selection.rangeCount > 0 && selection.toString()) {
				console.log("Selected Text:", selection.toString());
				jQuery('.thistext').addClass("haveachoice");
			} else {
				console.log("No text is selected.");
				jQuery('.thistext').removeClass("haveachoice");
			}

			// バーの表示
			jQuery('.optionBar').addClass("show");
			jQuery('.optionBar').css('display', 'flex').hide().slideDown(200);
		}
	});

	// 
	// オプションバーのマウスアウト（オプションバーを閉じる）
	// 
	jQuery(".optionBar").mouseout(function( event ){
		// 
		// 移動先が novel だった場合のみ処理
		// 
		const relatedTarget = event.relatedTarget;
		if( jQuery(relatedTarget).hasClass("novel") ){
			console.log("――　 オプションバーを閉じる");
			// バーを閉じる
			jQuery('.optionBar').removeClass("show");
			jQuery('.optionBar').slideUp(200);
		}
	});

	// 
	// オプションバーのクリック（オプションバーを閉じる）
	// 
	jQuery(".optionBar").click(function(){
		console.log("――　 オプションバーを閉じる");
		jQuery('.optionBar').removeClass("show");
		jQuery('.optionBar').slideUp(200);
	});

	// 
	// リンク作成ボタン
	// 
	jQuery(".makelink").click(function( event ){
		event.stopPropagation();
		console.log("――　 リンク作成ボタン");

		let url = location.origin + location.pathname;
		let title = document.title;
		let anouncemessage;

		// この本のリンクをクリップボードにコピーする
		//
		if ( jQuery(this).hasClass('thisbook') ){
			// 本のURL
			const metaDescription = document.querySelector('meta[name="description"]');
			let content;
			if (metaDescription) {
				content = metaDescription.getAttribute('content');
			}
			let url2book = "《" + title + "》\n" + content + "\n" + url;
			navigator.clipboard.writeText(url2book);
			url2book = "《" + title + "》<br>" + content + "<br><a href='" + url + "'>" + url + "</a>";
			anouncemessage = "クリップボードに <strong>この本</strong> のリンクをコピーしました<hr/>" + url2book;

		// この章のリンクをクリップボードにコピーする
		//
		} else if ( jQuery(this).hasClass('thischapter') ){
			// チャプターのURL
			let mytitle = jQuery(currentChapter).find("h3").html();
			let url2chapter = "《" + title + "》より 「" + mytitle + "」\n" + url + "?c=" + chapterNumber;
			navigator.clipboard.writeText(url2chapter);
			url2chapter = "《" + title + "》より 「" + mytitle + "」<br><a href='" + url  + "?c=" + chapterNumber + "'>" + url + "?c=" + chapterNumber + "</a>";
			anouncemessage = "クリップボードに <strong>この章</strong> のリンクをコピーしました<hr/>" + url2chapter;

		// 選択範囲へのリンクをクリップボードにコピーする
		//
		} else if ( jQuery(this).hasClass('haveachoice') ){

			// 選択範囲を得る
			let selection = window.getSelection();
			let range = selection.getRangeAt(0);
			// ここからルビを抜く処理
			// 一時的にHTML化
			let container = document.createElement("div");
			container.appendChild(range.cloneContents());
			// タグ付きテキストを返す
			let selectedText = container.innerHTML;
			// ルビ（テキスト込み）を削除
			selectedText = selectedText.replace(/<rt[^\/]+\/rt>/gi, "");
			// ローカライズテキストの削除
			selectedText = selectedText.replace(/<span class="trtext".+?span>/gi, "");
			// 他のタグを削除するかどうするか
			// 各書類に書かれた関数をコールバックする
			let trimedtext;
			try {
				trimedtext = anounceMessageProcessingCallback( selectedText );
			// コールバック関数がない場合、すべてのタグとタブを除去
			} catch ( error ) {
				trimedtext = selectedText.replace(/<[^>]+>/gi, "").replace(/\t/gi, "");
			}

			// ここまでルビ抜き処理
			// デバッグ用
			console.log( "選択した文字列: " + trimedtext );
			// 文字列の長さを取得
			let textLength = trimedtext.length; 
			let captureerror = 0;
			// 選択した文字列があったら処理
			if (selection.rangeCount > 0) {

				// 最初の選択範囲を取得
				let range = selection.getRangeAt(0); 

				// 開始ノードと終了ノードを取得
				let startNode = range.startContainer.parentNode;
				let endNode = range.endContainer.parentNode;

				// IDを取得（IDがない場合はエラー積み上げ）
				let startNodeId = startNode.id || captureerror++;
				let endNodeId = endNode.id || captureerror++;

				// ハイライト部分を選択したら特殊処理
				let rangeStart = range.startOffset;
				let rangeEnd = range.endOffset;
				if(jQuery("#" + startNodeId ).hasClass("alttext")){
					rangeStart += jQuery("#" + startNodeId ).attr("altoff") * 1;
					startNodeId = jQuery("#" + startNodeId ).parent().attr("id");
				}
				if(jQuery("#" + endNodeId ).hasClass("alttext")){
					rangeEnd += jQuery("#" + endNodeId ).attr("altoff") * 1;
					endNodeId = jQuery("#" + endNodeId ).parent().attr("id");
				}
				// ハイライトの特殊処理　ここまで

				//
				// エラーあったらエラー出力のみ
				if( captureerror ){
					anouncemessage = "選択範囲が、ルビや縦中横、改行文字などから始まる（終わる）場合、この機能は使用できません";

				//
				// エラーがなかったら本処理
				} else {
					// 表示する抜粋の長さ
					let caplength = 220;
					// 選択した文字列が長い場合、詰める
					if( caplength < textLength ) {
						trimedtext = trimedtext.slice(0,caplength) + "……";
					}
					// クリップボードにコピーする文字列を作成
					let title = document.title;
					let url = location.origin + location.pathname;
					let startpos = startNodeId.replace(/\D/g, "");
					let endpos = endNodeId.replace(/\D/g, "");
					let pretext;
					pretext = "《" + title + "》より\n" + trimedtext + "\n";
					let urlfull =  url 
						+ "?c=" + chapterNumber 
						+ "&s=" + startpos
						+ "&so=" + rangeStart
						+ "&e=" + endpos
						+ "&eo=" + rangeEnd;
					let url2text = pretext + urlfull;
					navigator.clipboard.writeText(url2text);

					// アナウンス用の文字列を作成
					pretext = "《" + title + "》より<br>" + trimedtext.replace(/\n/g, "<br>") + "<br>";
					url2text = pretext + "<a href='" + urlfull + "'>" + urlfull + "</a>";
					anouncemessage = "クリップボードに<strong>選択した文章</strong>へのリンクをコピーしました<hr/>" + url2text ;
				}
			//
			// 選択した文字列がない
			//
			} else {
				anouncemessage = "選択範囲へのリンクをクリップボードにコピーできませんでした";
			}
		//
		// 押されたボタンがthisbook でも thischapter でも haveachoice でもない（？）
		//
		} else {
			anouncemessage = "リンクをクリップボードにコピーできませんでした";
		}
		//
		// 結果のアナウンス
		//
		jQuery('#anouncebox .voice').html(anouncemessage);
		jQuery('#anouncebox').css('display', 'flex').hide().fadeIn(500);

		// ボタンをフラッシュさせる
		// 設定したtouchクラスは、アナウンスを消す際に除去される
		jQuery(this).addClass('touch');

		// オプションバー閉じる
		jQuery('.optionBar').removeClass("show");
		jQuery('.optionBar').slideUp(500);
	});

	// 
	// アナウンスをクリック（消す）
	// 
	jQuery("#anouncebox").click(function( event ){
		event.stopPropagation();
		console.log("――　 アナウンスを消す");
		jQuery( this ).fadeOut(200);
		jQuery(".makelink").removeClass('touch');
		jQuery('.optionBar').removeClass("show");
		jQuery('.optionBar').slideUp(200);
	});

/*
	// 縦横ボタン
	// 最新バージョンでは未使用のため、動作チェックなし
	jQuery(".tateyoko").click(function( event ){
		console.log("――　 縦横ボタン");
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
		console.log("set cookie: tateyoko " + jQuery.cookie("tateyoko"));
		// スクロール再セット
		scrollPersent *= -1;
		doScroll(scrollPersent);
	});
*/
	// 
	// 文字表示面のクリック（スクロール処理）
	// 
	jQuery(".novel").scroll(function(){
		console.log("――　 スクロール");
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
		console.log("――　 ボードの拡大");
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
	// 
	// ウインドウがリサイズされたときの処理
	// 
	jQuery(window).resize(function() {
		console.log("――　 リサイズ処理");
		var target = jQuery('#bboard');
		if(jQuery(target).css('position') == "fixed"){
			jQuery(target).css({top: 0});
			jQuery(target).css({width: jQuery(window).width()});
			jQuery(target).css({left: 0});
			jQuery(target).css({height: window.innerHeight});
		}
	});

	// 
	// 表紙を消す
	// 
	jQuery('#coverimage').on('click', function( event ) {
		event.stopPropagation();
		jQuery(".novel:nth-child("+ chapterNumber + slotOffset +")").removeClass("hide");
		jQuery('#overlay').removeClass().addClass("bright"); //
		jQuery(this).fadeOut(500);
		console.log("表紙消す");
	});

	// 
	// ヘルプを表示
	// 
	jQuery('#showhelp').on('click', function( event ) {
		event.stopPropagation();
		jQuery('#overlay').removeClass().addClass("dark"); //
		jQuery('#helpbox').css('display', 'flex').hide().fadeIn(500);
		console.log("ヘルプを表示");
	});

	// 
	// ヘルプを消す
	// 
	jQuery('#helpbox').on('click', function( event ) {
		event.stopPropagation();
		jQuery('#overlay').removeClass().addClass("bright"); //
		jQuery(this).fadeOut(500);
		console.log("ヘルプを消す");
	});

	// 
	// 最初に戻る
	// 
	jQuery('#gotostart').on('click', function( event ) {
		event.stopPropagation();
		chapterNumber = 1;
		scrollPersent = 0;
		jQuery('#overlay').removeClass().addClass("dark"); //
		jQuery('#coverimage').fadeIn(500);
		doScroll( scrollPersent );
		chapterChange( chapterNumber + slotOffset );
		console.log("最初に戻る");

	});

	// 
	// BGセレクターを消す
	// 
	jQuery('.bgselector').on('click', function( event ) {
		event.stopPropagation();
		jQuery('#overlay').removeClass().addClass("bright"); //
		jQuery(this).fadeOut(500);
		console.log("BGセレクターを消す");
	});

	// BGセレクターを表示
	jQuery('.configButton').on('click', function( event ) {
		event.stopPropagation();
		jQuery('#overlay').removeClass().addClass("dark"); //
		jQuery('.bgselector').css('display', 'flex').hide().fadeIn(500);
		console.log("BGセレクターを表示");
	});

	// 
	// BGを変更する
	// 
	jQuery('.picturebutton').on('click', function( event ) {
		event.stopPropagation();
		let newbg = jQuery(this).attr('changebgto');
		// クッキー食わせる
		jQuery.cookie("background", newbg, { expires: 1000, path: pathname });
		console.log("set cookie: background " + jQuery.cookie("background") );
		jQuery('body').removeClass().addClass( newbg ); //
		jQuery('#overlay').removeClass().addClass("bright"); //
		jQuery('.bgselector').fadeOut(500);
		console.log("BG変更する");
	});


	jQuery(".trto").mouseover(function() {
		jQuery(".translatebox").removeClass("away").addClass("comeback");
		const trcontenerID = jQuery(this).attr("trtext");
		const transText = jQuery( "#" + trcontenerID ).html();
		jQuery(".translatebox").html(transText);
	});
	jQuery(".trto").mouseout(function() {
		jQuery(".translatebox").removeClass("comeback").addClass("away");
	});

	// リンクのプロパゲーションを止める
	jQuery('.exitButton').on('click', function( event ) {
		event.stopPropagation();
	});

	//
	//
	// =========================================================================================
	// 　各種関数
	// =========================================================================================
	//
	//

	// 章切り替えの中身
	function chapterChange( slot ){
		console.log("――　 章切り替え実行 " + slot );
		jQuery(".novel").addClass("hide");

		// cookie
		jQuery.cookie("chapter", chapterNumber, { expires: 1000, path: pathname });
		console.log("set cookie: chapter " + jQuery.cookie("chapter"));

		jQuery(".novel:nth-child("+slot+")").removeClass("hide");
		currentChapter = jQuery(".novel:nth-child("+slot+")");

		// 章タイトル更新
		let mytitle = jQuery(currentChapter).find("h3").html();
		// topBar に章タイトルを表示
		jQuery(".myTitle").html(mytitle);
		console.log("currentChapter = " + mytitle);
	}

	// スクロール
	function doScroll( percent ){
		console.log("――　 スクロール実行");
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

});

