# scroller
scroller
	/*
		@backgroundColor: the background color of bar content
		@railColor: the background color of bar rail
		@draggerColor: the background color of bar dragger
		@barWidth: the width of bar(Integer)
		@delta: move distance of bar when mouseWell every time(Integer)
		@barSpace: the space between container and bar(Integer)
		@animate: true/false
		@animateTime: Integer
		@mouseWheelDirection: control scroll bar when mouseWell event(horizontal/vertical)
		@contentSpace: the space between content and bar(Integer)

		create: 1. html (add className "lorin-scroll" with container);
				2. js ($(selector).lorinScroller(setting)); ----setting is object
		 destroy: ($(selector).lorinScroller("destroy")
		 update: ($(selector).lorinScroller("update", setting) ----setting is object
	 */
