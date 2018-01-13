// Front-end stuff
$(() => {
	$(window).resize(windowResized);
	windowResized();
})

function windowResized (e) {
	const windowWidth = $(window).width();
	if (windowWidth <= 1200) {
		$(".inventory .ui.cards").removeClass("four").removeClass("three").addClass("two");
	} else if (windowWidth <= 1480) {
		$(".inventory .ui.cards").removeClass("four").addClass("three");
	} else {
		$(".inventory .ui.cards").removeClass("three").addClass("four");
	}
}