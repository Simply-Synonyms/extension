import { useSpring } from '@react-spring/core'
import { isLocalURL } from 'next/dist/next-server/lib/router/router'
import { useState } from 'preact/hooks'

// Minimum spacing between popup and edges of window
const WINDOW_MARGIN = 20
// Horizontal spacing between target and popup when adjusting position
const TARGET_MARGIN = 50

// Initial vertical spacing between target and top of popup
const TARGET_VERTICAL_PADDING = 20

export const POPUP_WIDTH = 350
const MIN_POPUP_HEIGHT = 300

const MINI_POPUP_BUTTON_SIZE = 45

const calculatePosition = (
  el: HTMLDivElement,
  targetPosition: [x: number, y: number],
  expanded: boolean
): [x: number, y: number] => {
  // Ensure that the popup doesn't overlap the target position, or the margin around the edge of the window

  // If there isn't room at bottom of window, move popup above target
  const above =
    targetPosition[1] + el.scrollHeight + TARGET_VERTICAL_PADDING >
    window.innerHeight - WINDOW_MARGIN
  let newY = above
    ? (expanded
        ? window.innerHeight - WINDOW_MARGIN
        : targetPosition[1] - TARGET_VERTICAL_PADDING) - el.scrollHeight
    : targetPosition[1] + TARGET_VERTICAL_PADDING

  // If there isn't room at right side of window, move popup to left of target
  const atLeft =
    targetPosition[0] + POPUP_WIDTH + TARGET_MARGIN >
    window.innerWidth - WINDOW_MARGIN
  let newX = atLeft
    ? targetPosition[0] - (expanded ? POPUP_WIDTH : el.scrollWidth)
    : targetPosition[0]

  if (expanded && targetPosition[1] + TARGET_VERTICAL_PADDING > newY) {
    // Move left/right to leave horizontal spacing between target and edge of popup if needed
    newX += atLeft ? -TARGET_MARGIN : TARGET_MARGIN
  }

  // If it's collapsed center it under the target
  if (!expanded) newX += -MINI_POPUP_BUTTON_SIZE / 2

  // Clamp values at top and left:
  return [Math.max(WINDOW_MARGIN, newX), Math.max(WINDOW_MARGIN, newY)]
}

// TODO review and fix this mess

export const useAnimatedPosition = (
  el: HTMLDivElement,
  isOpen: boolean,
  targetPosition: [x: number, y: number],
  expanded: boolean
): [styles: any, loaded: boolean, reposition: () => void] => {
  const [position, setPosition] = useState(targetPosition)
  const [loaded, setLoaded] = useState(false)

  // TODO useCallback ? 
  const styles = useSpring({
    immediate: !expanded,
    config: {
      tension: 300,
    },
    display: !el && 'none',
    left: position && `${Math.max(WINDOW_MARGIN, position[0])}px`,
    // right: el && position && targetPosition[0] + POPUP_WIDTH > window.innerWidth - WINDOW_MARGIN && `${
    //   window.innerWidth -
    //     position[0] -
    //     (expanded ? POPUP_WIDTH : (el.offsetWidth))
    // }px`,
    top:
      position &&
      targetPosition[1] + MIN_POPUP_HEIGHT <=
        window.innerHeight - WINDOW_MARGIN &&
      `${Math.max(WINDOW_MARGIN, position[1])}px`,
    bottom:
      el &&
      position &&
      targetPosition[1] + MIN_POPUP_HEIGHT >
        window.innerHeight - WINDOW_MARGIN &&
      `${Math.max(
        WINDOW_MARGIN,
        window.innerHeight - position[1] - el.scrollHeight
      )}px`,
    height:
      el && expanded
        ? Math.min(
            Math.max(MIN_POPUP_HEIGHT, el.scrollHeight),
            window.innerHeight - WINDOW_MARGIN * 2
          ) + 'px'
        : MINI_POPUP_BUTTON_SIZE + 'px',
    width: expanded ? POPUP_WIDTH + 'px' : MINI_POPUP_BUTTON_SIZE + 'px',
  })

  if (el && isOpen && targetPosition) {
    if (!loaded) setLoaded(true)
  } else if (loaded) setLoaded(false)

  return [
    styles,
    loaded,
    () => {
      if (el && isOpen && targetPosition) {
        const pos = calculatePosition(el, targetPosition, expanded)
        setPosition(pos)
      }
    },
  ]
}
