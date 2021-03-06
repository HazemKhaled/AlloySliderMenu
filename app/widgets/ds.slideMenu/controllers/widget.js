var matrix2d = Ti.UI.create2DMatrix();
var animateRight = Ti.UI.createAnimation({
	left : 200,
	transform : matrix2d.scale(0.7, 0.7),
	curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT,
	duration : 400
});

var animateReset = Ti.UI.createAnimation({
	left : 0,
	transform : matrix2d.scale(1, 1),
	curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT,
	duration : 400
});

var animateLeft = Ti.UI.createAnimation({
	left : -200,
	transform : matrix2d.scale(0.7, 0.7),
	curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT,
	duration : 400
});

var touchStartX = 0;
var touchRightStarted = false;
var touchLeftStarted = false;
var buttonPressed = false;
var hasSlided = false;
var direction = "reset";
var animatingNow = false;

var leftButton = {}, rightButton = {}, disableLeft = false, disableRight = false;

if (OS_ANDROID) {
	$.movableview.width = Ti.Platform.displayCaps.platformWidth + "px";
	$.movableview.height = (Ti.Platform.displayCaps.platformHeight - 50) + "px";
}

// Scale menus
if (!disableLeft) {
	$.leftMenu.transform = matrix2d.scale(1.3, 1.3);
}
if (!disableRight) {
	$.rightMenu.transform = matrix2d.scale(1.3, 1.3);
}

$.movableview.addEventListener('touchstart', function(e) {
	touchStartX = e.x;
});

$.movableview.addEventListener('touchend', function(e) {
	if (buttonPressed) {
		buttonPressed = false;
		return;
	}

	if ($.movableview.left >= 120 && touchRightStarted && !disableLeft) {
		direction = "right";
		leftButton.touchEnabled = false;
		$.movableview.animate(animateRight);
		$.leftMenu.animate({
			transform : matrix2d.scale(1, 1),
			opacity : 1,
			duration : 400
		});
		hasSlided = true;
	} else if ($.movableview.left <= -120 && touchLeftStarted && !disableRight) {
		direction = "left";
		rightButton.touchEnabled = false;
		$.movableview.animate(animateLeft);
		$.rightMenu.animate({
			transform : matrix2d.scale(1, 1),
			opacity : 1,
			duration : 400
		});
		hasSlided = true;
	} else {
		direction = "reset";
		leftButton.touchEnabled = true;
		rightButton.touchEnabled = true;
		$.movableview.animate(animateReset);
		if (!disableLeft) {
			$.leftMenu.animate({
				transform : matrix2d.scale(1.3, 1.3),
				opacity : 0,
				duration : 400
			});
		}
		if (!disableRight) {
			$.rightMenu.animate({
				transform : matrix2d.scale(1.3, 1.3),
				opacity : 0,
				duration : 400
			});
		}
		hasSlided = false;
	}
	Ti.App.fireEvent("sliderToggled", {
		hasSlided : hasSlided,
		direction : direction
	});
	touchRightStarted = false;
	touchLeftStarted = false;
});
if (OS_IOS) {
	$.movableview.addEventListener('touchmove', function(e) {

		var coords = $.movableview.convertPointToView({
			x : e.x,
			y : e.y
		}, $.containerview);
		var newLeft = coords.x - touchStartX;

		if (animatingNow === true) {
			Ti.API.debug("Animating now, newLeft : " + newLeft);
		}

		if (animatingNow === false && ((touchRightStarted && newLeft <= 200 && newLeft >= 0 && !disableLeft) || (touchLeftStarted && newLeft <= 0 && newLeft >= -200 && !disableRight))) {

			var scale = 1 - ((Math.abs(newLeft) / 200) * 0.3);
			var scaleMenu = 1.3 - ((Math.abs(newLeft) / 200) * 0.3);
			var animation = Ti.UI.createAnimation({
				left : newLeft,
				transform : matrix2d.scale(scale, scale),
				duration : 10
			});
			animatingNow = true;
			$.movableview.animate(animation, function() {
				animatingNow = false;
			});
			if (newLeft > 0) {

				$.leftMenu.animate({
					transform : matrix2d.scale(scaleMenu, scaleMenu),
					opacity : Math.abs(newLeft) / 200,
					duration : 10
				});
			} else {
				$.rightMenu.animate({
					transform : matrix2d.scale(scaleMenu, scaleMenu),
					opacity : Math.abs(newLeft) / 200,
					duration : 10
				});
			}
		} else if (animatingNow === false) {
			// Sometimes newLeft goes beyond its bounds so the view gets stuck.
			// This is a hack to fix that.
			if ((touchRightStarted && newLeft < 0) || (touchLeftStarted && newLeft > 0)) {
				$.movableview.left = 0;
				$.movableview.transform = matrix2d.scale(1, 1);
				$.leftMenu.opacity = $.rightMenu.opacity = 0;
				$.leftMenu.transform = matrix2d.scale(1.3, 1.3);
				$.rightMenu.transform = matrix2d.scale(1.3, 1.3);
			} else if (touchRightStarted && newLeft > 200 && !disableLeft) {
				$.movableview.left = 200;
				$.movableview.transform = matrix2d.scale(0.7, 0.7);
				$.leftMenu.opacity = 1;
				$.leftMenu.transform = matrix2d.scale(1, 1);
			} else if (touchLeftStarted && newLeft < -200 && !disableRight) {
				$.movableview.left = -200;
				$.movableview.transform = matrix2d.scale(0.7, 0.7);
				$.rightMenu.opacity = 1;
				$.rightMenu.transform = matrix2d.scale(1, 1);
			}
		}
		if (newLeft > 5 && !touchLeftStarted && !touchRightStarted && !disableLeft) {
			touchRightStarted = true;
			Ti.App.fireEvent("sliderToggled", {
				hasSlided : false,
				direction : "right"
			});
		} else if (newLeft < -5 && !touchRightStarted && !touchLeftStarted && !disableRight) {
			touchLeftStarted = true;
			Ti.App.fireEvent("sliderToggled", {
				hasSlided : false,
				direction : "left"
			});
		}
	});
}

