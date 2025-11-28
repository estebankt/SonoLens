/**
 * Auto-scroll utility for drag and drop operations
 * Adapted from svelte-dnd-action/src/helpers/scroller.js
 */

const SCROLL_ZONE_PX = 30;

interface Point {
	x: number;
	y: number;
}

interface DirectionObj {
	x: number;
	y: number;
}

interface ScrollingInfo {
	directionObj: DirectionObj | undefined;
	stepPx: number;
}

interface Scroller {
	scrollIfNeeded: (pointer: Point, elementToScroll: HTMLElement) => boolean;
	resetScrolling: () => void;
}

/**
 * Checks if a point is inside a rectangle
 */
function isPointInsideRect(
	point: Point,
	rect: { top: number; bottom: number; left: number; right: number }
): boolean {
	return point.y <= rect.bottom && point.y >= rect.top && point.x >= rect.left && point.x <= rect.right;
}

/**
 * Creates a scroller that can scroll any element in any direction
 */
export function makeScroller(): Scroller {
	let scrollingInfo: ScrollingInfo;

	function resetScrolling() {
		scrollingInfo = { directionObj: undefined, stepPx: 0 };
	}

	resetScrolling();

	function scrollContainer(containerEl: HTMLElement) {
		const { directionObj, stepPx } = scrollingInfo;
		if (directionObj) {
			containerEl.scrollBy(directionObj.x * stepPx, directionObj.y * stepPx);
			window.requestAnimationFrame(() => scrollContainer(containerEl));
		}
	}

	function calcScrollStepPx(distancePx: number): number {
		return SCROLL_ZONE_PX - distancePx;
	}

	/**
	 * Calculates distances between a point and the sides of an element
	 * Returns null if point is outside the element
	 */
	function calcInnerDistancesBetweenPointAndSidesOfElement(
		point: Point,
		el: HTMLElement
	): { top: number; bottom: number; left: number; right: number } | null {
		// Handle scrolling element (window)
		const rect =
			el === document.scrollingElement
				? {
						top: 0,
						bottom: window.innerHeight,
						left: 0,
						right: window.innerWidth
					}
				: el.getBoundingClientRect();

		if (!isPointInsideRect(point, rect)) {
			return null;
		}

		return {
			top: point.y - rect.top,
			bottom: rect.bottom - point.y,
			left: point.x - rect.left,
			right: rect.right - point.x
		};
	}

	/**
	 * Checks if scrolling is needed based on pointer position
	 * Triggers scrolling if pointer is near element edges
	 * @returns true if scrolling was triggered
	 */
	function scrollIfNeeded(pointer: Point, elementToScroll: HTMLElement): boolean {
		if (!elementToScroll) {
			return false;
		}

		const distances = calcInnerDistancesBetweenPointAndSidesOfElement(pointer, elementToScroll);
		const isAlreadyScrolling = !!scrollingInfo.directionObj;

		if (distances === null) {
			if (isAlreadyScrolling) resetScrolling();
			return false;
		}

		let scrollingVertically = false;
		let scrollingHorizontally = false;

		// Vertical scrolling
		if (elementToScroll.scrollHeight > elementToScroll.clientHeight) {
			if (distances.bottom < SCROLL_ZONE_PX) {
				scrollingVertically = true;
				scrollingInfo.directionObj = { x: 0, y: 1 };
				scrollingInfo.stepPx = calcScrollStepPx(distances.bottom);
			} else if (distances.top < SCROLL_ZONE_PX) {
				scrollingVertically = true;
				scrollingInfo.directionObj = { x: 0, y: -1 };
				scrollingInfo.stepPx = calcScrollStepPx(distances.top);
			}

			if (!isAlreadyScrolling && scrollingVertically) {
				scrollContainer(elementToScroll);
				return true;
			}
		}

		// Horizontal scrolling
		if (elementToScroll.scrollWidth > elementToScroll.clientWidth) {
			if (distances.right < SCROLL_ZONE_PX) {
				scrollingHorizontally = true;
				scrollingInfo.directionObj = { x: 1, y: 0 };
				scrollingInfo.stepPx = calcScrollStepPx(distances.right);
			} else if (distances.left < SCROLL_ZONE_PX) {
				scrollingHorizontally = true;
				scrollingInfo.directionObj = { x: -1, y: 0 };
				scrollingInfo.stepPx = calcScrollStepPx(distances.left);
			}

			if (!isAlreadyScrolling && scrollingHorizontally) {
				scrollContainer(elementToScroll);
				return true;
			}
		}

		resetScrolling();
		return false;
	}

	return {
		scrollIfNeeded,
		resetScrolling
	};
}
