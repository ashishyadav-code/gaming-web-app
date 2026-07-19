// Smooth easing curve - feels premium and buttery
const smoothEase = [0.22, 1, 0.36, 1]
const bounceEase = [0.34, 1.56, 0.64, 1]

export const fadeUp = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: smoothEase },
    },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.3, ease: smoothEase } },
}

export const fadeIn = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: smoothEase } },
    exit: { opacity: 0, scale: 0.97, transition: { duration: 0.25 } },
}

export const stagger = {
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
}

export const cardVariant = {
    hidden: { opacity: 0, y: 16, scale: 0.96 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.45, ease: smoothEase },
    },
}

export const pageTransition = {
    initial: { opacity: 0, y: 14, scale: 0.99 },
    animate: {
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.45, ease: smoothEase }
    },
    exit: {
        opacity: 0, y: -8, scale: 0.99,
        transition: { duration: 0.3, ease: smoothEase }
    },
}

// Slide variants for tab switching
export const slideLeft = {
    hidden: { opacity: 0, x: 30, scale: 0.98 },
    visible: {
        opacity: 1, x: 0, scale: 1,
        transition: { duration: 0.4, ease: smoothEase }
    },
    exit: {
        opacity: 0, x: -30, scale: 0.98,
        transition: { duration: 0.25, ease: smoothEase }
    }
}

export const slideRight = {
    hidden: { opacity: 0, x: -30, scale: 0.98 },
    visible: {
        opacity: 1, x: 0, scale: 1,
        transition: { duration: 0.4, ease: smoothEase }
    },
    exit: {
        opacity: 0, x: 30, scale: 0.98,
        transition: { duration: 0.25, ease: smoothEase }
    }
}

// Scale up from center - for modals/popovers
export const scaleUp = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
        opacity: 1, scale: 1,
        transition: { duration: 0.35, ease: bounceEase }
    },
    exit: {
        opacity: 0, scale: 0.9,
        transition: { duration: 0.2 }
    }
}

// For list items that appear one by one
export const listItem = {
    hidden: { opacity: 0, x: -12 },
    visible: {
        opacity: 1, x: 0,
        transition: { duration: 0.35, ease: smoothEase }
    },
}

// Spring config for interactive elements
export const springTap = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
}
