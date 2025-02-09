jQuery( function(){

	// クエリを省いたURL（ほぼcookie用）
	const PathName = location.pathname;

	// chapterナンバーを得る際に必要なオフセット
	// .novelは.novel:nth-childで判定しているため.topBar と .chapterBox が兄要素になる
	const SlotOffset = 2;

	// chapterナンバーのデフォルト。章変更で変わる。
	let chapterNumber = 1;

	// カレントのchapterのオブジェクト。
	// 中身はチャプターが決定した時点で設定。
	let currentChapter;

	// 縦書きか横書きかは #bboard のクラスで判定
	// デフォルト（設定がない場合）は縦
	const MODE = (() => {
		if ( jQuery( "#bboard" ).hasClass( "yoko" ) ){
			return "yoko";
		} else {
			return "tate";
		}
	})();

	// クリック時にページが移動する距離
	const PageMoveRate = 0.92;
	// クリック時にページ移動として感知する範囲
	const FlipRange    = 0.2;

	// ================================================================================================= //
	// 
	// クッキーの読み込み処理（スクロール幅計算の関係でfontだけ先に処理）
	// 
	if ( jQuery.cookie( "font" )){

		// メインの小説ページの文字の大きさクラスを、とりあえず全部取り除いて再設定
		jQuery( ".novel" ).removeClass( "minimum mini mid big bigger" ).addClass( jQuery.cookie( "font" ));

		// フォント選択ボタン（fontSwitchクラス）のハイライトを取り除く
		jQuery( ".fontSwitch" ).removeClass( "pick" );

		// フォント選択ボタン（個別のボタン）をハイライトさせる
		jQuery( "." + jQuery.cookie( "font" ) + "font" ).addClass( "pick" );
	}

	// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
	//  　　　　　　　　　　　　　　　　　　　　 　メイン処理　　　　　　　　　　　　　　　　　　　　　　 //
	// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

	// クエリを格納するハッシュ
	let queryParams = { };
	const urlObject = new URL( location.href );    // URLオブジェクトを作成
	const searchParams = urlObject.searchParams;   // searchParamsオブジェクトを取得

	// searchParamsをループしてハッシュに格納
	for ( const [ key, value ] of searchParams.entries() ) {
		queryParams[ key ] = Number( value );
	}

	// クエリが存在してる場合以下のケースが考えられる
	//  ・引用へのリンク
	//  ・章へのリンク

	// クエリにはかならずチャプター番号（queryParams.c）が入っている
	// 本来ならsearchParams.toString()でチェックすべきだけど、どうせqueryParams.cもチェックするので略
	if ( queryParams.c ){
		// queryParams.c = チャプター番号

		if ( queryParams.s && queryParams.e ){
			// 
			// queryParams.s（開始ノード） と queryParams.e（終了ノード） があった場合、
			// 抜粋（引用部分ハイライト）の処理を行う
			// 
			let capTextError;
			if( queryParams.s > queryParams.e ){
				// エラーの除去処理（現状では最低限、思いついたものだけ）
				capTextError = "範囲指定が間違っているようです";
				console.log( capTextError );
			} 

			if ( !capTextError ) {
				// 開始と終了が同じノードにある場合の処理
				if ( queryParams.s == queryParams.e ){
					hilightProcess_01( queryParams );
				}
				// 開始と終了が複数ノードにまたがっている場合の処理
				else {
					hilightProcess_02( queryParams );
				}
				// 抜粋の場所までスクロールする
				moveToHilight();
			}
		}
		// クエリからチャプタ－来てたら、いずれにしても0.3秒待って表紙を消す。
		setTimeout(() => {
			// フェード用の暗幕を消す
			jQuery( '#overlay' ).removeClass().addClass( "bright" );
			// 表紙を消す
			jQuery( '#coverimage' ).fadeOut( 500 );
		}, 300 ); 

		// クエリからチャプターが来てる場合、chapterNumber をクエリで上書き
		chapterNumber = queryParams.c;

	} else if ( jQuery.cookie( "chapter" )){
		// chapter がクエリから来ていなかったら cookie からchapterを得る
		chapterNumber = jQuery.cookie( "chapter" ) * 1;
	}

	// チャプター変更処理
	// chapterNumber はクッキー、もしくはクエリから来ている。あるいはデフォルト。
	currentChapter = chapterChange( chapterNumber );

	// ================================================================================================= //
	// 
	//  クッキーの読み込み処理、続き
	// 

	// fontfamily
	if ( jQuery.cookie( "fontfamily" )){
		const fontfamilyfromcookie = jQuery.cookie( "fontfamily" );
		jQuery( ".novel, .fontChange" ).removeClass( "serif sansserif" ).addClass( fontfamilyfromcookie );
	}

	// background
	if ( jQuery.cookie( "background" )){
		const bgfromcookie = jQuery.cookie( "background" );
		jQuery( 'body' ).removeClass().addClass( bgfromcookie ); //
	}

	// scroll
	if ( jQuery.cookie( "scroll" )){
		const scrollfromcookie = jQuery.cookie( "scroll" );
		setScrollPosByDistance( currentChapter, scrollfromcookie );
	}

	// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
	//  　　　　　　　　　　　　　　　　　　　　メイン処理ここまで　　　　　　　　　　　　　　　　　　　　//
	// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

	// ================================================================================================= //
	// 　各種イベント処理
	// ================================================================================================= //
	//
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　.novel（電子書籍本文部分）
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	//
	// -------------------------------------- // 
	// 　ページ送り（スクロール）処理
	// -------------------------------------- // 
	jQuery( ".novel" ).click( function( e ){

		// 範囲が選択されている場合は処理しない
		const selection = window.getSelection();
		if( selection.toString().length ){ return; }

		//	オプションバー表示されてたら閉じる
		if( jQuery( '.optionBar' ).hasClass( "show" ) ){
			jQuery( '.optionBar' ).removeClass( "show" );
			jQuery( '.optionBar' ).slideUp( 200 );
		}

		// 	翻訳ウインドウ閉じて、ハイライト戻す
		if ( jQuery( ".translatebox" ).hasClass( "comeback" ) ){
			jQuery( ".translatebox" ).removeClass( "comeback" ).addClass( "away" );
			jQuery( ".trto" ).removeClass( "pick" );
//			return;
		}

		// 
		// セットアップ ---------------------
		// 
		// スクロール先
		let next;
		// 親要素基準のX座標
		const offsetX      = e.pageX - jQuery( this ).offset().left;
		// 親要素基準のY座標
		const offsetY      = e.pageY - jQuery( this ).offset().top;
		const windowwidth  = jQuery( this ).width();
		const scrollposx   = jQuery( this ).scrollLeft();
		const windowheight = jQuery( this ).height();
		const scrollposy   = jQuery( this ).scrollTop();
		// 
		// スクロール値計算 -----------------
		// 
		if ( MODE == "tate" ){
			if( offsetX + jQuery( this ).offset().left - jQuery( this ).offset().left < windowwidth * FlipRange ){
				next = scrollposx - windowwidth * PageMoveRate;
			} else if( offsetX + jQuery( this ).offset().left - jQuery( this ).offset().left > windowwidth * ( 1 - FlipRange ) ){
				next = scrollposx + windowwidth * PageMoveRate;
			}
		}else{
			if( offsetY + jQuery( this ).offset().top - jQuery( this ).offset().top < windowheight * FlipRange ){
				next = scrollposy - windowheight * PageMoveRate;
			} else if( offsetY + jQuery( this ).offset().top - jQuery( this ).offset().top > windowheight * ( 1 - FlipRange ) ){
				next = scrollposy + windowheight * PageMoveRate;
			}
		}
		setScrollPosWithAnimation( currentChapter, next );
	} );

	// -------------------------------------- // 
	// 　ページ送り（スクロール）処理（キー押下）
	// -------------------------------------- // 
	jQuery( document ).keydown( function( e ) {
		// 
		//	オプションバー表示されてたら閉じる
		if( jQuery( '.optionBar' ).hasClass( "show" ) ){
			jQuery( '.optionBar' ).removeClass( "show" );
			jQuery( '.optionBar' ).slideUp( 200 );
		}
		// 
		// セットアップ ---------------------
		// 
		let next;
		const windowwidth  = jQuery( currentChapter ).width();
		const scrollposx   = jQuery( currentChapter ).scrollLeft();
		const windowheight = jQuery( currentChapter ).height();
		const scrollposy   = jQuery( currentChapter ).scrollTop();
		// 
		// スクロール値計算 -----------------
		// 
		if ( MODE == "tate" ){
			if ( e.key === "ArrowLeft" ) {
				next = scrollposx - windowwidth * PageMoveRate;
			} else if ( e.key === "ArrowRight" ) {
				next = scrollposx + windowwidth * PageMoveRate;
			}
		} else {
			if ( e.key === "ArrowUp" ) {
				next = scrollposy - windowheight * PageMoveRate;
			} else if ( e.key === "ArrowDown" ) {
				next = scrollposy + windowheight * PageMoveRate;
			}
		}
		setScrollPosWithAnimation( currentChapter, next );
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　文字を選択したらオプションウインドウを開く
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	document.addEventListener( "selectionchange", function() {

		// マウスボタンを離した際に文字列を選択していたら、オプションバーを開く
		const selection = window.getSelection();
		if ( selection.rangeCount > 0 && selection.toString()) {

			jQuery( '.thistext' ).addClass( "haveachoice" );

			//	オプションバー非表示だった場合
			if( !jQuery( '.optionBar' ).hasClass( "show" ) ){
				// ハイライトを戻す
				jQuery( ".makelink" ).removeClass( 'touch' );
				// バーの表示
				jQuery( '.optionBar' ).addClass( "show" );
				jQuery( '.optionBar' ).css( 'display', 'flex' ).hide().slideDown( 200 );

				// 	翻訳ウインドウ閉じて、ハイライト戻す
				jQuery( ".translatebox" ).removeClass( "comeback" ).addClass( "away" );
				jQuery( ".trto" ).removeClass( "pick" );
			}
		}
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　文字変更ボタン
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( ".fontChange" ).click( function( event ){
		let _fontfamily;
		event.stopPropagation();
		if( jQuery( this ).hasClass( "serif" ) ){
			_fontfamily = "sansserif";
		} else {
			_fontfamily = "serif";
		}
		jQuery( ".novel" ).removeClass( "serif sansserif" ).addClass( _fontfamily );
		jQuery( this ).removeClass( "serif sansserif" ).addClass( _fontfamily );
		jQuery.cookie( "fontfamily", _fontfamily, { expires: 1000, path: PathName } );
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　文字サイズボタン
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( ".fontSwitch" ).click( function( event ){
		event.stopPropagation();

		// スクロール値の調整のため、まずは座標をパーセンテージで取得
		let scrollPersent;
		if ( MODE == "tate" ){
			const novelPageWidth  = jQuery( currentChapter ).get( 0 ).scrollWidth;
			scrollPersent   = jQuery( currentChapter ).scrollLeft() / novelPageWidth;
		}else{
			const novelPageHeight = jQuery( currentChapter ).get( 0 ).scrollHeight;
			scrollPersent   = jQuery( currentChapter ).scrollTop() / novelPageHeight;
		}

		// 押されたボタンを識別
		let size;
		if( jQuery( this ).hasClass( "biggerfont" )) { size = "bigger"; }
		if( jQuery( this ).hasClass( "bigfont" ))    { size = "big";    }
		if( jQuery( this ).hasClass( "midfont" ))    { size = "mid";    }
		if( jQuery( this ).hasClass( "minifont" ))   { size = "mini";   }
		if( jQuery( this ).hasClass( "minimumfont" )){ size = "minimum";}

		// クラスを剥がして再付与
		jQuery( ".novel" ).removeClass( "minimum mini mid big bigger" ).addClass( size );

		// クッキー食わせる
		jQuery.cookie( "font", size, { expires: 1000, path: PathName } );

		// ボタンのハイライト
		jQuery( ".fontSwitch" ).removeClass( "pick" );
		jQuery( this ).addClass( "pick" );

		// スクロール位置を再セットする
		setScrollPosByPercent( currentChapter, scrollPersent );
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　章送り戻しボタン
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( ".novel .back,.novel .forward" ).click( function( event ){

		event.stopPropagation();
		let scrollPersent;

		// 次へ
		if( jQuery( this ).hasClass( "forward" )){
			chapterNumber++;
			scrollPersent = 0;

		// 戻る
		}else{
			chapterNumber--;
			if( MODE == "tate" ){
				scrollPersent = -1;
			}else{
				scrollPersent = 1;
			}
		}

		// 章変更の実行
		currentChapter = chapterChange( chapterNumber );
		// スクロールのセット
		setScrollPosByPercent( currentChapter, scrollPersent );
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　章切り替え（メニューより）
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( ".chapterJump" ).click( function( event ){
		event.stopPropagation();
		chapterNumber = jQuery( this ).attr( "chapter" ) * 1;
		// 実行
		currentChapter = chapterChange( chapterNumber );
		// ウインドウ閉じる
		jQuery( ".chapterBox" ).slideUp( 200 );
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　目次ボタン（topBarを開く）
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( ".topBar" ).click( function( event ){
		event.stopPropagation();
		jQuery( ".chapterBox" ).slideToggle( 200 );
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　ボトムバーのクリック（オプションバーの開閉）
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( ".bottomBar" ).click( function(){

		//	オプションバー表示されてたら閉じる
		if( jQuery( '.optionBar' ).hasClass( "show" ) ){
			jQuery( '.optionBar' ).removeClass( "show" );
			jQuery( '.optionBar' ).slideUp( 200 );

		//	オプションバー非表示だった場合
		} else {
			jQuery( ".makelink" ).removeClass( 'touch' );

			// オプションバーを開く際に、文字列を選択していたら、
			// 【選択範囲へのリンクをクリップボードにコピーする】が有効になる
			const selection = window.getSelection();
			if ( selection.rangeCount > 0 && selection.toString()) {
				jQuery( '.thistext' ).addClass( "haveachoice" );
			} else {
				jQuery( '.thistext' ).removeClass( "haveachoice" );
			}

			// バーの表示
			jQuery( '.optionBar' ).addClass( "show" );
			jQuery( '.optionBar' ).css( 'display', 'flex' ).hide().slideDown( 200 );

			// 	翻訳ウインドウ閉じて、ハイライト戻す
			jQuery( ".translatebox" ).removeClass( "comeback" ).addClass( "away" );
			jQuery( ".trto" ).removeClass( "pick" );

		}
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　オプションバー操作
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// -------------------------------------- // 
	// 　mouseoutで閉じる。
	// -------------------------------------- // 
	jQuery( ".optionBar" ).mouseout( function( event ){
		// 移動先が novel だった場合のみ処理
		const relatedTarget = event.relatedTarget;
		if( jQuery( relatedTarget ).hasClass( "novel" ) ){
			// バーを閉じる
			jQuery( '.optionBar' ).removeClass( "show" );
			jQuery( '.optionBar' ).slideUp( 200 );
		}
	} );
	// -------------------------------------- // 
	// 　clickで閉じる。
	// -------------------------------------- // 
/*
	jQuery( ".optionBar" ).click( function( event ){
		event.stopPropagation();
		jQuery( '.optionBar' ).removeClass( "show" );
		jQuery( '.optionBar' ).slideUp( 200 );
	} );
*/
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// リンク作成ボタン
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( ".makelink" ).on('pointerdown', function( event ){
		event.preventDefault(); 
		event.stopPropagation();

		let url   = location.origin + location.pathname;
		let title = document.title;
		let anouncemessage;

		// この本のリンクをクリップボードにコピーする
		if ( jQuery( this ).hasClass( 'thisbook' ) ){
			// 本のURL
			const metaDescription = document.querySelector( 'meta[name="description"]' );
			let content;
			if ( metaDescription ) {
				content          = metaDescription.getAttribute( 'content' );
			}
			let url2book         = "《" + title + "》\n" + content + "\n" + url;
			navigator.clipboard.writeText( url2book );
			url2book             = "《" + title + "》<br>" + content + "<br><a href='" + url + "'>" + url + "</a>";
			anouncemessage       = "クリップボードに <strong>この本</strong> のリンクをコピーしました<hr/>" + url2book;

		// この章のリンクをクリップボードにコピーする
		} else if ( jQuery( this ).hasClass( 'thischapter' ) ){
			// チャプターのURL
			let mytitle         = jQuery( currentChapter ).find( "h3" ).html();
			let url2chapter     = "《" + title + "》より 「" + mytitle + "」\n" + url + "?c=" + chapterNumber;
			navigator.clipboard.writeText( url2chapter );
			url2chapter         = "《" + title + "》より 「" + mytitle + "」<br><a href='" + url  + "?c="
								 + chapterNumber + "'>" + url + "?c=" + chapterNumber + "</a>";
			anouncemessage      = "クリップボードに <strong>この章</strong> のリンクをコピーしました<hr/>" + url2chapter;

		// 選択範囲へのリンクをクリップボードにコピーする
		} else if ( jQuery( this ).hasClass( 'haveachoice' ) ){
			// 選択範囲を得る
			const selection     = window.getSelection();
			const range         = selection.getRangeAt( 0 );
			// ここからルビを抜く処理
			// 一時的にHTML化
			let container       = document.createElement( "div" );
			container.appendChild( range.cloneContents());
			// タグ付きテキストを返す
			let selectedText    = container.innerHTML;
			// ルビ（テキスト込み）を削除
			selectedText        = selectedText.replace(/<rt[^\/]+\/rt>/gi, "" );
			// ローカライズテキストの削除
			selectedText        = selectedText.replace(/<span class="trtext".+?span>/gi, "" );
			// 他のタグを削除するかどうするか、各書類に書かれた関数をコールバックする
			let trimedtext;
			try {
				trimedtext      = anounceMessageProcessingCallback( selectedText );
			// コールバック関数がない場合、すべてのタグとタブを除去
			} catch ( error ) {
				trimedtext      = selectedText.replace(/<[^>]+>/gi, "" ).replace(/\t/gi, "" );
			}
			// ここまでルビ抜き処理
			// 文字列の長さを取得
			let textLength      = trimedtext.length; 
			let captureerror    = 0;
			// 選択した文字列があったら処理
			if ( selection.rangeCount > 0 ) {
				// 開始ノードと終了ノードを取得
				const startNode = range.startContainer.parentNode;
				const endNode   = range.endContainer.parentNode;
				// IDを取得（IDがない場合はエラー積み上げ）
				let startNodeId = startNode.id || captureerror++;
				let endNodeId   = endNode.id || captureerror++;
				// ハイライト部分を選択したら特殊処理
				let rangeStart  = range.startOffset;
				let rangeEnd    = range.endOffset;
				if( jQuery( "#" + startNodeId ).hasClass( "alttext" )){
					rangeStart  += jQuery( "#" + startNodeId ).attr( "altoff" ) * 1;
					startNodeId =  jQuery( "#" + startNodeId ).parent().attr( "id" );
				}
				if( jQuery( "#" + endNodeId ).hasClass( "alttext" )){
					rangeEnd    += jQuery( "#" + endNodeId ).attr( "altoff" ) * 1;
					endNodeId   =  jQuery( "#" + endNodeId ).parent().attr( "id" );
				}
				//
				// エラーあったらエラー出力のみ
				if( captureerror ){
					anouncemessage = "選択範囲が、ルビや縦中横、改行文字などから始まる（終わる）場合、この機能は使用できません";
				//
				// エラーがなかったら本処理
				} else {
					// 表示する抜粋の長さ
					const caplength = 220;
					// 選択した文字列が長い場合、詰める
					if( caplength < textLength ) {
						trimedtext = trimedtext.slice( 0,caplength ) + "……";
					}
					// クリップボードにコピーする文字列を作成
					const title    = document.title;
					const url      = location.origin + location.pathname;
					const startpos = startNodeId.replace(/\D/g, "" );
					const endpos   = endNodeId.replace(/\D/g, "" );
					let pretext    = "《" + title + "》より\n" + trimedtext + "\n";
					let urlfull    =  url 
									+ "?c=" + chapterNumber 
									+ "&s=" + startpos
									+ "&so=" + rangeStart
									+ "&e=" + endpos
									+ "&eo=" + rangeEnd;
					let url2text   = pretext + urlfull;
					navigator.clipboard.writeText( url2text );
					// アナウンス用の文字列を作成
					pretext        = "《" + title + "》より<br>" + trimedtext.replace(/\n/g, "<br>" ) + "<br>";
					url2text       = pretext + "<a href='" + urlfull + "'>" + urlfull + "</a>";
					anouncemessage = "クリップボードに<strong>選択した文章</strong>へのリンクをコピーしました<hr/>" + url2text ;
				}
			// 選択した文字列がない（？）
			} else {
				anouncemessage = "選択範囲へのリンクをクリップボードにコピーできませんでした";
			}
		// 押されたボタンがthisbook でも thischapter でも haveachoice でもない（？）
		} else {
			anouncemessage = "リンクをクリップボードにコピーできませんでした";
		}
		//
		// 結果のアナウンス
		//
		jQuery( '#anouncebox .voice' ).html( anouncemessage );
		jQuery( '#anouncebox' ).css( 'display', 'flex' ).hide().fadeIn( 500 );
		// ボタンをフラッシュさせる
		// 設定したtouchクラスは、アナウンスを消す際に除去される
		jQuery( this ).addClass( 'touch' );
		// オプションバー閉じる
		jQuery( '.optionBar' ).removeClass( "show" );
		jQuery( '.optionBar' ).slideUp( 500 );
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　アナウンスをクリック（消す）
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( "#anouncebox" ).click( function( event ){
		event.stopPropagation();
		jQuery( this ).fadeOut( 200 );
		jQuery( ".makelink" ).removeClass( 'touch' );
		jQuery( '.optionBar' ).removeClass( "show" );
		jQuery( '.optionBar' ).slideUp( 200 );
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　表紙を消す
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( '#coverimage' ).on( 'click', function( event ) {
		event.stopPropagation();
		jQuery( ".novel:nth-child( "+ chapterNumber +" )" ).removeClass( "hide" );
		jQuery( '#overlay' ).removeClass().addClass( "bright" ); //
		jQuery( this ).fadeOut( 500 );
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　ヘルプ関連
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// -------------------------------------- // 
	// 　ヘルプを表示
	// -------------------------------------- // 
	jQuery( '#showhelp' ).on( 'click', function( event ) {
		event.stopPropagation();
		jQuery( '#overlay' ).removeClass().addClass( "dark" ); //
		jQuery( '#helpbox' ).css( 'display', 'flex' ).hide().fadeIn( 500 );
	} );

	// -------------------------------------- // 
	// 　ヘルプを消す
	// -------------------------------------- // 
	jQuery( '#helpbox' ).on( 'click', function( event ) {
		event.stopPropagation();
		jQuery( '#overlay' ).removeClass().addClass( "bright" ); //
		jQuery( this ).fadeOut( 500 );
	} );

	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　最初に戻る
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( '#gotostart' ).on( 'click', function( event ) {
		event.stopPropagation();
		jQuery( '#overlay' ).removeClass().addClass( "dark" ); //
		jQuery( '#coverimage' ).fadeIn( 500 );

		chapterNumber = 1;
		currentChapter = chapterChange( chapterNumber );

		const scrollPersent = 0;
		setScrollPosByPercent( currentChapter, scrollPersent );
	} );

 	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　BGセレクター関連
	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// -------------------------------------- // 
	// 　BGセレクターを消す
	// -------------------------------------- // 
	jQuery( '.bgselector' ).on( 'click', function( event ) {
		event.stopPropagation();
		jQuery( '#overlay' ).removeClass().addClass( "bright" ); //
		jQuery( this ).fadeOut( 500 );
	} );
	// -------------------------------------- // 
	// 　BGセレクターを表示
	// -------------------------------------- // 
	jQuery( '.configButton' ).on( 'click', function( event ) {
		event.stopPropagation();
		jQuery( '#overlay' ).removeClass().addClass( "dark" ); //
		jQuery( '.bgselector' ).css( 'display', 'flex' ).hide().fadeIn( 500 );
	} );
	// -------------------------------------- // 
	// 　BGを変更する
	// -------------------------------------- // 
	jQuery( '.picturebutton' ).on( 'click', function( event ) {
		event.stopPropagation();
		let newbg = jQuery( this ).attr( 'changebgto' );
		// クッキー食わせる
		jQuery.cookie( "background", newbg, { expires: 1000, path: PathName } );
		jQuery( 'body' ).removeClass().addClass( newbg );
		jQuery( '#overlay' ).removeClass().addClass( "bright" );
		jQuery( '.bgselector' ).fadeOut( 500 );
	} );

 	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　トランスレート用
 	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// -------------------------------------- // 
	// 　テキストのクリック
	// -------------------------------------- // 
	jQuery( ".trto" ).click( function( event ) {
		event.stopPropagation();

		if( jQuery( this ).hasClass( "pick" ) ){

			jQuery( ".translatebox" ).removeClass( "comeback" ).addClass( "away" );
			jQuery( ".trto" ).removeClass( "pick" );

		} else {

			jQuery( ".translatebox" ).removeClass( "away" ).addClass( "comeback" );
			jQuery( ".trto" ).removeClass( "pick" );

			const pickID = jQuery( this ).attr("trtext");
			jQuery(".trto[trtext='" + pickID + "']").addClass("pick");

			const trcontenerID = jQuery( this ).attr( "trtext" );
			const transText = jQuery( "#" + trcontenerID ).html();
			jQuery( ".translatebox" ).html( transText );

		}
	} );
	// -------------------------------------- // 
	// 　翻訳文表示箱のクリック
	// -------------------------------------- // 
	jQuery( ".translatebox" ).click( function( event ) {
		event.stopPropagation();
		jQuery( this ).removeClass( "comeback" ).addClass( "away" );
		jQuery( ".trto" ).removeClass( "pick" );
	} );

 	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	// 　リンクのプロパゲーションを止める
 	// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  // 
	jQuery( '.exitButton' ).on( 'click', function( event ) {
		event.stopPropagation();
	} );

	//
	//
	// =========================================================================================
	// =========================================================================================
	// 　各種関数
	// =========================================================================================
	// =========================================================================================
	//
	// 　抜粋モード処理用
	//
	// 　同じノード内の場合
	//
	function hilightProcess_01( queryParams ){
		// console.log( "開始と終了が同じノードにある場合の処理 ================================" );
		let _targetText, _beforeText, _midText, _afterText;
		// 対象のテキストを得る
		_targetText = jQuery( "#n-" + queryParams.s ).html();
		// テキストを三分割する
		_beforeText = _targetText.slice( 0, queryParams.so );
		_midText    = _targetText.slice( queryParams.so, queryParams.eo );
		_afterText  = _targetText.slice( queryParams.eo );
		// 真ん中のテキストをタグで囲む
		_beforeText = '<span class="alttext" id="preHilight" altoff="0">' +  _beforeText + '</span>';
		_midText    = '<span class="textHilightEdge textHilight endHilight alttext" id="startHilight" altoff="'
						+ queryParams.so + '">' +  _midText + '</span>';
		_afterText  = '<span class="alttext" id="postHilight" altoff="' + queryParams.eo + '">' +  _afterText + '</span>';
		// 書き戻す
		jQuery( "#n-" + queryParams.s ).html( _beforeText + _midText + _afterText );
	}
	//
	// 　ノードをまたぐ場合
	// 
	function hilightProcess_02( queryParams ){
		// console.log( "開始と終了が複数ノードにまたがっている場合の処理 ======================" );
		let _targetText, _beforeText, _afterText;
		// 開始ノードのテキストを得る
		_targetText = jQuery( "#n-" + queryParams.s ).html();
		// テキストを二分割する
		_beforeText = _targetText.slice( 0, queryParams.so );
		_afterText  = _targetText.slice( queryParams.so );
		// テキストをタグで囲む
		_beforeText = '<span class="alttext" id="preHilight" altoff="0">' +  _beforeText + '</span>';
		_afterText  = '<span class="textHilightEdge textHilight alttext" id="startHilight" altoff="'
						+ queryParams.so + '">' +  _afterText + '</span>';
		// 書き戻す
		jQuery( "#n-" + queryParams.s ).html( _beforeText + _afterText );

		// 終了ノードのテキストを得る
		_targetText = jQuery( "#n-" + queryParams.e ).html();
		// テキストを二分割する
		_beforeText = _targetText.slice( 0,queryParams.eo );
		_afterText  = _targetText.slice( queryParams.eo );
		// テキストをタグで囲む
		_beforeText = '<span class="textHilightEdge textHilight alttext endHilight" id="endHilight" altoff="0">' +  _beforeText + '</span>';
		_afterText  = '<span class="alttext" id="postHilight" altoff="' + queryParams.eo + '">' +  _afterText + '</span>';
		// 書き戻す
		jQuery( "#n-" + queryParams.e ).html( _beforeText + _afterText );

		// 途中のノードにクラスを追加する
		if( queryParams.s + 1 < queryParams.e ){
			// 開始ノードの次のノードから、終了の前のノードまでループ
			for ( let i = queryParams.s + 1; i < queryParams.e; i++) {
				// textHilight クラスを追加
				_targetText = jQuery( "#n-" + i ).addClass( "textHilight" );
			}
		}
	}
	//
	// 　ハイライト箇所までスクロール
	// 
	function moveToHilight(){
		// 抜粋開始クラス（startHilight）、終了うクラス（endHilight）のオブジェクトを得る
		// 終了がIDではないのは仕様
		let me      = jQuery( '#startHilight' );
		let myend   = jQuery( '.endHilight' );
		// 抜粋開始クラス（startHilight）を含む .novel オブジェクトを得る
		let jiji    = jQuery( '#startHilight' ).closest( ".novel" );
		// 親を表示（デフォルトでは消えてる）
		jQuery( jiji ).removeClass( "hide" );

		// console.log( "ーーーーーー★自分（ハイライト域）の座標:" );
		const myposition    = me.offset();
		const myendposition = myend.offset();
		let   myStartWidth  = jQuery( me ).width();
		let   myStartHeight = jQuery( me ).height();
		// console.log( "自分の横幅 = 最初の座標 - 最後の座標 + 最初の幅" );
		let   myHeight      = myposition.top  - myendposition.top  + myStartHeight ;
		let   myWidth       = myposition.left - myendposition.left + myStartWidth ;
		// console.log( "ーーーーーー★ールートの座標:" );
		const oyaposition   = jiji.offset();
		let   routeWidth    = jQuery( jiji ).width();
		let   routeHeight   = jQuery( jiji ).height();
		// console.log( "ーーーー合計★スクロールさせる量:" );
		let scrollNumber;
		if( MODE == "yoko" ){
			if( myHeight > routeHeight ){
			// 	console.log( "自分の高さが高い・上寄せ" );
			// 	console.log( "自分の座標 - 親の座標 - 親の高さの98% + 自分の高さ " );
				scrollNumber = myendposition.top - oyaposition.top - routeHeight * 0.98 + myHeight;
			}else{
			// 	console.log( "自分の高さが低い・センタリング" );
			// 	console.log( "自分の座標 - 親の座標 - 親の高さの半分 + 自分の高さの半分 " );
				scrollNumber = myendposition.top - oyaposition.top - routeHeight * 0.5 + myHeight * 0.5;
			}
		} else {
			if( myWidth > routeWidth ){
			// 	console.log( "自分の幅が広い・右寄せ" );
			// 	console.log( "自分の座標 - 親の座標 - 親の広さの98% + 自分の広さ " );
				scrollNumber = myendposition.left - oyaposition.left - routeWidth * 0.98 + myWidth;
			}else{
			// 	console.log( "自分の幅が狭い・センタリング" );
			// 	console.log( "自分の座標 - 親の座標 - 親の広さの半分 + 自分の広さの半分 " );
				scrollNumber = myendposition.left - oyaposition.left - routeWidth * 0.5 + myWidth * 0.5;
			}
		}
		// スクロールの実行
		setScrollPosByDistance( jiji, scrollNumber );
	}
	// =========================================================================================
	// 
	// 章切り替えの中身
	// 
	function chapterChange( chapter ){

		// 現在のチャプターを非表示
		jQuery( ".novel" ).addClass( "hide" );

		// chapterナンバーを得る際に必要なオフセット
		const slot = chapter + SlotOffset;

		// 移行先のチャプターを得る
		const targetChapter = jQuery( ".novel:nth-child( "+slot+" )" );

		// 対象のチャプターを表示
		jQuery( targetChapter ).removeClass( "hide" );

		// 章タイトル更新：topBar に表示
		const mytitle = jQuery( targetChapter ).find( "h3" ).html();
		jQuery( ".myTitle" ).html( mytitle );

		// cookie
		jQuery.cookie( "chapter", chapter, { expires: 1000, path: PathName } );

		// currentChapter を返す
		return ( targetChapter );
	}

	// =========================================================================================
	// 
	// スクロール
	// 
	function setScrollPosByPercent( page, percent ){
		let distance;
		if ( MODE == "tate" ){
			jQuery( ".novel" ).scrollTop( 0 );
			distance = jQuery( currentChapter ).get( 0 ).scrollWidth * percent;
			jQuery( page ).scrollLeft( distance );
		}else{
			jQuery( ".novel" ).scrollLeft( 0 );
			distance = jQuery( currentChapter ).get( 0 ).scrollHeight * percent;
			jQuery( page ).scrollTop( distance );
		}
		jQuery.cookie( "scroll", distance, { expires: 1000, path: PathName } );
	}

	function setScrollPosByDistance( page, distance ){
		if ( MODE == "tate" ){
			jQuery( page ).scrollLeft( distance );
		}else{
			jQuery( page ).scrollTop( distance );
		}
		jQuery.cookie( "scroll", distance, { expires: 1000, path: PathName } );
	}

	function setScrollPosWithAnimation( page, distance ){
		if ( MODE == "tate" ){
			jQuery( page ).animate( { scrollLeft: distance } );
		}else{
			jQuery( page ).animate( { scrollTop: distance } );
		}
		jQuery.cookie( "scroll", distance, { expires: 1000, path: PathName } );
	}
} );

