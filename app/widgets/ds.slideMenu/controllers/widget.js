var animateRight = Ti.UI.createAnimation({
	left : 250,
	top : 85,
	height : "50%",
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 250
});

var animateReset = Ti.UI.createAnimation({
	left : 0,
	top : "auto",
	height : "100%",
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 250
});

var animateLeft = Ti.UI.createAnimation({
	left : -250,
	top : 85,
	height : "50%",
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 250
});

var touchStartX = 0;
var touchRightStarted = false;
var touchLeftStarted = false;
var buttonPressed = false;
var hasSlided = false;
var direction = "reset";

var leftButton = {}, rightButton = {}, disableLeft = false, disableRight = false;

$.movableview.addEventListener('touchstart', function(e) {
	touchStartX = e.x;
});

$.movableview.addEventListener('touchend', function(e) {
	if (buttonPressed) {
		buttonPressed = false;
		return;
	}

	if ($.movableview.left >= 150 && touchRightStarted && !disableLeft) {
		direction = "right";
		leftButton.touchEnabled = false;
		$.movableview.animate(animateRight);
		hasSlided = true;
	} else if ($.movableview.left <= -150 && touchLeftStarted && !disableRight) {
		direction = "left";
		rightButton.touchEnabled = false;
		$.movableview.animate(animateLeft);
		hasSlided = true;
	} else {
		direction = "reset";
		leftButton.touchEnabled = true;
		rightButton.touchEnabled = true;
		$.movableview.animate(animateReset);
		$.leftMenu.animate({
			opacity : 0,
			duration : 150
		});
		$.rightMenu.animate({
			opacity : 0,
			duration : 150
		});
		hasSlided = false;
	}
	Ti.App.fireEvent("sliderToggled", {
		hasSlided : hasSlided,
		direction : direction
	});
	touchRightStarted = false;
	touchLeftStarted = false;
});

$.movableview.addEventListener('touchmove', function(e) {
	var coords = $.movableview.convertPointToView({
		x : e.x,
		y : e.y
	}, $.containerview);
	var newLeft = coords.x - touchStartX;
	if ((touchRightStarted && newLeft <= 250 && newLeft >= 0) || (touchLeftStarted && newLeft <= 0 && newLeft >= -250)) {
		$.movableview.left = newLeft;
		$.movableview.top = (Math.abs(newLeft) / 250) * 85;
		$.movableview.height = parseInt(100 - ((Math.abs(newLeft) / 250) * 50)) + "%";
		if (newLeft > 0) {
			$.leftMenu.opacity = Math.abs(newLeft) / 250;
		} else {
			$.rightMenu.opacity = Math.abs(newLeft) / 250;
		}
	} else {
		// Sometimes newLeft goes beyond its bounds so the view gets stuck.
		// This is a hack to fix that.
		if ((touchRightStarted && newLeft < 0) || (touchLeftStarted && newLeft > 0)) {
			$.movableview.left = 0;
			$.movableview.height = "100%";
			$.leftMenu.opacity = 0;
			$.rightMenu.opacity = 0;
		} else if (touchRightStarted && newLeft > 250) {
			$.movableview.left = 250;
			$.movableview.height = "50%";
			$.leftMenu.opacity = 1;
		} else if (touchLeftStarted && newLeft < -250) {
			$.movableview.left = -250;
			$.movableview.height = "50%";
			$.rightMenu.opacity = 1;
		}
	}
	if (newLeft > 5 && !touchLeftStarted && !touchRightStarted) {
		touchRightStarted = true;
		Ti.App.fireEvent("sliderToggled", {
			hasSlided : false,
			direction : "right"
		});
	} else if (newLeft < -5 && !touchRightStarted && !touchLeftStarted) {
		touchLeftStarted = true;
		Ti.App.fireEvent("sliderToggled", {
			hasSlided : false,
			direction : "left"
		});
	}
});

exports.toggleLeftSlider = function() {
	if (!hasSlided) {
		direction = "right";
		leftButton.touchEnabled = false;
		$.leftMenu.animate({
			opacity : 1,
			duration : 500
		});
		$.movableview.animate(animateRight);
		hasSlided = true;
	} else {
		direction = "reset";
		leftButton.touchEnabled = true;
		$.movableview.animate(animateReset);
		hasSlided = false;
	}
	Ti.App.fireEvent("sliderToggled", {
		hasSlided : hasSlided,
		direction : direction
	});
};

exports.toggleRightSlider = function() {
	if (!hasSlided) {
		direction = "left";
		rightButton.touchEnabled = false;
		$.rightMenu.animate({
			opacity : 1,
			duration : 500
		});
		$.movableview.animate(animateLeft);
		hasSlided = true;
	} else {
		direction = "reset";
		rightButton.touchEnabled = true;
		$.movableview.animate(animateReset);
		hasSlided = false;
	}
	Ti.App.fireEvent("sliderToggled", {
		hasSlided : hasSlided,
		direction : direction
	});
};

exports.handleRotation = function() {
	/*
	 Add the orientation handler in the controller that loads this widget. Like this:
	 Ti.Gesture.addEventListener('orientationchange', function() {
	 $.ds.handleRotation();
	 });
	 */
	$.movableview.width = $.navview.width = Ti.Platform.displayCaps.platformWidth;
	$.movableview.height = $.navview.height = Ti.Platform.displayCaps.platformHeight;
};

$.init = function(args) {
	if (args.hasOwnProperty("leftButton")) {
		leftButton = args.leftButton;

		leftButton.addEventListener('touchend', function(e) {
			if (!touchRightStarted && !touchLeftStarted) {
				buttonPressed = true;
				$.toggleLeftSlider();
			}
		});
	}

	if (args.hasOwnProperty("rightButton")) {
		rightButton = args.rightButton;
		rightButton.addEventListener('touchend', function(e) {
			if (!touchRightStarted && !touchLeftStarted) {
				buttonPressed = true;
				$.toggleRightSlider();
			}
		});
	}

	disableLeft = args.disableLeft || false;
	disableRight = args.disableRight || false;

};
