/**
 * Created by doyen on 2015/10/28.
 */
(function ($) {
	function Scroller (box, setting) {
		this.box = box;
		this.container = null;
		this.scrollBox = null;
		this.contentBox = null;
		this.config = {
			backgroundColor: setting && setting.backgroundColor || "#c2c2c2",
			railColor: setting && setting.railColor || "lightslategray",
			draggerColor: setting && setting.draggerColor || "#ffff00",
			barWidth: setting && setting.barWidth || 5,
			delta: setting && setting.delta || 50,
			barSpace: setting && setting.barSpace || 5,
			animate: setting && setting.animate || true,
			animateTime: setting && setting.animateTime || 300,
			mouseWheelDirection: setting && setting.mouseWheelDirection || "horizontal",
			contentSpace: setting && setting.contentSpace || 5
		};
		this.scrollBarY = {
			bar: null,
			dragger: null,
			ratio: 0,
			contentTop: 0,
			draggerTop: 0,
			prevOffsetTop: 0,
			display: false
		};
		this.scrollBarYRailScratch = null;
		this.scrollBarYDraggerScratch = null;
		this.scrollBarXRailScratch = null;
		this.scrollBarXDraggerScratch = null;
		this.scrollBarX = {
			bar: null,
			dragger: null,
			ratio: 0,
			contentLeft: 0,
			draggerLeft: 0,
			prevOffsetLeft: 0,
			display: false
		};
		this.clickBarOrigin = null;
		this.boxPrevWidth = this.box.width();
		this.boxPrevHeight= this.box.height();

		this.initialize();
	}

	Scroller.prototype.initialize = function () {
		this.originContent = this.box.children().clone(true, true);
		this.boxPrevWidth = this.box.width();
		this.boxPrevHeight= this.box.height();
		this.box[0].scrollerObj = this;

		this.createBox().createBar(true, "X").createBar(true, "Y")
			.eventRegister();

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

	Scroller.prototype.createBox = function () {
		this.container = $("<div class='lorin-scroll-container'></div>");
		this.scrollBox = $("<div class='lorin-scroll-box'></div>");
		this.contentBox = $("<div class='lorin-content'></div>");

		this.contentBox.append(this.box.children().clone(true, true));

		this.box.empty();
		this.scrollBox.append(this.contentBox);
		this.container.append(this.scrollBox);
		this.box.append(this.container);

		if (this.contentBox.height() <= this.box.height() && this.contentBox.width() <= this.box.width()) {
			this.box.empty().append(this.contentBox.html());
			this.container = null;
			this.scrollBox = null;
			this.contentBox = null;

			return this;
		}

		this.container.css({
			width: this.box.width() - this.config.barSpace * 2 - this.config.barWidth - this.config.contentSpace,
			height: this.box.height() - this.config.barSpace * 2 - this.config.barWidth - this.config.contentSpace,
			padding: this.config.barSpace,
			paddingBottom: this.config.barSpace + this.config.barWidth + this.config.contentSpace,
			paddingRight: this.config.barSpace + this.config.barWidth + this.config.contentSpace,
			position: "relative",
			backgroundColor: this.config.backgroundColor
		});

		this.scrollBox.css({
			height: "100%",
			position: "relative",
			overflow: "hidden"
		});

		this.contentBox.css({
			position: "absolute",
			top: 0,
			left: 0
		});

		if (this.contentBox.height() <= this.scrollBox.height()) {
			this.container.css({
				width: this.box.width() - this.config.barSpace * 2,
				paddingRight: this.config.barSpace
			});

			this.config.mouseWheelDirection = "horizontal";
		}

		if (this.contentBox.width() <= this.scrollBox.width()) {
			this.container.css({
				height: this.box.height() - this.config.barSpace * 2,
				paddingBottom: this.config.barSpace
			});

			this.config.mouseWheelDirection = "vertical";
		}

		return this;
	};

	Scroller.prototype.createBar = function (create, direction) {
		var config = this.config;

		if (!this.container) {
			return this;
		}

		if (create) {
			this["scrollBar" + direction].bar = $("<div class='lorin-bar'></div>");
			this["scrollBar" + direction].dragger = $("<div class='lorin-dragger'></div>");
			this["scrollBar" + direction].bar.css("display", "none");
		}


		if (this["scrollBar" + direction].bar) {
			this["scrollBar" + direction].bar.css({
				position: "absolute",
				borderRadius: config.barWidth,
				backgroundColor: config.railColor
			});
		}

		if (this["scrollBar" + direction].dragger) {
			this["scrollBar" + direction].dragger.css({
				position: "absolute",
				top: 0,
				left: 0,
				backgroundColor: config.draggerColor,
				borderRadius: config.barWidth
			});
		}

		if (direction == "Y") {
			if (this.contentBox.height() <= this.scrollBox.height()) {
				this["scrollBar" + direction].bar.remove();
				this["scrollBar" + direction] = {};
				return this;
			} else {
				if (!this["scrollBar" + direction].bar) {
					this.createBar(true, direction);
				}
			}

			this["scrollBar" + direction].bar.css({
				top: config.barSpace,
				right: config.barSpace,
				width: config.barWidth,
				height: this.scrollBox.height()
			});

			this["scrollBar" + direction].dragger.css({
				width: config.barWidth,
				height: Math.pow(this.scrollBox.height(), 2) / this.contentBox.height(),
				zIndex: 3
			});

			this.scrollBarY.ratio = (this.contentBox.height() - this.scrollBox.height()) / (this.scrollBox.height() - this.scrollBarY.dragger.height());
		} else if (direction == "X") {
			if (this.contentBox.width() <= this.scrollBox.width()) {
				this["scrollBar" + direction].bar.remove();
				this["scrollBar" + direction] = {};

				return this;
			} else {
				if (!this["scrollBar" + direction].bar) {
					this.createBar(true, direction);
				}
			}

			this["scrollBar" + direction].bar.css({
				bottom: config.barSpace,
				left: config.barSpace,
				width: this.scrollBox.width(),
				height: config.barWidth
			});

			this["scrollBar" + direction].dragger.css({
				width: Math.pow(this.scrollBox.width(), 2) / this.contentBox.width(),
				height: config.barWidth
			});

			this.scrollBarX.ratio = (this.contentBox.width() - this.scrollBox.width()) / (this.scrollBox.width() - this.scrollBarX.dragger.width());
		}

		if (create) {
			this["scrollBar" + direction].bar.append(this["scrollBar" + direction].dragger);
			this.container.append(this["scrollBar" + direction].bar);
		}

		return this;
	};

	Scroller.prototype.eventRegister = function () {
		var self = this;

		if (!this.container) {
			return this;
		}

		this.container.on("mouseenter", function () {
			if (self.scrollBarX.bar) {
				self.scrollBarX.bar.fadeIn(300, 'linear');
			}

			if (self.scrollBarY.bar) {
				self.scrollBarY.bar.fadeIn(300, 'linear');
			}
		});

		this.container.on("mouseleave", function () {
			if (self.scrollBarX.bar && !self.scrollBarX.display) {
				self.scrollBarX.bar.fadeOut(200, 'linear');
			}

			if (self.scrollBarY.bar && !self.scrollBarY.display) {
				self.scrollBarY.bar.fadeOut(200, 'linear');
			}
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

		return this;
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
		var direction = "";

		if (event.data.type == "scrollBarY") {
			var prevOffsetTop  = self.scrollBarY.prevOffsetTop;
			var currentOffsetTop = event.clientY;
			direction = currentOffsetTop - prevOffsetTop > 0 ? "down" : "up";

			self.scrollBarY.draggerTop += (currentOffsetTop - prevOffsetTop);
			self.scrollBarY.contentTop = -self.scrollBarY.draggerTop * self.scrollBarY.ratio;

			self.scrollBarY.prevOffsetTop = currentOffsetTop;
			self.updatePosition(direction, true);
		} else if (event.data.type == "scrollBarX") {
			var prevOffsetLeft  = self.scrollBarX.prevOffsetLeft ;
			var currentOffsetLeft = event.clientX;
			direction = currentOffsetLeft - prevOffsetLeft > 0 ? "right" : "left";

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
		var mouseWheelDirection = self.config.mouseWheelDirection;

		if (e.wheelDelta) { //IE, Chrome
			if (e.wheelDelta > 0) { //当滑轮向上滚动时
				direction = mouseWheelDirection == "vertical" ? "up" : "right";
			}

			if (e.wheelDelta < 0) { //当滑轮向下滚动时
				direction = mouseWheelDirection == "vertical" ? "down" : "left";
			}
		} else if (e.detail) { //Firefox
			if (e.detail > 0) { //当滑轮向上滚动时
				direction = mouseWheelDirection == "vertical" ? "down" : "left";
			}

			if (e.detail < 0) { //当滑轮向下滚动时
				direction = mouseWheelDirection == "vertical" ? "up" : "right";
			}

		}

		if (mouseWheelDirection == "vertical") {
			var deltaY = direction == "up" ? self.config.delta : -self.config.delta;
			self.scrollBarY.contentTop += deltaY * self.scrollBarY.ratio;
			self.scrollBarY.draggerTop -= deltaY;
		} else if (mouseWheelDirection == "horizontal") {
			var deltaX = direction == "left" ? self.config.delta : -self.config.delta;
			self.scrollBarX.contentLeft += deltaX * self.scrollBarX.ratio;
			self.scrollBarX.draggerLeft -= deltaX;
		}


		if (direction == "up") {
			self.updatePosition("up");
		} else if (direction == "down") {
			self.updatePosition("down");
		} else if (direction == "left") {
			self.updatePosition("left");
		} else if (direction == "right") {
			self.updatePosition("right");
		}

		if (direction == "right" && self.scrollBarX.dragger && self.scrollBarX.bar && parseInt(self.scrollBarX.dragger.css("left")) >= self.scrollBarX.bar.width() - self.scrollBarX.dragger.width()) {

		} else if (direction == "left" && self.scrollBarX.dragger && self.scrollBarX.bar && parseInt(self.scrollBarX.dragger.css("left")) <= 0) {

		} else if (direction == "up" && self.scrollBarY.dragger && self.scrollBarY.bar && parseInt(self.scrollBarY.dragger.css("top")) <= 0) {

		} else if (direction == "down" && self.scrollBarY.dragger && self.scrollBarY.bar && parseInt(self.scrollBarY.dragger.css("top")) >= self.scrollBarY.bar.height() - self.scrollBarY.dragger.height()) {

		} else {
			event.preventDefault();
		}
	};

	Scroller.prototype.updatePosition = function (direction, isDragger) {
		var self = this;
		var location = arguments[0];

		if (typeof location == "object") {
			direction = location.direction;
			if (direction == "right") {
				self.scrollBarX.draggerLeft = location.location;
				self.scrollBarX.contentLeft = -self.scrollBarX.draggerLeft * self.scrollBarX.ratio;
			}

			if (direction == "up") {
				self.scrollBarY.draggerTop = location.location;
				self.scrollBarY.contentTop = -self.scrollBarY.draggerTop * self.scrollBarY.ratio
			}

		}

		if (direction == "up" || direction == "down") { //Y轴滚动条
			if (!self.scrollBarY.bar) {
				return false;
			}

			if (self.scrollBarY.contentTop > 0) {
				self.scrollBarY.contentTop = 0;
				self.scrollBarY.draggerTop = 0;
			} else if (Math.abs(self.scrollBarY.draggerTop) > self.scrollBarY.bar.height() - self.scrollBarY.dragger.height()) {
				self.scrollBarY.contentTop = self.scrollBox.height() - self.contentBox.height();
				self.scrollBarY.draggerTop = self.scrollBarY.bar.height() - self.scrollBarY.dragger.height() + 1;
			}

			if (!self.config.animate) {
				self.contentBox.css("top", self.scrollBarY.contentTop);
				self.scrollBarY.dragger.css("top", self.scrollBarY.draggerTop);

				return false;
			}

			if (self.contentBox.is(':animated')) {
				self.contentBox.stop(true, false);
				self.scrollBarY.dragger.stop(true, false);
			}

			if (typeof location == "object") {
				self.contentBox.css({
					top: self.scrollBarY.contentTop
				});

				self.scrollBarY.dragger.css({
					top: self.scrollBarY.draggerTop
				});
			} else {
				self.contentBox.animate({
					top: self.scrollBarY.contentTop
				}, self.config.animateTime, 'swing');

				if (isDragger) {
					self.scrollBarY.dragger.css("top", self.scrollBarY.draggerTop);
				} else {
					self.scrollBarY.dragger.animate({
						top: self.scrollBarY.draggerTop
					}, self.config.animateTime, 'swing');
				}
			}
		} else if (direction == "left" || direction == "right") { //X轴滚动条
			if (!self.scrollBarX.bar) {
				return false;
			}

			if (self.scrollBarX.draggerLeft < 0) {
				self.scrollBarX.contentLeft = 0;
				self.scrollBarX.draggerLeft = 0;
			} else if (Math.abs(self.scrollBarX.draggerLeft) > self.scrollBarX.bar.width() - self.scrollBarX.dragger.width()) {
				self.scrollBarX.contentLeft = self.scrollBox.width() - self.contentBox.width();
				self.scrollBarX.draggerLeft = self.scrollBarX.bar.width() - self.scrollBarX.dragger.width() + 1;
			}


			if (!self.config.animate) {
				self.contentBox.css("left", self.scrollBarX.contentLeft);
				self.scrollBarX.dragger.css("left", self.scrollBarX.draggerLeft);

				return false;
			}

			if (self.contentBox.is(':animated')) {
				self.contentBox.stop(true, false);
				self.scrollBarX.dragger.stop(true, false);
			}

			if (typeof location == "object") {
				self.contentBox.css({
					left: self.scrollBarX.contentLeft
				});

				self.scrollBarX.dragger.css({
					left: self.scrollBarX.draggerLeft
				});
			} else {
				self.contentBox.animate({
					left: self.scrollBarX.contentLeft
				}, self.config.animateTime, 'swing');

				if (isDragger) {
					self.scrollBarX.dragger.css("left", self.scrollBarX.draggerLeft);
				} else {
					self.scrollBarX.dragger.animate({
						left: self.scrollBarX.draggerLeft
					}, self.config.animateTime, 'swing');
				}
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
		this.config = {
			backgroundColor: setting && setting.backgroundColor || "#c2c2c2",
			railColor: setting && setting.railColor || "lightslategray",
			draggerColor: setting && setting.draggerColor || "#ffff00",
			barWidth: setting && setting.barWidth || 5,
			delta: setting && setting.delta || 50,
			barSpace: setting && setting.barSpace || 5,
			animate: setting && setting.animate || true,
			animateTime: setting && setting.animateTime || 300,
			mouseWheelDirection: setting && setting.mouseWheelDirection || "horizontal",
			contentSpace: setting && setting.contentSpace || 5
		};

		var prevOffsetTop = this.scrollBarY.draggerTop;
		var prevOffsetLeft = this.scrollBarX.draggerLeft;

		this.setStyle();
		this.updatePosition({direction: "right", location: prevOffsetLeft});
		this.updatePosition({direction: "up", location: prevOffsetTop});

		return this;
	};

	Scroller.prototype.setStyle = function () {
		var config = this.config;

		this.container.css({
			width: this.box.width() - this.config.barSpace * 3 - this.config.barWidth,
			height: this.box.height() - this.config.barSpace * 3 - this.config.barWidth,
			padding: this.config.barSpace,
			paddingBottom: this.config.barSpace * 2 + this.config.barWidth,
			paddingRight: this.config.barSpace * 2 + this.config.barWidth,
			backgroundColor: this.config.backgroundColor
		});

		if (this.contentBox.height() <= this.scrollBox.height()) {
			this.container.css({
				width: this.box.width() - this.config.barSpace * 2,
				paddingRight: this.config.barSpace
			});
		}

		if (this.contentBox.width() <= this.scrollBox.width()) {
			this.container.css({
				height: this.box.height() - this.config.barSpace * 2,
				paddingBottom: this.config.barSpace
			});
		}

		this.createBar(false, "X").createBar(false, "Y");

		return this;
	};

	Scroller.prototype.destroy = function (setting, dom) {
		if (!this.container) {
			return this;
		}

		this.box.empty();
		this.box.append(this.originContent);
		this.container.off("mouseenter");
		this.container.off("mouseleave");

		if (this.scrollBarX.bar) {
			this.scrollBarX.dragger.off("mouseover");
			this.scrollBarX.dragger.off("mousedown");
			this.scrollBarX.bar.off("click");
		}

		if (this.scrollBarY.bar) {
			this.scrollBarY.dragger.off("mouseover");
			this.scrollBarY.dragger.off("mousedown");
			this.scrollBarY.bar.off("click");
		}

		$(document).off("mouseup");
		this.scrollBox.off(Scroller.mousewheel);

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
		this.clickBarOrigin = null;
		this.container = null;
		this.scrollBox = null;
		this.contentBox = null;
		delete dom.scrollerObj;

		return this;
	};

	Scroller.prototype.autoUpdate = function () {
		var self = this;
		var boxPrevWidth = this.box.width();
		var boxPrevHeight= this.box.height();
		var contentPrevWidth = this.contentBox.width();
		var contentPrevHeight= this.contentBox.height();

		this.autoUpdateTimer = setInterval(function () {
			if (boxPrevWidth != self.box.width() || boxPrevHeight != self.box.height() || contentPrevWidth != self.contentBox.width() || contentPrevHeight != self.contentBox.height()) {
				self.originContent = self.contentBox.children().clone(true, true);

				self.setStyle();
			}

			boxPrevWidth = self.box.width();
			boxPrevHeight= self.box.height();
			contentPrevWidth = self.contentBox.width();
			contentPrevHeight= self.contentBox.height();
		}, 60);
	};

	Scroller.prototype.cancelAutoUpdate = function () {
		clearInterval(this.autoUpdateTimer);
	};

	$.fn.extend({
		lorinScroller: function () {
			if (arguments.length === 0 && !this[0].scrollerObj) {
				this[0].scrollerObj = new Scroller(this, arguments[0]);
			}

			if (arguments[0] == "update" || arguments[0] == "destroy") {
				if (this[0].scrollerObj) {
					this[0].scrollerObj[arguments[0]](arguments[1], this[0]);
				}
			} else if (!this[0].scrollerObj) {
				this[0].scrollerObj = new Scroller(this, arguments[0]);
			}
		}
	});

	$(function ($) {
		$(".lorin-scroll").each(function (index, dom) {
			$(dom).lorinScroller({

			});
		});
	});
})(jQuery);