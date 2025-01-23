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
console.log("ACTION: 処理スタート");
	const searchParams = new URLSearchParams(window.location.search)
	const queryChapter = searchParams.get('chapter');
	if ( queryChapter ){
		chapterNumber = queryChapter * 1;
console.log("query: chapter is " + chapterNumber );
	} else if (jQuery.cookie("chapter")){
		// 本文
		chapterNumber = jQuery.cookie("chapter") * 1;
console.log("cookie: chapter is " + chapterNumber );
	}
	chapterChange( chapterNumber + slotOffset );

	// font
	if (jQuery.cookie("font")){
			jQuery(".novel").removeClass("minimum mini mid big bigger");
			jQuery(".fontSwitch").removeClass("pick");
			jQuery("." + jQuery.cookie("font") + "font").addClass("pick");
			jQuery(".novel").addClass(jQuery.cookie("font"));
console.log("cookie: font is " + jQuery.cookie("font") );
	}

	// fontfamily
	if (jQuery.cookie("fontfamily")){
			jQuery(".novel, .fontChange").removeClass("serif sansserif");
			jQuery(".novel, .fontChange").addClass(jQuery.cookie("fontfamily"));
console.log("cookie: fontfamily is " + jQuery.cookie("fontfamily") );
	}

	// writhing-mode
	if (jQuery.cookie("tateyoko")){
		mode = jQuery.cookie("tateyoko");
		jQuery("#bboard").addClass(mode);
console.log("cookie: writhing-mode is " + mode );
	}

	// background
	if (jQuery.cookie("background")){
		let bgfromcookie = jQuery.cookie("background");
		jQuery('body').removeClass().addClass( bgfromcookie ); //
console.log("cookie: background is " + bgfromcookie );
	}

	// scroll
	if (jQuery.cookie("scroll")){
		if ( mode == "tate" ){
			jQuery(currentChapter).scrollLeft(jQuery.cookie("scroll"));
		}else{
			jQuery(currentChapter).scrollTop(jQuery.cookie("scroll"));
		}
console.log("cookie: scroll is " + jQuery.cookie("scroll") );
	}

	// 各種ボタン ========================================================
	// ページ送り処理
	jQuery(".novel").click(function(e){
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
console.log("set cookie: fontfamily " + jQuery.cookie("fontfamily"));
	});

	// 文字サイズボタン
	jQuery(".fontSwitch").click(function( event ){
		event.stopPropagation();
console.log("ACTION: 文字サイズボタン");
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
		if(jQuery(this).hasClass("biggerfont")){
			size = "bigger";
		}
		if(jQuery(this).hasClass("bigfont")){
			size = "big";
		}
		if(jQuery(this).hasClass("midfont")){
			size = "mid";
		}
		if(jQuery(this).hasClass("minifont")){
			size = "mini";
		}
		if(jQuery(this).hasClass("minimumfont")){
			size = "minimum";
		}
		// クラスを剥がして再付与
		jQuery(".novel").removeClass("minimum");
		jQuery(".novel").removeClass("mini");
		jQuery(".novel").removeClass("mid");
		jQuery(".novel").removeClass("big");
		jQuery(".novel").removeClass("bigger");
		jQuery(".novel").addClass(size);
		// クッキー食わせる
		jQuery.cookie("font", size, { expires: 1000, path: pathname });
console.log("set cookie: font " + jQuery.cookie("font") );
		// ボタンのハイライト
		jQuery(".fontSwitch").removeClass("pick");
		jQuery(this).addClass("pick");
		// スクロール位置を再セットする
		doScroll( scrollPersent );

	});


	// 章送り戻しボタン
	jQuery(".novel .back,.novel .forward").click(function(){
console.log("ACTION: 章送り戻しボタン");
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

	// 章切り替え
	jQuery(".chapterJump").click(function( event ){
console.log("ACTION: 章切り替え");
		event.stopPropagation();
		chapterNumber = jQuery(this).attr("chapter") * 1;

		// 実行
		chapterChange( chapterNumber + slotOffset );

		// ウインドウ閉じる
		jQuery(".chapterBox").slideUp(200);
	});

	// 目次ボタン
	jQuery(".topBar").click(function( event ){
console.log("ACTION: 目次ボタン");
		event.stopPropagation();
		jQuery(".chapterBox").slideToggle(200);
	});

	// ボトムバーでオプションバーを開く
	jQuery(".bottomBar, .optionBar").click(function(){
		if( jQuery('.optionBar').hasClass("show") ){
console.log("ACTION: ボトムバーでオプションバーを閉じる");
			jQuery('.optionBar').removeClass("show");
			jQuery('.optionBar').slideUp(200);
		} else {
			jQuery(".makelink").removeClass('touch');		
console.log("ACTION: ボトムバーでオプションバーを開く");
			jQuery('.optionBar').addClass("show");
			jQuery('.optionBar').css('display', 'flex').hide().slideDown(200);
		}
	});

	// リンク作成ボタン
	jQuery(".makelink").click(function( event ){
		event.stopPropagation();
console.log("ACTION: リンク作成ボタン");
		jQuery('#anouncebox').css('display', 'flex').hide().fadeIn(200);
		jQuery(this).addClass('touch');
	});

	// アナウンス
	jQuery("#anouncebox").click(function( event ){
		event.stopPropagation();
console.log("ACTION: アナウンスを消す");
		jQuery( this ).fadeOut(200);
		jQuery(".makelink").removeClass('touch');
		jQuery('.optionBar').removeClass("show");
		jQuery('.optionBar').slideUp(200);
	});

	// 縦横ボタン
	jQuery(".tateyoko").click(function( event ){
console.log("ACTION: 縦横ボタン");
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

	jQuery(".novel").scroll(function(){
console.log("ACTION: スクロール");
		if ( mode == "tate" ){
			sw = jQuery(currentChapter).get(0).scrollWidth;
			scrollPersent = jQuery(currentChapter).scrollLeft() / sw;
			jQuery.cookie("scroll", jQuery(currentChapter).scrollLeft(), { expires: 1000, path: pathname });
		}else{
			sh = jQuery(currentChapter).get(0).scrollHeight;
			scrollPersent = jQuery(currentChapter).scrollTop() / sh;
			jQuery.cookie("scroll", jQuery(currentChapter).scrollTop(), { expires: 1000, path: pathname });
		}
console.log("set cookie: scroll " + jQuery.cookie("scroll"));
	});

	// ボードの拡大
	jQuery('.zoomButton').click(function(){
console.log("ACTION: ボードの拡大");
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

	jQuery(window).resize(function() {
console.log("ACTION: リサイズ処理");
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
console.log("ACTION: 章切り替え実行 " + slot );
		jQuery(".novel").addClass("hide");
		jQuery.cookie("chapter", chapterNumber, { expires: 1000, path: pathname });
console.log("set cookie: chapter " + jQuery.cookie("chapter"));
		jQuery(".novel:nth-child("+slot+")").removeClass("hide");
		currentChapter = jQuery(".novel:nth-child("+slot+")");
		// 章タイトル更新
		let mytitle = jQuery(currentChapter).find("h3").html();
		jQuery(".myTitle").html(mytitle);

	}

	// スクロール
	function doScroll( percent ){
console.log("ACTION: スクロール実行");
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

	// ボードの拡大用関数
	function reSizeMe(target,t,l,w,h){
		jQuery(target).animate({top: t},{queue: false}, 300);
		jQuery(target).animate({left: l},{queue: false}, 300);
		jQuery(target).animate({width: w},{queue: false}, 300);
		jQuery(target).animate({height: h},{queue: false}, 300);
	}

	// 表紙を消す
	jQuery('.coverimage').on('click', function( event ) {
		event.stopPropagation();
		jQuery('#overlay').removeClass().addClass("bright"); //
		jQuery(this).fadeOut(500);
console.log("表紙消す");
	});

	// BGセレクターを消す
	jQuery('.bgselector').on('click', function( event ) {
		event.stopPropagation();
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

	// BGを変更する
	jQuery('.picturebutton').on('click', function( event ) {
		event.stopPropagation();
		let newbg = jQuery(this).attr('changebgto');
		// クッキー食わせる
		jQuery.cookie("background", newbg, { expires: 1000, path: pathname });
console.log("set cookie: background " + jQuery.cookie("background") );
		jQuery('body').removeClass().addClass( newbg ); //
		jQuery('#overlay').removeClass().addClass("bright"); //
		jQuery('.bgselector').fadeOut(500);
		changeBG( newbg );
console.log("BG変更する");
	});

});

