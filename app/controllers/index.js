
// center
var currentView = Alloy.createController("view1").getView();
$.ds.contentview.add(currentView);

// left
var leftView = Alloy.createController("menu/left").getView();
$.ds.leftView.add(leftView);

// right
var rightView = Alloy.createController("menu/right").getView();
$.ds.rightView.add(rightView);

// event fireing while opening side menu
Ti.App.addEventListener("sliderToggled", function(e) {
	if (e.direction == "right") {
		$.ds.leftMenu.show();
		$.ds.rightMenu.hide();
	} else if (e.direction == "left") {
		$.ds.leftMenu.hide();
		$.ds.rightMenu.show();
	}
});

$.win.open();