exports.toggleLeftSlider = function() {

	if (disableLeft) {
		return;
	}

	if (!hasSlided) {
		direction = "right";
		leftButton.touchEnabled = false;
		$.leftMenu.animate({
			transform : matrix2d.scale(1, 1),
			opacity : 1,
			duration : 400
		});
		$.movableview.animate(animateRight);
		hasSlided = true;
	} else {
		direction = "reset";
		leftButton.touchEnabled = true;
		$.leftMenu.animate({
			transform : matrix2d.scale(1.3, 1.3),
			opacity : 0,
			duration : 400
		});
		$.movableview.animate(animateReset);
		hasSlided = false;
	}
	Ti.App.fireEvent("sliderToggled", {
		hasSlided : hasSlided,
		direction : direction
	});
};

exports.toggleRightSlider = function() {

	if (disableRight) {
		return;
	}

	if (!hasSlided) {
		direction = "left";
		rightButton.touchEnabled = false;
		$.rightMenu.animate({
			transform : matrix2d.scale(1, 1),
			opacity : 1,
			duration : 400
		});
		$.movableview.animate(animateLeft);
		hasSlided = true;
	} else {
		direction = "reset";
		rightButton.touchEnabled = true;
		$.leftMenu.animate({
			transform : matrix2d.scale(1.3, 1.3),
			opacity : 0,
			duration : 400
		});
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
	if (OS_ANDROID) {
		$.movableview.width = Ti.Platform.displayCaps.platformWidth + "px";
		$.movableview.height = (Ti.Platform.displayCaps.platformHeight - 50) + "px";
	} else {
		$.movableview.width = Ti.Platform.displayCaps.platformWidth;
		$.movableview.height = Ti.Platform.displayCaps.platformHeight;
	}
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
