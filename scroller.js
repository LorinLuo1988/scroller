/**
 * Created by doyen on 2015/10/28.
 */
(function ($) {
	function Scroller (box, setting) {
		this.box = box;
		this.scrollBox = null;
		this.contentBox = null;
		this.config = {
			backgroundColor: setting && setting.backgroundColor || "#555555",
			railColor: setting && setting.railColor || "#333333",
			draggerColor: setting && setting.draggerColor || "#dadada",
			barWidth: setting && setting.barWidth || 5,
			delta: setting && setting.delta || 50
		},
		this.scrollBarY = {
			bar: null,
			dragger: null,
			ratio: 0,
			contentTop: 0,
			draggerTop: 0,
			prevOffsetTop: 0,
			display: false
		};
		this.scrollBarX = {
			bar: null,
			dragger: null,
			ratio: 0,
			contentLeft: 0,
			draggerLeft: 0,
			prevOffsetLeft: 0,
			display: false
		};
		this.ratioX = 0;
		this.clickBarOrigin = null;

		this.initialize();
	}

	Scroller.prototype.initialize = function () {
		this.createBox().crateBarX().crateBarY().eventRegister();

		return this;
	};

	Scroller.browserName = (function () {
		var userAgent = navigator.userAgent;
		var browserName = "";

		if (userAgent.indexOf("Chrome") != -1) {
			browserName = "Chrome";
		} else if (userAgent.indexOf("Firefox") != -1) {
			browserName = "Firefox";
		} else if (userAgent.indexOf("MSIE") != -1 || userAgent.indexOf("rv:11.0") != -1) {
			browserName = "IE";
		}
		return browserName;
	})();

	Scroller.mousewheel = Scroller.browserName == "Firefox" ? "DOMMouseScroll" : "mousewheel";

	Scroller.prototype.toggleWindowScrollEvent = function (isForbidden) {
		var scrollTop = window.scrollY || document.documentElement.scrollTop;
		var scrollLeft = window.scrollX || document.documentElement.scrollLeft;

		if (isForbidden) {
			window.onscroll = function () {
				window.scrollTo(scrollLeft, scrollTop)
			};
		} else {
			window.onscroll = null;
		}

		return this;
	};

	Scroller.prototype.createBox = function () {
		this.scrollBox = $("<div class='lorin-scroll-box'></div>");
		this.contentBox = $("<div class='lorin-container'></div>");

		this.scrollBox.css({
			width: "100%",
			height: "100%",
			position: "relative",
			overflow: "hidden",
			backgroundColor: this.backgroundColor
		});

		this.contentBox.css({
			position: "absolute",
			top: 0
		});

		this.contentBox.html(this.box.html());
		this.box.empty();
		this.scrollBox.append(this.contentBox);
		this.box.append(this.scrollBox);

		return this;
	};

	Scroller.prototype.crateBarY = function () {
		var config = this.config;

		if (this.contentBox.height() <= this.scrollBox.height()) {
			return this;
		}

		this.scrollBarY.bar = $("<div class='lorin-bar'></div>");
		this.scrollBarY.dragger = $("<div class='lorin-dragger'></div>");

		this.scrollBarY.bar.css({
			position: "absolute",
			top: 0,
			right: 0,
			width: config.barWidth,
			padding: "0 1px",
			height: "100%",
			borderRadius: config.barWidth,
			backgroundColor: config.railColor,
			display: "none"
		});

		this.scrollBarY.dragger.css({
			position: "absolute",
			top: 0,
			left: 0,
			width: config.barWidth,
			borderRight: "1px solid " + config.railColor,
			borderLeft: "1px solid " + config.railColor,
			backgroundColor: config.draggerColor,
			borderRadius: config.barWidth,
			zIndex: 3,
			height: Math.pow(this.scrollBox.height(), 2) / this.contentBox.height()
		});

		this.scrollBarY.bar.append(this.scrollBarY.dragger);
		this.scrollBox.append(this.scrollBarY.bar);
		this.scrollBarY.ratio = (this.contentBox.height() - this.scrollBox.height()) / (this.scrollBox.height() - this.scrollBarY.dragger.height());
		this.scrollBarY.StepCount = Math.ceil((this.scrollBox.height() - this.scrollBarY.dragger.height()) / this.config.delta);

		return this;
	};

	Scroller.prototype.crateBarX = function () {
		var config = this.config;

		if (this.contentBox.width() <= this.scrollBox.width()) {
			return this;
		}

		this.scrollBarX.bar = $("<div class='lorin-bar'></div>");
		this.scrollBarX.dragger = $("<div class='lorin-dragger'></div>");

		this.scrollBarX.bar.css({
			position: "absolute",
			bottom: 0,
			left: 0,
			width: "100%",
			height: config.barWidth,
			padding: "1px 0",
			borderRadius: config.barWidth,
			backgroundColor: config.railColor,
			display: "none"
		});

		this.scrollBarX.dragger.css({
			position: "absolute",
			left: 0,
			top: 0,
			height: config.barWidth,
			backgroundColor: config.draggerColor,
			borderTop: "1px solid " + config.railColor,
			borderBottom: "1px solid " + config.railColor,
			borderRadius: config.barWidth,
			zIndex: 3,
			width: Math.pow(this.scrollBox.width(), 2) / this.contentBox.width()
		});

		this.scrollBox.append(this.scrollBarX.bar);
		this.scrollBarX.bar.append(this.scrollBarX.dragger);
		this.scrollBarX.ratio =  (this.contentBox.width() - this.scrollBox.width()) / (this.scrollBox.width() - this.scrollBarX.dragger.width());
		this.scrollBarY.StepCount = Math.ceil((this.scrollBox.width() - this.scrollBarX.dragger.width()) / this.config.delta);

		return this;
	};

	Scroller.prototype.eventRegister = function () {
		var self = this;

		this.scrollBox.on("mouseenter", function () {
			if (self.scrollBarX.bar) {
				self.scrollBarX.bar.fadeIn(300, 'linear');
			}

			if (self.scrollBarY.bar) {
				self.scrollBarY.bar.fadeIn(300, 'linear');
			}
		});

		this.scrollBox.on("mouseleave", function () {
			if (self.scrollBarX.bar && !self.scrollBarX.display) {
				self.scrollBarX.bar.fadeOut(200, 'linear');
			}

			if (self.scrollBarY.bar && !self.scrollBarY.display) {
				self.scrollBarY.bar.fadeOut(200, 'linear');
			}

			self.toggleWindowScrollEvent(false);
		});

		if (this.scrollBarX.bar) {
			this.scrollBarX.dragger.on("mouseover", function () {
				self.scrollBarX.dragger.css("cursor", "pointer");
			});

			this.scrollBarX.dragger.on("mousedown", {type: "scrollBarX", scope: this}, this.draggerMouseDownFun);

			this.scrollBarX.bar.on("click", {type: "scrollBarX", scope: this}, this.scrollClickFun);
		}

		if (this.scrollBarY.bar) {
			this.scrollBarY.dragger.on("mouseover", function () {
				self.scrollBarY.dragger.css("cursor", "pointer");
			});

			this.scrollBarY.dragger.on("mousedown", {type: "scrollBarY", scope: this}, this.draggerMouseDownFun);

			this.scrollBarY.bar.on("click", {type: "scrollBarY", scope: this}, this.scrollClickFun);
		}

		$(document).on("mouseup", function (event) {
			var target = event.target;
			var isInBox = self.box.find(target);

			$(document).off("mousemove", self.documentMouseMoveFun);
			self.scrollBarY.display = false;
			self.scrollBarX.display = false;

			if (self.scrollBarX.bar && !isInBox.length) {
				self.scrollBarX.bar.fadeOut(200, 'linear');
			}

			if (self.scrollBarY.bar && !isInBox.length) {
				self.scrollBarY.bar.fadeOut(200, 'linear');
			}

			self.allowUserSelect();
		});

		this.scrollBox.on(Scroller.mousewheel, {scope: this}, this.mouseWheelFun);
	};

	Scroller.prototype.draggerMouseDownFun = function (event) {
		var self = event.data.scope;
		var type = event.data.type;

		self.forbidUserSelect();
		self.clickBarOrigin = $(event.target);

		if (type == "scrollBarY") {
			self.scrollBarY.prevOffsetTop = event.clientY;
			self.scrollBarY.display = true;
		} else if (type == "scrollBarX") {
			self.scrollBarX.prevOffsetLeft = event.clientX;
			self.scrollBarX.display = true;
		}

		$(document).on("mousemove", {scope: self, type: type}, self.documentMouseMoveFun);
	};

	Scroller.prototype.documentMouseMoveFun = function (event) {
		var self = event.data.scope;

		if (event.data.type == "scrollBarY") {
			var prevOffsetTop  = self.scrollBarY.prevOffsetTop;
			var currentOffsetTop = event.clientY;
			var direction = currentOffsetTop - prevOffsetTop > 0 ? "down" : "up";

			self.scrollBarY.draggerTop += (currentOffsetTop - prevOffsetTop);
			self.scrollBarY.contentTop = -self.scrollBarY.draggerTop * self.scrollBarY.ratio;

			self.scrollBarY.prevOffsetTop = currentOffsetTop;
			self.updatePosition(direction, true);
		} else if (event.data.type == "scrollBarX") {
			var prevOffsetLeft  = self.scrollBarX.prevOffsetLeft ;
			var currentOffsetLeft = event.clientX;
			var direction = currentOffsetLeft - prevOffsetLeft > 0 ? "right" : "left";

			self.scrollBarX.draggerLeft += (currentOffsetLeft - prevOffsetLeft);
			self.scrollBarX.contentLeft = -self.scrollBarX.draggerLeft * self.scrollBarX.ratio;
			self.scrollBarX.prevOffsetLeft = currentOffsetLeft;
			self.updatePosition(direction, true);
		}
	};

	Scroller.prototype.scrollClickFun = function (event) {
		var target = event.target;
		var type = event.data.type;
		var self = event.data.scope;
		var direction = "";

		if (self.clickBarOrigin) {
			self.clickBarOrigin = null;

			return false;
		}

		if ($(target).is(".lorin-dragger")) {
			return false;
		}

		if (type == "scrollBarY") {
			direction = event.offsetY > self.scrollBarY.draggerTop ? "down" : "up";
			self.scrollBarY.draggerTop = event.offsetY;
			self.scrollBarY.contentTop = -event.offsetY * self.scrollBarY.ratio;

			self.updatePosition(direction);
		} else if (type == "scrollBarX") {
			direction = event.offsetX > self.scrollBarX.draggerLeft ? "right" : "left";
			self.scrollBarX.draggerLeft = event.offsetX;
			self.scrollBarX.contentLeft = -event.offsetX * self.scrollBarX.ratio;

			event.data.scope.updatePosition(direction);
		}
	};

	Scroller.prototype.mouseWheelFun = function (event) {
		var e = event.originalEvent;
		var direction = "";
		var self = event.data.scope;
		var deltaY = 0;

		if (e.wheelDelta) { //IE, Chrome
			if (e.wheelDelta > 0) { //当滑轮向上滚动时
				direction = "up";
			}

			if (e.wheelDelta < 0) { //当滑轮向下滚动时
				direction = "down";
			}
		} else if (e.detail) { //Firefox
			if (e.detail > 0) { //当滑轮向上滚动时
				direction = "down";
			}

			if (e.detail < 0) { //当滑轮向下滚动时
				direction = "up";
			}

		}

		deltaY = direction == "up" ? self.config.delta : -self.config.delta
		self.scrollBarY.contentTop += deltaY * self.scrollBarY.ratio;
		self.scrollBarY.draggerTop -= deltaY;

		if (direction == "up") {
			self.updatePosition("up");
		} else if (direction == "down") {
			self.updatePosition("down");
		}
	};

	Scroller.prototype.updatePosition = function (direction, isDragger) {
		var self = this;

		if (direction == "up" || direction == "down") { //Y轴滚动条
			if (Math.abs(self.scrollBarY.contentTop) > self.contentBox.height() - self.scrollBox.height()) {
				self.scrollBarY.contentTop = self.scrollBox.height() - self.contentBox.height();
				self.scrollBarY.draggerTop = self.scrollBox.height() - self.scrollBarY.dragger.height();
			}

			if (self.scrollBarY.contentTop > 0) {
				self.scrollBarY.contentTop = 0;
				self.scrollBarY.draggerTop = 0;
			}

			if (self.contentBox.is(':animated')) {
				self.toggleWindowScrollEvent(true);
				self.contentBox.stop(true, false);
				self.scrollBarY.dragger.stop(true, false);
			} else {
				if (Math.abs(parseInt(self.contentBox.css("top"))) == self.contentBox.height() - self.scrollBox.height() && direction == "down") {
					self.toggleWindowScrollEvent(false);
				} else if (parseInt(self.contentBox.css("top")) == 0 && direction == "up") {
					self.toggleWindowScrollEvent(false);
				} else {
					self.toggleWindowScrollEvent(true);
				}
			}

			self.contentBox.animate({
				top: self.scrollBarY.contentTop
			}, 600, 'swing');

			if (isDragger) {
				self.scrollBarY.dragger.css("top", self.scrollBarY.draggerTop);
			} else {
				self.scrollBarY.dragger.animate({
					top: self.scrollBarY.draggerTop
				}, 600, 'swing');
			}
		} else if (direction == "left" || direction == "right") { //X轴滚动条
			if (Math.abs(self.scrollBarX.contentLeft) > self.contentBox.width() - self.scrollBox.width()) {
				self.scrollBarX.contentLeft = self.scrollBox.width() - self.contentBox.width();
				self.scrollBarX.draggerLeft = self.scrollBox.width() - self.scrollBarX.dragger.width();
			}

			if (self.scrollBarX.contentLeft > 0) {
				self.scrollBarX.contentLeft = 0;
				self.scrollBarX.draggerLeft = 0;
			}

			if (self.contentBox.is(':animated')) {
				self.toggleWindowScrollEvent(true);
				self.contentBox.stop(true, false);
				self.scrollBarX.dragger.stop(true, false);
			} else {
				if (Math.abs(parseInt(self.contentBox.css("left"))) == self.contentBox.width() - self.scrollBox.width() && direction == "right") {
					self.toggleWindowScrollEvent(false);
				} else if (parseInt(self.contentBox.css("left")) == 0 && direction == "left") {
					self.toggleWindowScrollEvent(false);
				} else {
					self.toggleWindowScrollEvent(true);
				}
			}

			self.contentBox.animate({
				left: self.scrollBarX.contentLeft
			}, 600, 'swing');

			if (isDragger) {
				self.scrollBarX.dragger.css("left", self.scrollBarX.draggerLeft);
			} else {
				self.scrollBarX.dragger.animate({
					left: self.scrollBarX.draggerLeft
				}, 600, 'swing');
			}
		}
	};

	Scroller.prototype.allowUserSelect = function () {
		var browserName = Scroller.browserName;

		if (browserName == "Firefox") {
			$("html").css("-moz-user-select", "-moz-all");
		} else {
			$(document).off("selectstart");
		}
	};

	Scroller.prototype.forbidUserSelect = function () {
		var browserName = Scroller.browserName;

		if (browserName == "Firefox") {
			$("html").css("-moz-user-select", "none");
		} else {
			$(document).on("selectstart", function () {
				return false;
			});
		}
	};

	Scroller.prototype.update = function (setting) {
		this.config.backgroundColor = setting.backgroundColor;
		this.config.railColor = setting.railColor;
		this.config.draggerColor = setting.draggerColor;
		this.config.barWidth = setting.barWidth;

		this.setBarStyle();

		return this;
	};

	Scroller.prototype.setBarStyle = function () {
		var config = this.config;

		this.scrollBarX.bar.css({
			height: config.barWidth,
			borderRadius: config.barWidth,
			backgroundColor: config.railColor
		});

		this.scrollBarX.dragger.css({
			height: config.barWidth,
			backgroundColor: config.draggerColor,
			borderTop: "1px solid " + config.railColor,
			borderBottom: "1px solid " + config.railColor,
			borderRadius: config.barWidth
		});

		this.scrollBarY.bar.css({
			width: config.barWidth,
			borderRadius: config.barWidth,
			backgroundColor: config.railColor
		});

		this.scrollBarY.dragger.css({
			width: config.barWidth,
			borderRight: "1px solid " + config.railColor,
			borderLeft: "1px solid " + config.railColor,
			backgroundColor: config.draggerColor,
			borderRadius: config.barWidth
		});
	};

	Scroller.prototype.destroy = function (setting) {

	};

	$.fn.extend({
		lorinScroller: function () {
			if (arguments.length == 0 && !this[0].scrollerObj) {
				this[0].scrollerObj = new Scroller(this, arguments[0]);
			}

			if (arguments[0] == "update" || arguments[0] == "destroy") {
				if (this[0].scrollerObj) {
					this[0].scrollerObj[arguments[0]](arguments[1]);
				}
			} else if (!this[0].scrollerObj) {
				this[0].scrollerObj = new Scroller(this, arguments[0]);
			}
		}
	});

	$(function ($) {
		$(".lorin-scroll").each(function (index, dom) {
			$(dom).lorinScroller({
				barWidth: 10
			});
		});
	});

})(jQuery);